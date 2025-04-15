import { Routes } from '@angular/router';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ExploreContainerComponent - A reusable container component
 * This standalone component can be used across different tabs
 * to provide consistent UI container elements
 */
@Component({
  selector: 'app-explore-container', // Custom HTML element tag
  templateUrl: './explore-container.component.html', // External HTML template
  styleUrls: ['./explore-container.component.scss'], // Styling for the component
  standalone: true, // Doesn't require NgModule
  imports: [CommonModule], // Required Angular common directives/pipes
})
export class ExploreContainerComponent {
  @Input() name?: string; // Optional input parameter to customize the container
}

/**
 * Application routing configuration
 * Defines the navigation structure for the weather app
 */
export const routes: Routes = [
  {
    path: '', // Root path
    redirectTo: 'tabs', // Redirect to tabs page when app loads
    pathMatch: 'full', // Exact path matching
  },
  {
    path: 'tabs', // Main tabs container route
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage), // Lazy loading of tabs component
    children: [
      // Nested routes within tabs
      {
        path: 'tab1', // First tab route
        loadComponent: () => import('./tab1/tab1.page').then((m) => m.Tab1Page), // Lazy load tab1
      },
      {
        path: 'tab2', // Second tab route
        loadComponent: () => import('./tab2/tab2.page').then((m) => m.Tab2Page), // Lazy load tab2
      },
      {
        path: 'tab3', // Third tab route
        loadComponent: () => import('./tab3/tab3.page').then((m) => m.Tab3Page), // Lazy load tab3
      },
      {
        path: '', // Default child route
        redirectTo: 'tab1', // Default to tab1 when tabs are loaded
        pathMatch: 'full', // Exact path matching
      },
    ],
  },
];
