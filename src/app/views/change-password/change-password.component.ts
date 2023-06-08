import { Constantes } from 'src/app/helpers/constantes';
import { PasswordValidator } from './../../validators/password-validator';
import { AuthService } from './../../services/authentication.service';
import { APIResponse } from '../../helpers/interface';
import { UserService } from './../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Utilities } from 'src/app/helpers/utilities';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})

export class ChangePasswordComponent implements OnInit {
  changePswdForm: FormGroup;
  isFirstConnexion = false;
  hideOld = true;
  hideNew = true;
  messagePasswordError: string;
  validationMessages = Constantes.validationMessages;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private auth: AuthService) {

    this.changePswdForm = this.fb.group({
      id: [''],
      nom_prenoms: new FormControl({ value: '', disabled: true }),
      ancien_pwd: new FormControl('', [Validators.required]),
      nouveau_pwd: new FormControl('', [Validators.required, PasswordValidator]),
    }, {
      validator: this.checkPassword.bind(this)
    });

    this.activatedRoute.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.isFirstConnexion = true;
      }
    });

    this.auth.currentUser.subscribe(data => {
      if (data) {
        this.changePswdForm.get('id').setValue(data.id);
        this.changePswdForm.get('nom_prenoms').setValue(`${data.nom_prenoms}`);
      }
    });
  }

  ngOnInit() {
  }

  checkPassword(formGroup: FormGroup) {
    const { ancien_pwd, nouveau_pwd } = formGroup.value;

    if (formGroup.get('nouveau_pwd').errors) {
      return;
    }

    if (ancien_pwd === nouveau_pwd) {
      formGroup.get('nouveau_pwd').setErrors({ passwordMatch: true });
      this.messagePasswordError = 'Les mots de passe sont identiques';
    } else {
      formGroup.get('nouveau_pwd').setErrors(null);
    }
  }

  checkPwdValidity() {
    Utilities.Notification.emitEvent('loadingOn', 'Modification en cours');
    this.userService.changePassword(this.changePswdForm.value)
      .pipe(finalize(() => Utilities.Notification.emitEvent('loadingOff')))
      .subscribe((data: APIResponse) => {
        if (!data.error) {
          Utilities.Notification.emitEvent('show-toaster', data.message);
          this.router.navigate(['/']);
        } else {
          Utilities.Notification.emitEvent('show-toaster-fail', data.message);
        }
      }, () => {
        Utilities.Notification.emitEvent('show-toaster-fail', `Une erreur s'est produite. Veuillez réessayez !`);
      });
  }
}
