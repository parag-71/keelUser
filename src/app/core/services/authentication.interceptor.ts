import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders
} from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { Router } from '@angular/router';
import { Util } from '../resource/utils';
import { LoaderService } from './loader.service';
import * as Global from '../resource/global';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
	utiObj = new Util();

  constructor(
    public loaderService:LoaderService,
    public router:Router
  ) {
  }
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Add authorization header with token if available
    const localToken = this.utiObj.getLoginUser() && this.utiObj.getLoginUser().token;
    if (localToken) {
      let header: any;
      if (
        request.url.indexOf(Global.addOrUpdateUser) != -1
      ) {
        header = request.headers.set('Authorization', `Bearer ${localToken}`);
        request.headers.append('Content-Type', 'multipart/form-data');
      } else {
        header = request.headers.set('Authorization', `Bearer ${localToken}`);
      }
      request = request.clone({ headers: header });
    }
    
    if (!request.url.includes('getUserAccess')) {
      this.loaderService.show();
    }
    
    return next.handle(request).pipe(
      finalize(() => {
        this.loaderService.hide();
      })
    );
  }
}
