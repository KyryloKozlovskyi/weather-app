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
import {
  compassOutline,
  waterOutline,
  contractOutline,
  cloudOutline,
  locationOutline,
  bookmarkOutline, // Add this
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

  // Injecting the services
  constructor(
    private geocodingService: GeocodingService,
    private weatherService: WeatherService,
    private reverseWeatherService: ReverseGeocodingService,
    private alertController: AlertController,
    private locationService: LocationService,
    private loadingController: LoadingController,
    private settingsService: SettingsService,
    private toastController: ToastController
  ) {
    addIcons({
      compassOutline,
      waterOutline,
      contractOutline,
      cloudOutline,
      locationOutline,
      bookmarkOutline, // Add this
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
      loading.dismiss();
      this.isLoading = false;
    }
  }

  // Event handler for search box.
  async handleInput(event: KeyboardEvent) {
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
    setTimeout(() => {
      if (this.userInput == null && !this.lat && !this.lon) {
        console.log('Refreshing...');
        console.log('No User Input or location!');
        console.log('Done');
        event.target.complete();
      } else {
        console.log('Refreshing...');
        // Current
        this.weatherService
          .getWeatherData(this.lat, this.lon)
          .subscribe((response) => {
            this.resp = response;
            console.log(this.resp); // Logs json to the console
            console.log('Done current.');
            event.target.complete();
          });
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
      color: 'success',
      cssClass: 'toast-message',
    });
    await toast.present();
  }
}
