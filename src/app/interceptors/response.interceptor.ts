import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { EncryptionAES } from '../helpers/encryption-aes';

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      map(event => {
        if (event instanceof HttpResponse) {
          let data = event.body.data;
          if (data && environment.production) {
            data = EncryptionAES.decrypt(data)
          }
          event = event.clone({ body: data });
        }
        return event;
      })
    );
  }
}
