import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab2Page } from './tab2.page';

/**
 * Route configuration for the Forecast tab
 */
const routes: Routes = [
  {
    path: '', // Default route
    component: Tab2Page,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // Configure child routes
  exports: [RouterModule], // Make RouterModule available
})
export class Tab2PageRoutingModule {} // Forecast tab routing
