import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
// Geocoding service for getting the geocoding data of the city from the OpenWeatherMap API by providing the city name
export class GeocodingService {
  constructor(public http: HttpClient) {}

  // Get geocoding data of the city
  getGeocoding(city: string): Observable<any> {
    let apiKey = 'c213bf7641522d502751e12a087b3d5d'; // API key
    let apiCall = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`; // API call
    return this.http.get(apiCall); // Return the API call response as an observable
  }
}
