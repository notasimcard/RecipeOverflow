import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';
import { User } from '../user.model';
import * as AuthActions from './auth.action';


export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

export interface UserData {
  email: string;
  id: string;
  _token: string;
  _tokenExpiresIn: Date;
}

const handleAuthentication = (userEmail: string, userId: string, userToken: string, expiresIn: number) => {
  const tokenExpirationDate = new Date(new Date().getTime() + +expiresIn * 1000);
  const user = new User(userEmail, userId, userToken, tokenExpirationDate);
  localStorage.setItem('userData', JSON.stringify(user));

  return new AuthActions.AuthenticateSuccess({
    email: userEmail,
    id: userId,
    token: userToken,
    expirationDate: tokenExpirationDate,
    redirect: true
  });
};

const handleError = (errorRes) => {
  let customErrorMessage = 'Unknown Error occurred.';
  if (errorRes.error && errorRes.error.error) {
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        customErrorMessage = 'Email already exists. Please log in.';
        break;
      case 'OPERATION_NOT_ALLOWED':
        customErrorMessage = 'Password sign up is disabled. Please check your email.';
        break;
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        customErrorMessage = 'Too many attempts. Please try again later.';
        break;
      case 'EMAIL_NOT_FOUND':
        customErrorMessage = 'Email is not registered. Please Sign Up.';
        break;
      case 'INVALID_PASSWORD':
        customErrorMessage = 'Your password is incorrect';
        break;
      case 'USER_DISABLED':
        customErrorMessage = 'The user account has been disabled.';
    }
    return of(new AuthActions.AuthenticateFail(customErrorMessage));

  }
};

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
  }

  @Effect()
  authLogin = this.actions$.pipe(
    ofType(AuthActions.LOGIN_START),
    switchMap((authData: AuthActions.LoginStart) => {
      return this.http.post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIkey,
        {
          email: authData.payload.email,
          password: authData.payload.password,
          returnSecureToken: true
        })
        .pipe(
          tap( resData => {
            this.authService.setLogoutTimer(+resData.expiresIn * 1000);
          }),
          map(resData => {
            return handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
          }),
          catchError(errorRes => {
            return handleError(errorRes);
          })
        );
    })
  );
  @Effect()
  authSignUp = this.actions$.pipe(
    ofType(AuthActions.SIGNUP_START),
    switchMap((authData: AuthActions.SignUpStart) => {
      return this.http.post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIkey,
        {
          email: authData.payload.email,
          password: authData.payload.password,
          returnSecureToken: true
        })
        .pipe(
          tap( resData => {
            this.authService.setLogoutTimer(+resData.expiresIn);
          }),
          map(resData => {
            return handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
          }),
          catchError(err => {
            return handleError(err);
          })
        );
    })
  );
  @Effect({dispatch: false})
  authRedirect = this.actions$.pipe(
    ofType(AuthActions.AUTHENTICATE_SUCCESS),
    tap((authSuccessActions: AuthActions.AuthenticateSuccess) => {
      if (authSuccessActions.payload.redirect) {
        this.router.navigate(['/']);
      }
    })
  );
  @Effect()
  authAutoLogin = this.actions$.pipe(
    ofType(AuthActions.AUTO_LOGIN),
    map(() => {
      const userData: UserData = JSON.parse(localStorage.getItem('userData'));
      if (!userData) {
        // Dummy Type
        return { type: 'DUMMY_TYPE'};
      }
      if (userData._token) {
        const expirationDuration = new Date(userData._tokenExpiresIn).getTime() - new Date().getTime();
        this.authService.setLogoutTimer(expirationDuration);
        return new AuthActions.AuthenticateSuccess({
          email: userData.email,
          id: userData.id,
          token: userData._token,
          expirationDate: new Date(userData._tokenExpiresIn),
          redirect: false
        });
      }
      // Dummy Type
      return { type: 'DUMMY_TYPE'};
    })
  );

  @Effect( { dispatch: false })
  authLogout = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    tap(() => {
      this.authService.clearLogoutTimer();
      localStorage.removeItem('userData');
      this.router.navigate(['/auth']);
    })
  );
}
