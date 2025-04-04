import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
// Reverse geocoding service to get the city name from its coordinates using OpenWeatherMap API
export class ReverseGeocodingService {
  constructor(public http: HttpClient) {}

  // Get reverse geocoding data of the city
  getReverseGeocoding(lat: number, lon: number): Observable<any> {
    let apiKey = 'c213bf7641522d502751e12a087b3d5d'; // API key
    let apiCall = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`; // API call

    console.log(`[ReverseGeocodingService] Making API call to: ${apiCall}`);

    return this.http.get(apiCall).pipe(
      tap(
        (response) =>
          console.log('[ReverseGeocodingService] API response:', response),
        (error) => console.error('[ReverseGeocodingService] API error:', error)
      )
    ); // Return the API call result
  }
}
