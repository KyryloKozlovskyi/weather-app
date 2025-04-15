import { NgModule, isDevMode } from '@angular/core'; // Core Angular functionality
import { BrowserModule } from '@angular/platform-browser'; // Essential module for browser-based apps
import { RouteReuseStrategy } from '@angular/router'; // For optimizing navigation performance
import { HttpClientModule } from '@angular/common/http'; // Provides HTTP client for API calls

import { IonicModule, IonicRouteStrategy } from '@ionic/angular'; // Ionic framework components

import { AppRoutingModule } from './app-routing.module'; // App-specific routing configuration
import { ServiceWorkerModule } from '@angular/service-worker'; // PWA support for offline functionality

@NgModule({
  declarations: [], // Component, directive, and pipe declarations (currently empty)
  imports: [
    BrowserModule, // Required for Angular apps running in browsers
    IonicModule.forRoot(), // Initialize Ionic with default configuration
    AppRoutingModule, // Import routing configuration
    HttpClientModule, // Enable HTTP requests for weather data
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(), // Enable service worker only in production mode
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }], // Use Ionic's route strategy
})
export class AppModule {} // Root module that bootstraps the application
