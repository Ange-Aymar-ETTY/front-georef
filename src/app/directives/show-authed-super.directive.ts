import { User } from './../models/user';
import { AuthService } from './../services/authentication.service';
import { Directive, TemplateRef, ViewContainerRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appShowAuthedSuper]'
})
export class ShowAuthedSuperDirective implements OnInit {

  constructor(private templateRef: TemplateRef<any>, private _authService: AuthService, private viewContainer: ViewContainerRef) { }
  condition: boolean;

  @Input() set appShowAuthedSuper(condition: boolean) {
    this.condition = condition;
  }

  ngOnInit(): void {
    this._authService.currentUser.subscribe((user: User) => {
      if (user?.directions == 'SUPER' && this.condition || user == null && !this.condition) {
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}
