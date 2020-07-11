import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../State/app.reducer';
import * as AuthActions from './store/auth.action';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenExpirationCounter: any;

  constructor(private store: Store<fromApp.AppState>) {
  }

  setLogoutTimer(tokenExpirationDuration: number) {
    this.tokenExpirationCounter = setTimeout(() => {
      this.store.dispatch(new AuthActions.Logout());
    }, tokenExpirationDuration);
  }

  clearLogoutTimer() {
    if (this.tokenExpirationCounter) {
      clearTimeout(this.tokenExpirationCounter);
      this.tokenExpirationCounter = null;
    }
  }
}
