import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab3Page } from './tab3.page';

// Define routes for Tab3 module
const routes: Routes = [
  {
    path: '', // Default route
    component: Tab3Page,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // Register routes
  exports: [RouterModule],
})
export class Tab3PageRoutingModule {}
