import { IonicModule } from '@ionic/angular'; // Import Ionic UI components
import { NgModule } from '@angular/core'; // Angular core module decorator
import { CommonModule } from '@angular/common'; // Provides common Angular directives and pipes
import { FormsModule } from '@angular/forms'; // Provides template-driven forms functionality
import { Tab3Page } from './tab3.page'; // Import the Tab3 page component
import { Tab3PageRoutingModule } from './tab3-routing.module'; // Import routing configuration

@NgModule({
  imports: [
    IonicModule, // Ionic UI components
    CommonModule, // Angular common directives
    FormsModule, // Form handling
    Tab3PageRoutingModule // Tab3-specific routes
  ],
  // No declarations needed since Tab3Page is now standalone
})
export class Tab3PageModule {}
