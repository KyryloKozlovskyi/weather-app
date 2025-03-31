import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { SettingsService } from './settings.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  constructor(
    public http: HttpClient,
    private settingsService: SettingsService
  ) {}

  // Get weather data from the coordinates of the city
  getWeatherData(lat: number, lon: number, units?: string): Observable<any> {
    // Use provided units or default to the current setting
    const selectedUnits = units || this.settingsService.currentTemperatureUnit;

    const apiKey = environment.openWeatherMapApiKey;
    const apiCall = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${selectedUnits}`;

    console.log(`[WeatherService] Making API call to: ${apiCall}`);

    return this.http.get(apiCall).pipe(
      tap(
        (response) => console.log('[WeatherService] API response:', response),
        (error) => console.error('[WeatherService] API error:', error)
      )
    );
  }

  // Get weather icon URL
  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }
}
