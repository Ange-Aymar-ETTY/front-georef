import { CustomExceptionMessage } from './../helpers/custom-exception-message';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, timeout } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { APIResponse } from '../helpers/interface';

@Injectable({
  providedIn: 'root'
})
export class SendService {
  private timeout = 300000; // 60s
  private apiBaseUrl = environment.apiUrl;

  constructor(public http: HttpClient) { }

  post(_data: any, _service: string): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/${_service}`, { data: _data })
      .pipe(
        map(res => res as APIResponse),
        timeout(this.timeout),
        catchError(err => this.error(err))
      );
  }


  get(_service: string) {
    const headers = new HttpHeaders('application/x-www-form-urlencoded');

    return this.http.get(`${this.apiBaseUrl}/${_service}`, { headers })
      .pipe(
        map(res => res as APIResponse),
        timeout(this.timeout),
        catchError(err => this.error(err))
      );
  }

  postFile(_data: FormData, _service: string) {
    return this.http.post(`${this.apiBaseUrl}/${_service}`, _data, { reportProgress: true, observe: 'events' })
      .pipe(
        catchError(err => this.error(err))
      );
  }

  error(err) {
    console.log(err);

    if (err.status === 0) {
      return throwError(CustomExceptionMessage.getExceptionInternet());
    } else if (err.status > 400 && err.status !== 504) {
      return throwError(CustomExceptionMessage.getExceptionTechnique());
    } else {
      return throwError(CustomExceptionMessage.getExceptionTimeout());
    }
  }

}
