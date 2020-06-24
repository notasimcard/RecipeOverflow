import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/recipes',
    pathMatch: 'full'
  },
  {
    path: 'recipes',
    // loadChildren: './recipes/recipes.module#RecipesModule' #old way
    loadChildren: () => import('./recipes/recipes.module').then(module => module.RecipesModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(module => module.AuthModule)
  },
  {
    path: 'shopping-list',
    loadChildren: () => import('./shopping-list/shopping-list.module').then(module => module.ShoppingListModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
