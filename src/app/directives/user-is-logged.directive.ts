import { Router } from '@angular/router';
import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appUserIsLogged]'
})
export class UserIsLoggedDirective {

  constructor(element: ElementRef, router: Router) {

    if ((window.location.href.indexOf('dashboard') > 0 || window.location.href.indexOf('connexion') > 0 || window.location.href.indexOf('password-forget') > 0 )) {
      // Suppression de l'élément du DOM si l'utilisateur n'est pas connecté
      const elementHtml: HTMLElement = element.nativeElement;
      elementHtml.parentElement.removeChild(elementHtml);
    }
  }
}
