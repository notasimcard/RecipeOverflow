import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from '../shopping-list/shopping-list.service';
import { Recipe } from './recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  recipesChanged = new Subject<Recipe[]>();

  constructor(private shoppingListService: ShoppingListService) {
  }

  private recipes: Recipe[] = [];

  getRecipes() {
    return this.recipes.slice();
  }

  getRecipe(index: number) {
    return this.recipes[index];
  }

  addIngredientsFromRecipeDetail(ingredients: Ingredient[]) {
    this.shoppingListService.addIngredientsFromRecipe(ingredients);
  }

  addRecipe(recipe: Recipe) {
    this.recipes.push(recipe);
    this.recipesChanged.next(this.recipes.slice());
  }

  updateRecipe(index: number, newRecipe: Recipe) {
    this.recipes[index] = newRecipe;
    this.recipesChanged.next(this.recipes.slice());
  }

  deleteRecipe(index: number) {
    this.recipes.splice(index, 1);
    this.recipesChanged.next(this.recipes.slice());
  }

  setRecipes(recipes: Recipe[]) {
    this.recipes = recipes;
    this.recipesChanged.next(this.recipes.slice());
  }

  get isEmpty() {
    return this.recipes.length === 0;
  }
}


