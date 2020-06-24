import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { RecipeService } from '../recipes/recipe.service';
import { User } from './user.model';

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = new BehaviorSubject<User>(null);
  tokenExpirationCounter: any;

  constructor(private http: HttpClient, private router: Router, private recipeService: RecipeService) {
  }

  signUp(userEmail: string, userPassword: string) {
    return this.http.post<AuthResponseData>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIkey,
      {
        email: userEmail,
        password: userPassword,
        returnSecureToken: true
      })
      .pipe(
        catchError(this.handleError),
        tap(resData => {
          this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
        })
      );
  }

  logIn(userEmail: string, userPassword: string) {
    return this.http.post<AuthResponseData>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIkey,
      {
        email: userEmail,
        password: userPassword,
        returnSecureToken: true
      })
      .pipe(
        catchError(this.handleError),
        tap(resData => {
          this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
        })
      );
  }

  autoLogin() {
    const userData: {
      email: string,
      id: string,
      _token: string,
      _tokenExpiresIn: string
    } = JSON.parse(localStorage.getItem('userData'));

    if (!userData) {
      return;
    }

    const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpiresIn));

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const tokenExpirationDuration = new Date(userData._tokenExpiresIn).getTime() - new Date().getTime();
      this.autoLogout(tokenExpirationDuration);
    }
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/auth']);
    this.recipeService.setRecipes([]);
    localStorage.removeItem('userData');
    if (this.tokenExpirationCounter) {
      clearTimeout(this.tokenExpirationCounter);
    }
    this.tokenExpirationCounter = null;
  }

  autoLogout(tokenExpirationDuration: number) {
    this.tokenExpirationCounter = setTimeout(() => {
      this.logout();
    }, tokenExpirationDuration);
  }

  handleAuthentication(email: string, userId: string, token: string, expiresIn: number) {
    const tokenExpirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const newUser = new User(email, userId, token, tokenExpirationDate);
    this.user.next(newUser);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(newUser));
  }

  handleError(errorRes: HttpErrorResponse) {
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
    }
    return throwError(customErrorMessage);
  }
}

