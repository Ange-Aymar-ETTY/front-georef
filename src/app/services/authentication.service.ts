import { SendService } from './send.service';
import { User } from './../models/user';
import { map, retry } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, of } from 'rxjs';
import { storage } from '../helpers/storage';
import { APIResponse } from '../helpers/interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private jwtHelper: JwtHelperService, private sendService: SendService) { }

  get loggedIn(): boolean {
    return (storage.getItem('access_token') !== undefined);
  }

  login(data: any) {
    return this.sendService.post(data, 'api/auth')
      .pipe(
        retry(3),
        map((res: APIResponse) => {
          if (!res.error) {
            const user = this.decodeToken(res.data).user;

            storage.setItem('access_token', res.data);
            return { error: false, user };
          }
          return { error: true, message: res.message };
        })
      );
  }

  logout() {
    storage.removeItem('access_token');
  }

  /**
   * @method isAuthenticated
   * @description Vérifie que l'utilisateur est bien connecté et que son token n'a pas expiré
   */
  public isAuthenticated(): boolean {
    const token = storage.getItem('access_token');
    if (token == undefined) return false;

    if (this.jwtHelper.isTokenExpired(token)) {
      this.logout();
      return false;
    }
    return true;
  }

  public decodeToken(token: any) {
    return this.jwtHelper.decodeToken(token);
  }

  public get currentUser(): Observable<User> {
    const token = storage.getItem('access_token');

    if (token) {
      return of(this.decodeToken(token).user);
    }

    return of(null);
  }
}
