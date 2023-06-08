import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EncryptionAES } from '../helpers/encryption-aes';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class PostInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.method !== 'GET' && environment.production) {
      return of(EncryptionAES.encrypt(request.body)).pipe(
        switchMap(encrypt => {
          request = request.clone({ body: { data: encrypt } });
          return next.handle(request);
        })
      );
    }
    return next.handle(request);
  }
}
