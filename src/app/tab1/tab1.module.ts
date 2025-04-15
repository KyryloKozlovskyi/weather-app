/**
 * Module for the Current Weather tab
 * Serves as a wrapper for the Tab1Page standalone component
 */
import { NgModule } from '@angular/core';
import { Tab1Page } from './tab1.page';
import { Tab1PageRoutingModule } from './tab1-routing.module';

@NgModule({
  imports: [
    Tab1PageRoutingModule, // Handles routing for this tab
    Tab1Page, // Standalone component
  ],
  declarations: [], // Empty because Tab1Page is standalone
})
export class Tab1PageModule {}
