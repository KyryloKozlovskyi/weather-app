import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonButton,
  IonSpinner,
  IonChip,
  IonLabel,
} from '@ionic/angular/standalone';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { IonSearchbar } from '@ionic/angular/standalone';
import { GeocodingService } from '../services/geocoding.service';
import { WeatherService } from '../services/weather.service';
import { IonIcon } from '@ionic/angular/standalone';
import { DecimalPipe } from '@angular/common';
import { NgIf } from '@angular/common';
import { DatePipe } from '../pipes/date.pipe';
import { IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { WindPipe } from '../pipes/wind.pipe';
import { DayPipe } from '../pipes/day.pipe';
import { RainPipe } from '../pipes/rain.pipe';
import { FormsModule } from '@angular/forms';
import {
  compassOutline,
  waterOutline,
  contractOutline,
  cloudOutline,
  locationOutline,
  bookmarkOutline,
  cloudOfflineOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ReverseGeocodingService } from '../services/reverse-geocoding.service';
import {
  AlertController,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { LocationService } from '../services/location.service';
import { SettingsService } from '../services/settings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRow,
    IonRefresher,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ExploreContainerComponentModule,
    IonSearchbar,
    IonIcon,
    DecimalPipe,
    NgIf,
    DatePipe,
    IonGrid,
    IonRow,
    IonCol,
    WindPipe,
    DayPipe,
    RainPipe,
    IonButton,
    IonSpinner,
    IonChip, // For offline mode indicator
    IonLabel, // For offline mode text
    FormsModule, // For searchbar binding
  ],
})
export class Tab2Page {
  public geoResp: any = []; // Stores geocoding json
  public geoRevResp: any = [];
  public resp: any = []; // Stores weather json
  public userInput: any; // User input
  public lat: any; // Latitude
  public lon: any; // Longitude
  public showContent: boolean = false; // Show content flag
  public isLoading: boolean = false;
  private unitSubscription: Subscription | undefined;
  private locationSubscription: Subscription | undefined;
  public isCustomSearch: boolean = false; // Flag to track if we're showing a search result
  public isOffline: boolean = false; // Add offline status flag

  // Injecting the services
  constructor(
    private weatherService: WeatherService,
    private geocodingService: GeocodingService,
    private reverseWeatherService: ReverseGeocodingService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController, // Add this if not already present
    private settingsService: SettingsService,
    private locationService: LocationService
  ) {
    addIcons({
      compassOutline,
      waterOutline,
      contractOutline,
      cloudOutline,
      locationOutline,
      bookmarkOutline,
      cloudOfflineOutline, // Add the offline icon
    });
  }

  ngOnInit() {
    // Check if we want to load with current location on startup
    const savedLocation = this.locationService.getLastLocation();
    if (savedLocation) {
      this.loadFromSavedLocation(savedLocation);
    }

    // Subscribe to location changes - only update if not in custom search mode
    this.locationSubscription = this.locationService.locationChanged$.subscribe(
      (location) => {
        if (location && !this.isCustomSearch) {
          this.loadFromSavedLocation(location);
        } else if (!location && !this.isCustomSearch) {
          // Handle case where location was cleared
          this.showContent = false;
          this.lat = null;
          this.lon = null;
          this.geoRevResp = null;
        }
      }
    );

    // Subscribe to unit changes to refresh weather data
    this.unitSubscription = this.settingsService.temperatureUnit$.subscribe(
      () => {
        if (this.lat && this.lon) {
          this.getWeatherData(this.lat, this.lon);
        }
      }
    );

    // Check initial network status
    this.isOffline = !navigator.onLine;

    // Add network status monitoring
    window.addEventListener('online', this.handleNetworkStatusChange);
    window.addEventListener('offline', this.handleNetworkStatusChange);
  }

  ngOnDestroy() {
    // Clean up subscriptions to prevent memory leaks
    if (this.unitSubscription) {
      this.unitSubscription.unsubscribe();
    }

    // Also unsubscribe from the location changes
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }

    // Clean up event listeners
    window.removeEventListener('online', this.handleNetworkStatusChange);
    window.removeEventListener('offline', this.handleNetworkStatusChange);
  }

  // Handle network status changes
  private handleNetworkStatusChange = () => {
    const wasOffline = this.isOffline;
    this.isOffline = !navigator.onLine;

    if (wasOffline && !this.isOffline) {
      // Just came back online - refresh data if we have a location
      this.showToast('You are back online. Refreshing data...');
      if (this.lat && this.lon) {
        this.getWeatherData(this.lat, this.lon);
      }
    } else if (!wasOffline && this.isOffline) {
      // Just went offline
      this.showToast('You are offline. Search functionality is disabled.');
    }
  };

  // Show a toast message for offline mode
  async showOfflineWarning() {
    if (this.isOffline) {
      await this.showToast('This feature is disabled in offline mode.');
      return true;
    }
    return false;
  }

  // Load data from a saved location
  async loadFromSavedLocation(location: any) {
    this.isCustomSearch = false; // Reset the custom search flag
    this.lat = location.lat;
    this.lon = location.lon;
    this.geoRevResp = [{ name: location.name }];
    await this.getWeatherData(this.lat, this.lon);
    this.showContent = true;
  }

  // Get current location and display weather data
  async getCurrentLocation() {
    const loading = await this.loadingController.create({
      message: 'Getting your location...',
      spinner: 'bubbles',
      backdropDismiss: false,
      keyboardClose: false,
    });
    await loading.present();
    this.isLoading = true;

    try {
      const position = await this.locationService
        .getCurrentPosition()
        .toPromise();

      if (!position) {
        throw new Error('Unable to get current position');
      }

      this.lat = position.coords.latitude;
      this.lon = position.coords.longitude;

      // Get location name using reverse geocoding
      const locationData = await this.reverseWeatherService
        .getReverseGeocoding(this.lat, this.lon)
        .toPromise();

      if (locationData && locationData[0]) {
        const name = locationData[0].name;
        // Save to LocationService but don't mark as custom search
        this.isCustomSearch = false;
        this.locationService.saveLastLocation(this.lat, this.lon, name);
        this.geoRevResp = locationData;
      } else {
        this.geoRevResp = [{ name: 'Current Location' }];
      }

      // Get weather data
      await this.getWeatherData(this.lat, this.lon);
      this.showContent = true;
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
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  // Event handler for search box.
  async handleInput(event: KeyboardEvent) {
    if (await this.showOfflineWarning()) {
      return;
    }

    if (event.key === 'Enter') {
      const value = (event.target as HTMLInputElement).value;
      console.log('Input changed:', value);
      this.userInput = value; // Set user input
      await this.getGeocoding(this.userInput); // API call
      this.showContent = true; // Show content
    }
  }

  // API Call. Translates city name into coordinates. Calls the api to get weather data for the specified city
  getGeocoding(input: any) {
    this.geocodingService.getGeocoding(input).subscribe(
      async (response) => {
        if (response && response.length > 0) {
          this.geoResp = response;
          this.lat = this.geoResp[0].lat;
          this.lon = this.geoResp[0].lon;
          console.log(this.geoResp); // Logs json to the console
          console.log(this.lat); // Logs lat
          console.log(this.lon); // Logs lon
          await this.getReverseGeocoding(this.lat, this.lon);
          await this.getWeatherData(this.lat, this.lon);

          // Mark this as a custom search - don't save to LocationService
          this.isCustomSearch = true;
        } else {
          // Handle the case when response is undefined or empty
          console.error('Error in geocoding service: Check your input.');
          this.showContent = false; // Hide content
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'Check your input.',
            buttons: ['OK'],
          });
          await alert.present(); // Show alert
        }
      },
      async (error) => {
        // Handle the error here
        console.error('Error in geocoding service:', error);
        this.showContent = false; // Hide content
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'An error occurred..',
          buttons: ['OK'],
        });
        await alert.present(); // Show alert
      }
    );
  }

  // API Call. Coordinates into city names.
  async getReverseGeocoding(lat: number, lon: number) {
    this.reverseWeatherService
      .getReverseGeocoding(lat, lon)
      .subscribe(async (response) => {
        this.geoRevResp = response;
        console.log('Reverse');
        console.log(this.geoRevResp); // Logs json to the console
      });
  }

  // API call
  async getWeatherData(lat: any, lon: any) {
    // Current
    this.weatherService.getWeatherData(lat, lon).subscribe((response) => {
      this.resp = response;
      console.log(this.resp); // Logs json to the console
    });
  }

  // IonRefresher. Refreshes the page with the new api call
  async handleRefresh(event: any) {
    // First check if we're offline
    if (!navigator.onLine) {
      this.isOffline = true;
      // Show a toast to inform the user
      this.showToast('You are offline. Showing cached data.');
      event.target.complete();
      return;
    }

    this.isOffline = false;

    setTimeout(() => {
      if (this.userInput == null && !this.lat && !this.lon) {
        console.log('Refreshing...');
        console.log('No User Input or location!');
        console.log('Done');
        event.target.complete();
      } else {
        console.log('Refreshing...');
        // Current
        this.weatherService.getWeatherData(this.lat, this.lon).subscribe(
          (response) => {
            this.resp = response;
            console.log(this.resp);
            console.log('Done current.');
            event.target.complete();
          },
          (error) => {
            console.error('Error refreshing weather data:', error);
            // Still complete the refresh even if there's an error
            event.target.complete();
            // Show error toast
            this.showToast('Error refreshing data. Check your connection.');
          }
        );
      }
    }, 2000);
  }

  // Add helper methods for unit display
  getUnitSymbol(): string {
    return this.settingsService.getUnitSymbol();
  }

  getWindSpeedUnit(): string {
    return this.settingsService.getWindSpeedUnit();
  }

  getRainfallUnit(): string {
    return this.settingsService.getRainfallUnit();
  }

  // Save the currently displayed location as the default
  saveAsDefault() {
    if (this.lat && this.lon && this.geoRevResp && this.geoRevResp[0]) {
      const name = this.geoRevResp[0].name;
      this.locationService.saveLastLocation(this.lat, this.lon, name);
      this.isCustomSearch = false; // No longer a custom search since it's the default

      this.showToast('Location saved as default');
    }
  }

  // Add this helper method for toast messages
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

  // Reset to the saved location
  async resetToSavedLocation() {
    if (await this.showOfflineWarning()) {
      return;
    }

    const savedLocation = this.locationService.getLastLocation();

    if (savedLocation) {
      // Show loading indicator
      const loading = await this.loadingController.create({
        message: 'Loading saved location...',
        spinner: 'bubbles',
        backdropDismiss: false,
        keyboardClose: false,
      });
      await loading.present();

      try {
        this.loadFromSavedLocation(savedLocation);
        this.showToast(`Reset to ${savedLocation.name}`);
      } catch (error) {
        console.error('Error resetting to saved location:', error);
        this.showToast('Error resetting to saved location');
      } finally {
        loading.dismiss();
      }
    } else {
      // No saved location found
      const alert = await this.alertController.create({
        header: 'No Saved Location',
        message:
          'There is no saved location to reset to. Please save a location first.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }
}
