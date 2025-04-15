import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponent } from './explore-container.component';

/**
 * Module for the ExploreContainer component
 *
 * This module encapsulates all dependencies needed for the ExploreContainer
 * and makes the component available to other modules that import it.
 */
@NgModule({
  // Required Angular and Ionic modules for this component
  imports: [CommonModule, FormsModule, IonicModule],
  // Component declarations owned by this module
  declarations: [ExploreContainerComponent],
  // Makes the component available to other modules
  exports: [ExploreContainerComponent],
})
export class ExploreContainerComponentModule {}
