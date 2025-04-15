// Import the function to bootstrap the Angular application
import { bootstrapApplication } from '@angular/platform-browser';
// Import the root component of the application
import { AppComponent } from './app/app.component';
// Import helper function to include providers from modules
import { importProvidersFrom } from '@angular/core';
// Import the main module of the application
import { AppModule } from './app/app.module';

// Bootstrap the Angular application with AppComponent as the root component
bootstrapApplication(AppComponent, {
  // Include all providers from AppModule in the standalone component
  providers: [importProvidersFrom(AppModule)],
}).catch((err) => console.error(err)); // Log any errors that occur during bootstrap
