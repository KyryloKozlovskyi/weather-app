import { ApplicationConfig } from '@angular/core';            // Imports the ApplicationConfig interface for app configuration
import { provideRouter } from '@angular/router';              // Imports function to configure the router
import { provideHttpClient } from '@angular/common/http';     // Imports function to configure HttpClient
import { routes } from './app.routes';                        // Imports the route configuration from local file

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),                                    // Configures Angular router with defined routes
    provideHttpClient(),                                      // Configures HttpClient for making API requests
  ],
};
