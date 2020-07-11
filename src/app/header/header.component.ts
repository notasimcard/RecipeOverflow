import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import * as AuthActions from '../auth/store/auth.action';
import * as fromAuth from '../State/app.reducer';
import * as RecipesActions from '../recipes/store/recipe.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnDestroy, OnInit {
  isAuthenticated = false;
  dataSub: Subscription;
  userSub: Subscription;

  constructor(
    private store: Store<fromAuth.AppState>) {
  }

  ngOnInit(): void {
    this.userSub = this.store
      .select('auth')
      .pipe(map(authState => authState.user))
      .subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  saveRecipes() {
    this.store.dispatch(new RecipesActions.StoreRecipes());
  }

  getRecipes() {
    this.store.dispatch(new RecipesActions.FetchRecipes());
  }

  ngOnDestroy(): void {
    this.dataSub.unsubscribe();
    this.userSub.unsubscribe();
  }

  onLogOut(): void {
    this.store.dispatch(new AuthActions.Logout());
  }
}
