import { AuthService } from './authentication.service';
import { User } from './../models/user';
import { Injectable } from '@angular/core';
import { storage } from '../helpers/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {

  constructor(private authService: AuthService) { }

  isAuthorized(allowedRoles: string[]): boolean {
    // check if the list of allowed roles is empty, if empty, authorize the user to access the page
    if (allowedRoles == null || allowedRoles.length === 0) {
      return true;
    }

    // get token from local storage or state management
    const token = storage.getItem('access_token');
    let user: User;
    user = (token) ? this.authService.decodeToken(token).user : null;

    // check if it was decoded successfully, if not the token is not valid, deny access
    if (!user) {
      return false;
    }

    // check if the user roles is in the list of allowed roles, return true if allowed and false if not allowed
    return allowedRoles.includes(user.directions);
  }
}
