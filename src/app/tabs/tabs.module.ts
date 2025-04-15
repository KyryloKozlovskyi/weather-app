import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { TabsPageRoutingModule } from './tabs-routing.module';

// TabsPageModule handles the app's tabbed navigation structure
@NgModule({
  imports: [IonicModule, CommonModule, TabsPageRoutingModule],
  declarations: [], // Components that belong to this module
})
export class TabsPageModule {}
