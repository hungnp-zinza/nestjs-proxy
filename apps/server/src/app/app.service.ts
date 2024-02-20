import { ForbiddenException, Injectable } from '@nestjs/common';
import { MarkupDomainDto } from './markup-domain.dto';
import slugify from 'slugify';

@Injectable()
export class AppService {
  domains: TargetDomain[] = [];

  markupDomain(data: MarkupDomainDto): { from: string; to: string } {
    let fromHostname: string;
    let toDomain: string;
    try {
      fromHostname = slugify(this.getHostname(data.domain), {
        remove: /[*+~.()'"!:@]/g,
      });
      toDomain = this.getHostname(data.domain);
    } catch (e) {
      throw new ForbiddenException('Invalid domain!');
    }

    this.domains[fromHostname] = `https://${toDomain}`;

    return {
      from: `https://${fromHostname}${process.env.NEXT_PUBLIC_PROXY_SUBDOMAIN}`,
      to: toDomain,
    };
  }

  getHostname(domain: string) {
    let _url = domain;
    if (!_url.startsWith('http')) {
      _url = `https://${_url}`;
    }
    return new URL(_url).hostname;
  }
}
