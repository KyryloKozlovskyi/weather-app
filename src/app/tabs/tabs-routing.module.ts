import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

// Define the routing configuration for the tabs feature
const routes: Routes = [
  {
    path: 'tabs', // Base path for all tab-related routes
    component: TabsPage, // Main container component for the tabs
    children: [
      {
        path: 'tab1', // Route for first tab: /tabs/tab1
        loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule) // Lazy loads Tab1 module
      },
      {
        path: 'tab2', // Route for second tab: /tabs/tab2
        loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule) // Lazy loads Tab2 module
      },
      {
        path: 'tab3', // Route for third tab: /tabs/tab3
        loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule) // Lazy loads Tab3 module
      },
      {
        path: '', // Default child route when navigating to /tabs
        redirectTo: '/tabs/tab1', // Redirects to tab1 by default
        pathMatch: 'full' // Ensures exact path match for redirect
      }
    ]
  },
  {
    path: '', // Application root path
    redirectTo: '/tabs/tab1', // Redirects to tab1 as the default landing page
    pathMatch: 'full' // Ensures exact path match for redirect
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // Register routes as child routes
  exports: [RouterModule] // Make RouterModule available to components in this feature module
})
export class TabsPageRoutingModule {} // Routing module for the tabs feature
