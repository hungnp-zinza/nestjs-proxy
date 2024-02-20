import {
  All,
  Body,
  Controller,
  ForbiddenException,
  Next,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import proxy from 'express-http-proxy';
import { Request, Response, NextFunction } from 'express';
import { MarkupDomainDto } from './markup-domain.dto';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private appService: AppService) {
    // noop
  }

  @Post('markup-domain')
  markupDomain(@Body() data: MarkupDomainDto) {
    return this.appService.markupDomain(data);
  }

  @All('*')
  proxy(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const fromHostname = req.hostname.split(
      process.env.NEXT_PUBLIC_PROXY_SUBDOMAIN
    )[0];
    const toDomain = this.appService.domains[fromHostname];

    if (!toDomain) {
      throw new ForbiddenException('No proxy found!');
    }
    const httpProxy = proxy(toDomain, {
      userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        const contentType = userRes.getHeader('content-type') || '';
        let resData = proxyResData;
        if (contentType.toString().includes('text/html')) {
          const htmlContent = Buffer.from(proxyResData).toString('utf-8');
          const splitHead = htmlContent.split('<head>');
          if (splitHead.length > 1) {
            splitHead[0] = `${splitHead[0]}
              <script src="${process.env.NEXT_PUBLIC_CLIENT_URL}/proxy.js" charset="UTF-8"></script>
              <link rel="stylesheet" href="${process.env.NEXT_PUBLIC_CLIENT_URL}/proxy.css">
            `;
            resData = Buffer.from(splitHead.join('<head>'));
          }
        }
        userRes.removeHeader('x-frame-options');
        userRes.removeHeader('referrer-policy');
        userRes.removeHeader('x-xss-protection');
        userRes.removeHeader('x-permitted-cross-domain-policies');
        userRes.setHeader(
          'strict-transport-security',
          'max-age=15724800; includeSubDomains'
        );
        return resData;
      },
    });
    httpProxy(req, res, next);
  }
}
