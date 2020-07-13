import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, switchMap } from 'rxjs/operators';
import * as ShoppingListAction from '../../shopping-list/store/shopping-list.actions';
import * as fromApp from '../../State/app.reducer';
import * as RecipesActions from '../store/recipe.actions';

import { Recipe } from '../recipe.model';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe;
  recipeIndex: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.AppState>
  ) {
  }

  ngOnInit() {
    this.route.params.pipe(
      map(params => +params.index),
      switchMap((id: number) => {
        this.recipeIndex = id;
        return this.store.select('recipes');
      }),
      map(recipesState => recipesState.recipes[this.recipeIndex]))
      .subscribe(recipe => {
        this.recipe = recipe;
      });
  }

  onAddToShoppingList() {
    this.store.dispatch(new ShoppingListAction.AddIngredients(this.recipe.ingredients));
  }

  onDelete() {
    this.store.dispatch(new RecipesActions.DeleteRecipe(this.recipeIndex));
    this.router.navigate(['/recipes']);
  }
}
