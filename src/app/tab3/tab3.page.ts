import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  ToastController,
  AlertController,
  LoadingController,
} from '@ionic/angular';
import { LocationService } from '../services/location.service';
import { SettingsService } from '../services/settings.service';
import { GeocodingService } from '../services/geocoding.service';
import { ReverseGeocodingService } from '../services/reverse-geocoding.service';
import { addIcons } from 'ionicons';
import {
  informationCircleOutline,
  codeOutline,
  trashOutline,
  thermometerOutline,
  cloudDownloadOutline,
  contrastOutline,
  moonOutline,
  locationOutline,
  searchOutline,
  cloudOfflineOutline, // Add this icon
} from 'ionicons/icons';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class Tab3Page implements OnInit, OnDestroy {
  temperatureUnit = 'metric'; // Default to metric
  darkMode: string = 'system'; // Default to system
  savedLocation: any = null;
  cityInput: string = '';
  isOffline: boolean = false; // Add offline status property
  private darkModeMediaQuery: MediaQueryList | null = null;
  private darkModeChangeHandler: ((e: MediaQueryListEvent) => void) | null =
    null;

  constructor(
    private locationService: LocationService,
    private toastController: ToastController,
    private settingsService: SettingsService,
    private geocodingService: GeocodingService,
    private reverseGeocodingService: ReverseGeocodingService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({
      informationCircleOutline,
      codeOutline,
      trashOutline,
      thermometerOutline,
      cloudDownloadOutline,
      contrastOutline,
      moonOutline,
      locationOutline,
      searchOutline,
      cloudOfflineOutline, // Add icon for offline indicator
    });
  }

  ngOnInit() {
    // Check if there's a saved location
    this.savedLocation = this.locationService.getLastLocation();

    // Get current temperature unit from the service
    this.temperatureUnit = this.settingsService.currentTemperatureUnit;

    // Load saved theme preference
    const savedTheme = localStorage.getItem('darkMode') || 'system';
    this.darkMode = savedTheme;
    this.applyTheme(this.darkMode);

    // Check initial network status
    this.isOffline = !navigator.onLine;

    // Add network status monitoring
    window.addEventListener('online', this.handleNetworkStatusChange);
    window.addEventListener('offline', this.handleNetworkStatusChange);
  }

  ngOnDestroy() {
    // Clean up event listener to prevent memory leaks
    if (this.darkModeMediaQuery && this.darkModeChangeHandler) {
      this.darkModeMediaQuery.removeEventListener(
        'change',
        this.darkModeChangeHandler
      );
    }

    // Remove network status event listeners
    window.removeEventListener('online', this.handleNetworkStatusChange);
    window.removeEventListener('offline', this.handleNetworkStatusChange);
  }

  // Handle network status changes
  private handleNetworkStatusChange = () => {
    this.isOffline = !navigator.onLine;
    if (this.isOffline) {
      this.showToast('You are offline. Only theme settings are available.');
    }
  };

  // Show warning for disabled settings
  async showOfflineWarning() {
    if (this.isOffline) {
      await this.showToast('This setting is disabled in offline mode.');
      return true;
    }
    return false;
  }

  // Handle temperature unit change
  async unitChanged(event: any) {
    if (await this.showOfflineWarning()) {
      // Reset to previous value if offline
      setTimeout(() => {
        this.temperatureUnit = this.settingsService.currentTemperatureUnit;
      }, 0);
      return;
    }
    
    this.temperatureUnit = event.detail.value;
    this.settingsService.setTemperatureUnit(this.temperatureUnit);
    this.showToast('Temperature unit updated');
  }

  // Handle theme change
  themeChanged(event: any) {
    this.darkMode = event.detail.value;
    localStorage.setItem('darkMode', this.darkMode);
    this.applyTheme(this.darkMode);

    // Force Ionic components to update their styles
    document.querySelector('ion-content')?.classList.add('force-refresh');
    setTimeout(() => {
      document.querySelector('ion-content')?.classList.remove('force-refresh');
    }, 10);

    this.showToast('Theme preference updated');
  }

  // Delete saved location
  async clearSavedLocation() {
    if (await this.showOfflineWarning()) {
      return;
    }
    
    this.locationService.clearLastLocation();
    this.savedLocation = null;
    this.showToast('Saved location cleared');
  }

  // Get current location and save it
  async useCurrentLocation() {
    if (await this.showOfflineWarning()) {
      return;
    }
    
    const loading = await this.loadingController.create({
      message: 'Getting your location...',
      spinner: 'bubbles',
    });
    await loading.present();

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
        const name = locationData[0].name;
        this.locationService.saveLastLocation(lat, lon, name);
        this.savedLocation = { lat, lon, name };
        this.showToast('Location updated to your current position');
      } else {
        this.locationService.saveLastLocation(lat, lon, 'Current Location');
        this.savedLocation = { lat, lon, name: 'Current Location' };
        this.showToast('Location updated to your current position');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message:
          'Unable to get your current location. Please check your permissions.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      loading.dismiss();
    }
  }

  // Change location by city name
  async changeLocation() {
    if (await this.showOfflineWarning()) {
      return;
    }
    
    if (!this.cityInput || this.cityInput.trim() === '') {
      const alert = await this.alertController.create({
        header: 'Empty Input',
        message: 'Please enter a city name',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Searching location...',
      spinner: 'bubbles',
    });
    await loading.present();

    try {
      const location = await this.geocodingService
        .getGeocoding(this.cityInput)
        .toPromise();

      if (location) {
        this.savedLocation = {
          lat: location.lat,
          lon: location.lon,
          name: location.name,
        };
        this.cityInput = ''; // Clear input
        this.showToast(`Location updated to ${location.name}`);
      } else {
        const alert = await this.alertController.create({
          header: 'Location Not Found',
          message:
            'Could not find the city you entered. Please try again with a different name.',
          buttons: ['OK'],
        });
        await alert.present();
      }
    } catch (error) {
      console.error('Error searching for location:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Error searching for location. Please try again.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      loading.dismiss();
    }
  }

  // Clear cache
  async clearCache() {
    if (await this.showOfflineWarning()) {
      return;
    }
    
    // Show loading indicator
    const loading = await this.loadingController.create({
      message: 'Clearing cache...',
      duration: 1500,
    });
    await loading.present();

    try {
      // Clear any localStorage cached data (except theme preference and units)
      const themePreference = localStorage.getItem('darkMode');
      const temperatureUnit = localStorage.getItem('temperatureUnit');
      
      // Save the important settings
      const savedSettings = {
        darkMode: themePreference,
        temperatureUnit: temperatureUnit
      };
      
      // Clear all localStorage
      localStorage.clear();
      
      // Restore the important settings
      if (savedSettings.darkMode) {
        localStorage.setItem('darkMode', savedSettings.darkMode);
      }
      
      if (savedSettings.temperatureUnit) {
        localStorage.setItem('temperatureUnit', savedSettings.temperatureUnit);
      }

      // Clear the browser caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter((name) => 
              name.includes('weather-app') || 
              name.includes('weather-api') || 
              name.includes('ngsw')
            )
            .map((name) => caches.delete(name))
        );
      }

      // Refresh service worker if available
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.update();
        }
      }

      // Show success message
      const toast = await this.toastController.create({
        message: 'Cache cleared successfully',
        duration: 2000,
        position: 'bottom',
        color: 'success',
      });
      await toast.present();
    } catch (error) {
      // Show error message
      const toast = await this.toastController.create({
        message: 'Failed to clear cache: ' + (error instanceof Error ? error.message : 'Unknown error'),
        duration: 3000,
        position: 'bottom',
        color: 'danger',
      });
      await toast.present();
    }
  }

  // Show toast message
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'success',
      cssClass: 'toast-message',
    });
    await toast.present();
  }

  // Apply theme based on selection
  private applyTheme(theme: string) {
    document.body.classList.remove('dark', 'light');

    if (theme === 'dark') {
      document.body.classList.add('dark');
      document.documentElement.setAttribute('color-scheme', 'dark');
    } else if (theme === 'light') {
      document.body.classList.add('light');
      document.documentElement.setAttribute('color-scheme', 'light');
    } else if (theme === 'system') {
      // Clean up previous listener if exists
      if (this.darkModeMediaQuery && this.darkModeChangeHandler) {
        this.darkModeMediaQuery.removeEventListener(
          'change',
          this.darkModeChangeHandler
        );
      }

      // Check system preference
      this.darkModeMediaQuery = window.matchMedia(
        '(prefers-color-scheme: dark)'
      );
      const isDarkMode = this.darkModeMediaQuery.matches;

      document.body.classList.add(isDarkMode ? 'dark' : 'light');
      document.documentElement.setAttribute(
        'color-scheme',
        isDarkMode ? 'dark' : 'light'
      );

      // Listen for changes in system preference
      this.darkModeChangeHandler = (e) => {
        if (this.darkMode === 'system') {
          document.body.classList.remove('dark', 'light');
          document.body.classList.add(e.matches ? 'dark' : 'light');
          document.documentElement.setAttribute(
            'color-scheme',
            e.matches ? 'dark' : 'light'
          );
        }
      };

      this.darkModeMediaQuery.addEventListener(
        'change',
        this.darkModeChangeHandler
      );
    }

    // Force a repaint to ensure styles are applied
    document.body.style.display = 'none';
    setTimeout(() => {
      document.body.style.display = '';
    }, 5);
  }
}
