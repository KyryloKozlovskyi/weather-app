import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

// Main app routes configuration
const routes: Routes = [
  {
    path: '', // Root path
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
    // Lazy loads the TabsPageModule
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
    // Sets up router with preloading strategy
  ],
  exports: [RouterModule] // Makes router available to other modules
})
export class AppRoutingModule {}
