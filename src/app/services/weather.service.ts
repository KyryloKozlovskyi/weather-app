import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  constructor(public http: HttpClient) {}

  // Get weather data from the coordinates of the city
  getWeatherData(
    lat: number,
    lon: number,
    units: string = 'metric'
  ): Observable<any> {
    let apiKey = 'c213bf7641522d502751e12a087b3d5d'; // API key
    let apiCall = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`; // API call

    console.log(`[WeatherService] Making API call to: ${apiCall}`);

    return this.http.get(apiCall).pipe(
      tap(
        (response) => console.log('[WeatherService] API response:', response),
        (error) => console.error('[WeatherService] API error:', error)
      )
    ); // Return the API call result as an observable
  }

  // Get weather icon URL
  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }
}
