import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { exhaustMap, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { Recipe } from '../recipe.model';
import * as RecipesAction from './recipe.actions';
import * as fromApp from '../../State/app.reducer';

@Injectable()
export class RecipesEffects {
  @Effect( )
  fetchRecipe = this.actions$.pipe(
    ofType(RecipesAction.FETCH_RECIPES),
    switchMap(() => {
      return this.http.get<Recipe[]>(
        'https://recipe-app-d3643.firebaseio.com/recipes.json',
      );
    }),
    map(recipes => {
      return recipes.map(recipe => {
        return {
          ...recipe,
          ingredients: recipe.ingredients ? recipe.ingredients : []
        };
      });
    }),
    map(recipes => {
      return new RecipesAction.SetRecipes(recipes);
    })
  );

  @Effect( {dispatch: false})
  storeRecipes = this.actions$.pipe(
    ofType(RecipesAction.STORE_RECIPES),
    withLatestFrom(this.store.select('recipes')),
    switchMap(([actionData , recipesState]) => {
      return this.http.put<Recipe>(
        'https://recipe-app-d3643.firebaseio.com/recipes.json',
        recipesState.recipes
      );
    })
  );
  constructor(private actions$: Actions, private http: HttpClient, private store: Store<fromApp.AppState>) {
  }
}
