import { NgModule } from '@angular/core';
import { Tab1Page } from './tab1.page';
import { Tab1PageRoutingModule } from './tab1-routing.module';

@NgModule({
  imports: [
    Tab1PageRoutingModule,
    Tab1Page, // Import the standalone component
  ],
  declarations: [], // No declarations since Tab1Page is standalone
})
export class Tab1PageModule {}
