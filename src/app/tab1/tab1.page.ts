/**
 * Current Weather Tab Component
 *
 * This component displays the current weather for a location, supporting:
 * - Location detection
 * - Offline/online detection with cached data
 * - UI feedback with loading states and error handling
 * - Pull-to-refresh functionality
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonChip,
  IonLabel,
  IonIcon,
  ToastController,
  IonButton,
} from '@ionic/angular/standalone'; // Importing standalone Ionic components
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { cloudOfflineOutline } from 'ionicons/icons'; // Icon for offline status
import { WeatherService } from '../services/weather.service'; // Service for fetching weather data
import { LocationService } from '../services/location.service'; // Service for handling user location
import { SettingsService } from '../services/settings.service'; // Service for user preferences
import { ReverseGeocodingService } from '../services/reverse-geocoding.service'; // Service for converting coords to place names
import { Subscription } from 'rxjs'; // For managing subscription cleanup

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true, // Angular standalone component (doesn't require NgModule)
  imports: [
    CommonModule, // For ngIf, ngFor, etc.
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonSpinner, // For loading indicator
    IonChip, // For offline indicator
    IonLabel,
    IonIcon,
    IonButton, // For retry button
  ],
})
export class Tab1Page implements OnInit, OnDestroy {
  // State properties
  public isOffline: boolean = false; // Tracks online/offline status
  public currentWeather: any; // Stores weather data from API
  public loading: boolean = true; // Controls loading state UI
  public error: string | null = null; // Stores error messages
  public location: any; // Stores location data (name, lat, lon)
  private locationSubscription: Subscription | undefined; // For cleanup in ngOnDestroy

  /**
   * Component constructor
   * Injects required services and sets up icons
   */
  constructor(
    public weatherService: WeatherService, // For fetching weather data
    private locationService: LocationService, // For getting user location
    private reverseGeocodingService: ReverseGeocodingService, // For getting location names
    private settingsService: SettingsService, // For user preferences (units)
    private toastController: ToastController // For showing toast notifications
  ) {
    // Register the offline status icon
    addIcons({ cloudOfflineOutline });
  }

  /**
   * Lifecycle hook: Component initialization
   * Sets up event listeners and loads initial data
   */
  ngOnInit() {
    // Set up network status monitoring
    window.addEventListener('online', this.handleOnlineStatusChange);
    window.addEventListener('offline', this.handleOnlineStatusChange);

    // Check initial network status
    this.isOffline = !navigator.onLine;

    // Load weather data for the first time
    this.loadInitialData();

    // Subscribe to location changes from the location service
    // This lets the component react when location is changed elsewhere in the app
    this.locationSubscription = this.locationService.locationChanged$.subscribe(
      (location) => {
        if (location) {
          // Update location and reload weather data
          this.location = location;
          this.loadWeatherData();
          this.showToast(`Weather updated for ${location.name}`);
        } else {
          // Handle case where location was cleared
          this.loading = false;
          this.error = 'No location selected';
          this.location = null;
        }
      }
    );
  }

  /**
   * Lifecycle hook: Component destruction
   * Cleans up resources to prevent memory leaks
   */
  ngOnDestroy() {
    // Remove event listeners
    window.removeEventListener('online', this.handleOnlineStatusChange);
    window.removeEventListener('offline', this.handleOnlineStatusChange);

    // Unsubscribe from location changes
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
  }

  /**
   * Handler for online/offline status changes
   * Updates UI and refreshes data when coming back online
   */
  private handleOnlineStatusChange = () => {
    const wasOffline = this.isOffline;
    this.isOffline = !navigator.onLine;

    if (wasOffline && !this.isOffline) {
      // Just came back online - refresh data
      this.showToast('You are back online. Refreshing data...');
      this.loadWeatherData();
    } else if (!wasOffline && this.isOffline) {
      // Just went offline - show notification
      this.showToast('You are offline. Showing cached data.');
    }
  };

  /**
   * Displays a toast notification to the user
   * @param message Message to display in the toast
   */
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000, // 2 seconds
      position: 'bottom',
      color: this.isOffline ? 'warning' : 'success', // Different color based on status
      cssClass: 'toast-message',
    });
    await toast.present();
  }

  /**
   * Loads initial weather data from saved location or gets current location
   * Called once during component initialization
   */
  private loadInitialData() {
    this.loading = true;
    this.error = null;

    // First try to use a saved location
    const savedLocation = this.locationService.getLastLocation();
    if (savedLocation) {
      this.location = savedLocation;
      this.loadWeatherData();
    } else {
      // If no saved location, try to get current location
      this.getCurrentLocation();
    }
  }

  /**
   * Gets the user's current location using the Geolocation API
   * Then uses reverse geocoding to get a location name
   */
  async getCurrentLocation() {
    try {
      // Get position from location service
      const position = await this.locationService
        .getCurrentPosition()
        .toPromise();

      if (!position) {
        throw new Error('Unable to get current position');
      }

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Convert coordinates to location name using reverse geocoding
      const locationData = await this.reverseGeocodingService
        .getReverseGeocoding(lat, lon)
        .toPromise();

      if (locationData && locationData[0]) {
        // Set the location with the retrieved name
        this.location = {
          name: locationData[0].name,
          lat: lat,
          lon: lon,
        };

        // Save this location for future use
        this.locationService.saveLastLocation(lat, lon, locationData[0].name);
        this.loadWeatherData();
      }
    } catch (error) {
      console.error('Error getting location:', error);
      this.loading = false;
      this.error =
        'Unable to get your location. Please check your permissions.';
    }
  }

  /**
   * Loads weather data from the API using current location
   * Updates the component state with results
   */
  loadWeatherData() {
    if (!this.location) {
      this.loading = false;
      this.error = 'No location selected';
      return;
    }

    this.loading = true;
    this.error = null;

    // Call the weather service to get data
    this.weatherService
      .getWeatherData(this.location.lat, this.location.lon)
      .subscribe(
        (data) => {
          // Success - update the weather data
          this.currentWeather = data;
          this.loading = false;
        },
        (error) => {
          // Error - show different messages based on offline status
          console.error('Error loading weather data:', error);
          this.loading = false;
          if (this.isOffline) {
            this.error = 'You are offline and no cached data is available';
          } else {
            this.error = 'Unable to load weather data. Please try again.';
          }
        }
      );
  }

  /**
   * Handles the pull-to-refresh gesture
   * Reloads weather data when user pulls down
   * @param event The refresh event from IonRefresher
   */
  async handleRefresh(event: any) {
    if (!navigator.onLine) {
      this.isOffline = true;
      this.showToast('You are offline. Showing cached data.');
      event.target.complete();
      return;
    }

    this.isOffline = false;

    try {
      await this.loadWeatherData();
      event.target.complete();
    } catch (error) {
      console.error('Error refreshing weather data:', error);
      this.showToast('Error refreshing data. Check your connection.');
      event.target.complete();
    }
  }

  /**
   * Gets the URL for a weather icon based on icon code
   * @param iconCode The icon code from the weather API
   * @returns Full URL to the weather icon
   */
  getWeatherIcon(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  /**
   * Gets the temperature unit symbol (°C or °F) from settings
   * @returns The unit symbol based on user preferences
   */
  getUnitSymbol(): string {
    return this.settingsService.getUnitSymbol();
  }
}
