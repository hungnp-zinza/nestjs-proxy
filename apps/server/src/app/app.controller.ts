import {
  All,
  Controller,
  ForbiddenException,
  Next,
  Req,
  Res,
} from '@nestjs/common';
import proxy from 'express-http-proxy';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor() {
    // noop
  }

  @All('*')
  proxy(@Req() req: Request, @Res() res, @Next() next) {
    const targets = [
      {
        from: 'dev-to-proxy.hungnp.com',
        to: 'https://dev.to',
      },
      {
        from: 'markup-io-proxy.hungnp.com',
        to: 'https://www.figma.com',
      },
    ];
    const domain = req.hostname;
    const target = targets.find((t) => t.from === domain);
    if (!target) {
      throw new ForbiddenException('No proxy found!');
    }
    const httpProxy = proxy(target.to, {
      userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        userRes.removeHeader('x-frame-options');
        userRes.removeHeader('referrer-policy');
        userRes.removeHeader('x-xss-protection');
        userRes.removeHeader('x-permitted-cross-domain-policies');
        userRes.setHeader(
          'strict-transport-security',
          'max-age=15724800; includeSubDomains'
        );
        return proxyResData;
      },
    });
    httpProxy(req, res, next);
  }
}
