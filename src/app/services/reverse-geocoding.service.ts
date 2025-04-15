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
 * ReverseGeocodingService
 *
 * Handles converting geographic coordinates (lat/lon) to location names (like cities)
 * This is the opposite of forward geocoding which converts names to coordinates
 * Uses OpenWeatherMap's Geocoding API's reverse endpoint
 */
export class ReverseGeocodingService {
  /**
   * Constructor - injects the HttpClient service
   * @param http - The HttpClient for making API requests
   */
  constructor(public http: HttpClient) {}

  /**
   * Converts geographic coordinates to a location name (typically city, state, country)
   *
   * @param lat - Latitude of the location (decimal degrees)
   * @param lon - Longitude of the location (decimal degrees)
   * @returns Observable containing the reverse geocoding response with location details
   */
  getReverseGeocoding(lat: number, lon: number): Observable<any> {
    let apiKey = 'c213bf7641522d502751e12a087b3d5d'; // OpenWeatherMap API key

    // Construct API URL with coordinates and API key
    // The limit parameter restricts results to 1 location
    let apiCall = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;

    // Log the API call for debugging purposes
    console.log(`[ReverseGeocodingService] Making API call to: ${apiCall}`);

    // Make HTTP GET request and apply operators
    return this.http.get(apiCall).pipe(
      // Use tap operator to log responses and errors without affecting the data stream
      tap(
        (response) =>
          console.log('[ReverseGeocodingService] API response:', response),
        (error) => console.error('[ReverseGeocodingService] API error:', error)
      )
    ); // Returns an Observable that components can subscribe to
  }
}
