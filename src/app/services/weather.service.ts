import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
// Weather service to get weather data from the specific coordinates using OpenWeatherMap API
export class WeatherServiceService {
  constructor(public http: HttpClient) {}

  // Get weather data from the coordinates of the city
  getWeatherData(lat: number, lon: number): Observable<any> {
    let apiKey = 'c213bf7641522d502751e12a087b3d5d'; // API key
    let apiCall = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`; // API call
    return this.http.get(apiCall); // Return the API call result as an observable
  }
}
