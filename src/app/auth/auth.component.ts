import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthResponseData, AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  isLoginMode = true;
  isLoading = false;
  mode1 = 'Login';
  mode2 = 'Sign Up';
  authForm: FormGroup;
  error = null;

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit() {
    this.initAuthForm();
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
    [this.mode1, this.mode2] = [this.mode2, this.mode1];
  }

  onSubmit() {
    if (this.authForm.invalid) {
      return;
    }
    this.isLoading = true;
    const userEmail = this.authForm.value.email;
    const userPassword = this.authForm.value.password;

    let authObs: Observable<AuthResponseData>;

    if (this.isLoginMode) {
      authObs = this.authService.logIn(userEmail, userPassword);
    } else {
      authObs = this.authService.signUp(userEmail, userPassword);
    }

    authObs.subscribe(
      () => {
        this.isLoading = false;
        this.router.navigate(['/recipes']);
      },
      errorMsg => {
        this.error = errorMsg;
        this.isLoading = false;
      }
    );
    this.authForm.reset();
  }

  onClose() {
    this.error = null;
  }

  initAuthForm() {
    this.authForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)])
    });
  }
}
