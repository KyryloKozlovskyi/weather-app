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
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { cloudOfflineOutline } from 'ionicons/icons';
import { WeatherService } from '../services/weather.service';
import { LocationService } from '../services/location.service';
import { SettingsService } from '../services/settings.service';
import { ReverseGeocodingService } from '../services/reverse-geocoding.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    IonButton,
  ],
})
export class Tab1Page implements OnInit, OnDestroy {
  public isOffline: boolean = false;
  public currentWeather: any;
  public loading: boolean = true;
  public error: string | null = null;
  public location: any;
  private locationSubscription: Subscription | undefined;

  constructor(
    public weatherService: WeatherService,
    private locationService: LocationService,
    private reverseGeocodingService: ReverseGeocodingService,
    private settingsService: SettingsService,
    private toastController: ToastController
  ) {
    addIcons({ cloudOfflineOutline });
  }

  ngOnInit() {
    // Add network status monitoring
    window.addEventListener('online', this.handleOnlineStatusChange);
    window.addEventListener('offline', this.handleOnlineStatusChange);

    // Check initial network status
    this.isOffline = !navigator.onLine;

    // Initial data load
    this.loadInitialData();

    // Subscribe to location changes
    this.locationSubscription = this.locationService.locationChanged$.subscribe(
      (location) => {
        if (location) {
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

  ngOnDestroy() {
    // Clean up event listeners
    window.removeEventListener('online', this.handleOnlineStatusChange);
    window.removeEventListener('offline', this.handleOnlineStatusChange);

    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
  }

  // Handle online/offline status changes
  private handleOnlineStatusChange = () => {
    const wasOffline = this.isOffline;
    this.isOffline = !navigator.onLine;

    if (wasOffline && !this.isOffline) {
      // Just came back online - refresh data
      this.showToast('You are back online. Refreshing data...');
      this.loadWeatherData();
    } else if (!wasOffline && this.isOffline) {
      // Just went offline
      this.showToast('You are offline. Showing cached data.');
    }
  };

  // Helper method for toast messages
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: this.isOffline ? 'warning' : 'success',
      cssClass: 'toast-message',
    });
    await toast.present();
  }

  // Initial data loading
  private loadInitialData() {
    this.loading = true;
    this.error = null;

    // Load saved location if available
    const savedLocation = this.locationService.getLastLocation();
    if (savedLocation) {
      this.location = savedLocation;
      this.loadWeatherData();
    } else {
      // Try to get current location
      this.getCurrentLocation();
    }
  }

  // Get current location
  async getCurrentLocation() {
    try {
      const position = await this.locationService
        .getCurrentPosition()
        .toPromise();

      if (!position) {
        throw new Error('Unable to get current position');
      }

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Get location name using reverse geocoding
      const locationData = await this.reverseGeocodingService
        .getReverseGeocoding(lat, lon)
        .toPromise();

      if (locationData && locationData[0]) {
        this.location = {
          name: locationData[0].name,
          lat: lat,
          lon: lon,
        };

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

  // Load weather data
  loadWeatherData() {
    if (!this.location) {
      this.loading = false;
      this.error = 'No location selected';
      return;
    }

    this.loading = true;
    this.error = null;

    this.weatherService
      .getWeatherData(this.location.lat, this.location.lon)
      .subscribe(
        (data) => {
          this.currentWeather = data;
          this.loading = false;
        },
        (error) => {
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

  // Handle refresh
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

  // Helper methods for weather display
  getWeatherIcon(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  getUnitSymbol(): string {
    return this.settingsService.getUnitSymbol();
  }
}
