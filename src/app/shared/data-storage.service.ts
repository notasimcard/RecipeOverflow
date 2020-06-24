import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Recipe } from '../recipes/recipe.model';
import { RecipeService } from '../recipes/recipe.service';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  constructor(private http: HttpClient, private recipeService: RecipeService, private authService: AuthService) {
  }

  saveRecipes() {
    const recipes = this.recipeService.getRecipes();
    this.http.put<Recipe>(
      'https://recipe-app-d3643.firebaseio.com/recipes.json',
      recipes
    ).subscribe();
  }

  getRecipes() {
    return this.http.get<Recipe[]>(
      'https://recipe-app-d3643.firebaseio.com/recipes.json',
    ).pipe(
      map(recipes => {
        return recipes.map(recipe => {
          return {
            ...recipe,
            ingredients: recipe.ingredients ? recipe.ingredients : []
          };
        });
      }),
      tap(recipes => {
        this.recipeService.setRecipes(recipes);
      })
    );
  }
}
