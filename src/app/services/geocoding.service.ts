import { Injectable } from '@angular/core'; // Angular's dependency injection system
import { HttpClient } from '@angular/common/http'; // For making HTTP requests
import { Observable, tap } from 'rxjs'; // Reactive programming utilities

/**
 * @Injectable decorator marks this service as one that can be injected
 * 'root' means this service is provided at the root level and is a singleton
 */
@Injectable({
  providedIn: 'root',
})
/**
 * GeocodingService
 * Handles converting location names (like cities) to geographic coordinates (lat/lon)
 * Uses OpenWeatherMap's Geocoding API
 */
export class GeocodingService {
  /**
   * Constructor - injects the HttpClient service
   * @param http - The HttpClient for making API requests
   */
  constructor(public http: HttpClient) {}

  /**
   * Converts a city name to geographic coordinates
   * @param city - The name of the city to search for
   * @returns Observable containing the geocoding response with latitude and longitude
   */
  getGeocoding(city: string): Observable<any> {
    let apiKey = 'c213bf7641522d502751e12a087b3d5d'; // OpenWeatherMap API key
    // Construct API URL with city name and API key
    let apiCall = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

    // Log the API call for debugging purposes
    console.log(`[GeocodingService] Making API call to: ${apiCall}`);

    // Make HTTP GET request and apply operators
    return this.http.get(apiCall).pipe(
      // Use tap operator to log responses and errors without affecting the data stream
      tap(
        (response) => console.log('[GeocodingService] API response:', response),
        (error) => console.error('[GeocodingService] API error:', error)
      )
    ); // Returns an Observable that components can subscribe to
  }
}
