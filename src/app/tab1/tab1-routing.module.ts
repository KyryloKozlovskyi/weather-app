import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab1Page } from './tab1.page';

/**
 * Route configuration for the Current Weather tab
 * Maps the empty path to the Tab1Page component
 */
const routes: Routes = [
  {
    path: '', // Default route when navigating to this module
    component: Tab1Page, // The component to display
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // Configure child routes for lazy loading
  exports: [RouterModule], // Make RouterModule available to parent modules
})
export class Tab1PageRoutingModule {} // Imported by Tab1PageModule
