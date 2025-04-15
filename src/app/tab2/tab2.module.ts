import { IonicModule } from '@ionic/angular'; // UI components from Ionic
import { NgModule } from '@angular/core'; // Core Angular module decorator
import { CommonModule } from '@angular/common'; // Angular common directives (ngIf, ngFor)
import { FormsModule } from '@angular/forms'; // Form handling capabilities
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module'; // Shared container component
import { Tab2PageRoutingModule } from './tab2-routing.module'; // Tab2 routing configuration

/**
 * Module for the Forecast tab
 */
@NgModule({
  imports: [
    IonicModule, // Provides Ionic UI components
    CommonModule, // Provides Angular common directives
    FormsModule, // Enables form functionality
    ExploreContainerComponentModule, // Shared content container
    Tab2PageRoutingModule, // Routing configuration for this tab
  ],
})
export class Tab2PageModule {} // Imported by app-routing for tab navigation
