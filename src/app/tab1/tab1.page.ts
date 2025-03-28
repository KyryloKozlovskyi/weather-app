import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { IonicModule, LoadingController } from '@ionic/angular';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { WeatherService } from '../services/weather.service';
import { LocationService } from '../services/location.service';
import { ReverseGeocodingService } from '../services/reverse-geocoding.service';
import { WindPipe } from '../pipes/wind.pipe';
import { DayPipe } from '../pipes/day.pipe';
import { RainPipe } from '../pipes/rain.pipe';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, DatePipe, DecimalPipe],
})
export class Tab1Page implements OnInit {
  currentWeather: any = null;
  location: any = null;
  error: string = '';
  loading: boolean = true;
  units: string = 'metric';

  constructor(
    private weatherService: WeatherService,
    private locationService: LocationService,
    private reverseGeocodingService: ReverseGeocodingService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.loadCurrentLocation();
  }

  async loadCurrentLocation() {
    const loading = await this.loadingController.create({
      message: 'Getting your location...',
      spinner: 'bubbles',
    });
    await loading.present();

    // First check if we have a saved location
    const savedLocation = this.locationService.getLastLocation();
    if (savedLocation) {
      this.location = savedLocation;
      this.loadWeatherData(savedLocation.lat, savedLocation.lon);
      loading.dismiss();
      return;
    }

    // Otherwise use device geolocation
    this.locationService
      .getCurrentPosition()
      .pipe(
        switchMap((position) => {
          if (!position) {
            throw new Error('Unable to get current position');
          }

          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          // Get location name using reverse geocoding
          return this.reverseGeocodingService
            .getReverseGeocoding(lat, lon)
            .pipe(
              switchMap((locationData) => {
                if (locationData && locationData[0]) {
                  const name = locationData[0].name;
                  this.location = { lat, lon, name };
                  this.locationService.saveLastLocation(lat, lon, name);

                  // Get weather data
                  return this.weatherService.getWeatherData(lat, lon);
                }
                throw new Error('Location not found');
              }),
              catchError((error) => {
                console.error('Error in reverse geocoding', error);
                // If reverse geocoding fails, still try to get weather with coordinates
                this.location = { lat, lon, name: 'Current Location' };
                return this.weatherService.getWeatherData(lat, lon);
              })
            );
        }),
        catchError((error) => {
          this.error = `Error: ${
            error.message || 'Failed to load weather data'
          }`;
          loading.dismiss();
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.currentWeather = data;
            this.loading = false;
          }
          loading.dismiss();
        },
        error: (err) => {
          console.error('Error in weather subscription', err);
          this.error = 'Failed to retrieve weather data';
          this.loading = false;
          loading.dismiss();
        },
      });
  }

  loadWeatherData(lat: number, lon: number) {
    this.loading = true;
    this.weatherService.getWeatherData(lat, lon).subscribe({
      next: (data) => {
        this.currentWeather = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load weather data';
        this.loading = false;
        console.error('Error loading weather data', error);
      },
    });
  }

  refreshWeather(event: any) {
    if (this.location) {
      this.loadWeatherData(this.location.lat, this.location.lon);
    } else {
      this.loadCurrentLocation();
    }
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  getWeatherIcon(iconCode: string): string {
    return this.weatherService.getWeatherIconUrl(iconCode);
  }

  getUnitSymbol(): string {
    return this.units === 'metric' ? '°C' : '°F';
  }
}
