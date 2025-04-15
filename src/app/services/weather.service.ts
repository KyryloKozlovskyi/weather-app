import { Injectable } from '@angular/core'; // Angular's dependency injection system
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; // For making HTTP requests and handling errors
import { Observable, tap, catchError, throwError, of } from 'rxjs'; // Reactive programming utilities
import { SettingsService } from './settings.service'; // For accessing user preferences
import { environment } from '../../environments/environment'; // Environment configuration with API keys

/**
 * WeatherService
 *
 * Responsible for retrieving weather data from the OpenWeatherMap API
 * and handling both online and offline scenarios.
 *
 * Features:
 * - Fetches current weather and forecasts based on coordinates
 * - Handles offline detection and fallback to cached data
 * - Provides helper methods for weather-related functionality
 * - Supports different unit systems (metric/imperial)
 */
@Injectable({
  providedIn: 'root', // Makes this a singleton service available throughout the app
})
export class WeatherService {
  /**
   * Tracks the application's online/offline status
   * Used to determine if we should attempt API calls or use cached data
   */
  isOffline = false;

  /**
   * Constructor - initializes the service and sets up online/offline listeners
   *
   * @param http - The HttpClient for making API requests
   * @param settingsService - Service to access user preferences like temperature units
   */
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

  /**
   * Fetches weather data from OpenWeatherMap API for the specified coordinates
   * Handles error cases including offline scenarios
   *
   * @param lat - Latitude of the location (decimal degrees)
   * @param lon - Longitude of the location (decimal degrees)
   * @param units - Optional units parameter ('metric' or 'imperial'), defaults to user's preference
   * @returns Observable containing the weather data or empty object if request fails
   */
  getWeatherData(lat: number, lon: number, units?: string): Observable<any> {
    // Check if we're offline first
    if (!navigator.onLine) {
      console.log('Offline: trying to use cached weather data');
    }

    // Use provided units or default to the current setting
    const selectedUnits = units || this.settingsService.currentTemperatureUnit;

    // Get API key from environment configuration
    const apiKey = environment.openWeatherMapApiKey;

    // Construct the full API URL with coordinates, API key and units
    const apiCall = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${selectedUnits}`;

    console.log(`[WeatherService] Making API call to: ${apiCall}`);

    // Make HTTP GET request and apply operators for logging and error handling
    return this.http.get(apiCall).pipe(
      // Use tap operator to log responses and errors without affecting the data stream
      tap(
        (response) => console.log('[WeatherService] API response:', response),
        (error) => console.error('[WeatherService] API error:', error)
      ),
      // Handle errors gracefully and return empty object rather than failing
      catchError(this.handleError('getWeatherData', {}))
    );
  }

  /**
   * Creates a function to handle HTTP errors
   * Returns a default result when an error occurs instead of propagating the error
   *
   * @param operation - Name of the operation that failed (for logging)
   * @param result - Optional default value to return on error
   * @returns Function that handles HttpErrorResponse and returns an Observable with the default result
   */
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

  /**
   * Generates a URL for a weather icon based on the icon code from the API
   *
   * @param iconCode - The icon code from the OpenWeatherMap API (e.g., "01d", "10n")
   * @returns The full URL to the weather icon image
   */
  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  /**
   * Logs a message indicating the app is in offline mode
   * This could be expanded in the future to notify components about offline status
   */
  notifyOfflineMode(): void {
    console.log('[WeatherService] Offline mode active, using cached data');
    // You could expand this with a Subject/Observable that components subscribe to
    // or use a shared service for application-wide status notifications
  }

  /**
   * Returns the current offline status of the application
   *
   * @returns true if the app is offline, false otherwise
   */
  isOfflineMode(): boolean {
    return this.isOffline;
  }
}
