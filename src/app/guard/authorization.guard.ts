import { AuthorizationService } from '../services/authorization.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationGuard implements CanActivateChild {
  constructor(private authorizationService: AuthorizationService, private router: Router) { }

  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const allowedRoles = next.data.allowedRoles;
    const isAuthorized = this.authorizationService.isAuthorized(allowedRoles);

    if (!isAuthorized) {
      this.router.navigate(['accessdenied']);
    }

    return isAuthorized;
  }
}
