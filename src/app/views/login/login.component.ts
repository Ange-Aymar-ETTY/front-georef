import { AuthService } from './../../services/authentication.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @ViewChild('password') password: ElementRef;
  authForm: FormGroup;
  returnUrl: string;
  errorMessage: string;
  pwdVisible = false;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {
    if (this.authService.loggedIn) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.errorMessage = '';
    this.authForm = new FormGroup({
      login: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  showPassword() {
    this.pwdVisible = !this.pwdVisible;
    this.password.nativeElement.type = this.pwdVisible ? 'text' : 'password';
  }

  seConnecter(): void {
    const credentials = this.authForm.value;

    this.authService.login(credentials).subscribe(data => {
      if (!data.error) {
        if (data.user.first_connexion) {
          this.router.navigate(['/change-password'], { state: { isFirstConnexion: true } });
          return;
        }
        this.router.navigate([this.returnUrl]);
      } else {
        this.errorMessage = data.message;
      }
    }, e => this.errorMessage = e.Text);
  }
}
