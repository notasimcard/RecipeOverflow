import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import * as fromApp from '../State/app.reducer';
import * as AuthActions from './store/auth.action';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnDestroy, OnInit {
  isLoginMode = true;
  isLoading = false;
  mode1 = 'Login';
  mode2 = 'Sign Up';
  authForm: FormGroup;
  error = null;
  storeSub: Subscription;

  constructor(private store: Store<fromApp.AppState>) {
  }

  ngOnInit() {
    this.storeSub = this.store.select('auth').subscribe(authState => {
      this.isLoading = authState.isLoading;
      this.error = authState.authError;
    });
    this.initAuthForm();
  }

  ngOnDestroy() {
    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
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


    if (this.isLoginMode) {
      this.store.dispatch(new AuthActions.LoginStart({email: userEmail, password: userPassword}));
    } else {
      this.store.dispatch(new AuthActions.SignUpStart({email: userEmail, password: userPassword}));
    }
    this.authForm.reset();
  }

  onClose() {
    this.store.dispatch(new AuthActions.ClearError());
  }

  initAuthForm() {
    this.authForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)])
    });
  }
}
