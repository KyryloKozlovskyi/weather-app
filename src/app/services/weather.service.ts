import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of } from 'rxjs';
import { SettingsService } from './settings.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  isOffline = false;

  constructor(
    public http: HttpClient,
    private settingsService: SettingsService
  ) {
    // Check online status when service initializes
    this.isOffline = !navigator.onLine;

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOffline = false;
      console.log('[WeatherService] App is back online');
    });

    window.addEventListener('offline', () => {
      this.isOffline = true;
      console.log('[WeatherService] App is offline, will use cached data');
    });
  }

  // Get weather data from the coordinates of the city
  getWeatherData(lat: number, lon: number, units?: string): Observable<any> {
    // Check if we're offline first
    if (!navigator.onLine) {
      console.log('Offline: trying to use cached weather data');
    }

    // Use provided units or default to the current setting
    const selectedUnits = units || this.settingsService.currentTemperatureUnit;

    const apiKey = environment.openWeatherMapApiKey;
    const apiCall = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${selectedUnits}`;

    console.log(`[WeatherService] Making API call to: ${apiCall}`);

    return this.http.get(apiCall).pipe(
      tap(
        (response) => console.log('[WeatherService] API response:', response),
        (error) => console.error('[WeatherService] API error:', error)
      ),
      catchError(this.handleError('getWeatherData', {}))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);

      // Check if this error is due to being offline
      if (!navigator.onLine || error.status === 0) {
        console.log('Device appears to be offline');
      }

      // Let the component handle the empty or cached result
      return of(result as T);
    };
  }

  // Get weather icon URL
  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  // Notify app components that we're in offline mode
  notifyOfflineMode(): void {
    console.log('[WeatherService] Offline mode active, using cached data');
    // You could expand this with a Subject/Observable that components subscribe to
    // or use a shared service for application-wide status notifications
  }

  // Check if we're currently offline
  isOfflineMode(): boolean {
    return this.isOffline;
  }
}
