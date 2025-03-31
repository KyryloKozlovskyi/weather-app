import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private temperatureUnitSubject = new BehaviorSubject<string>(
    localStorage.getItem('temperatureUnit') || 'metric'
  );

  constructor() {}

  get temperatureUnit$(): Observable<string> {
    return this.temperatureUnitSubject.asObservable();
  }

  get currentTemperatureUnit(): string {
    return this.temperatureUnitSubject.value;
  }

  setTemperatureUnit(unit: string): void {
    localStorage.setItem('temperatureUnit', unit);
    this.temperatureUnitSubject.next(unit);
  }

  getUnitSymbol(): string {
    return this.currentTemperatureUnit === 'metric' ? '°C' : '°F';
  }

  getWindSpeedUnit(): string {
    return this.currentTemperatureUnit === 'metric' ? 'km/h' : 'mph';
  }

  getRainfallUnit(): string {
    return this.currentTemperatureUnit === 'metric' ? 'mm' : 'in';
  }

  getUnits(): string {
    return this.currentTemperatureUnit;
  }

  convertRainfall(rainfall: number): number {
    // Convert from mm to inches if imperial units
    if (
      this.currentTemperatureUnit === 'imperial' &&
      rainfall !== null &&
      rainfall !== undefined
    ) {
      // 1 mm = 0.0393701 inches
      return parseFloat((rainfall * 0.0393701).toFixed(2));
    }
    return rainfall;
  }
}
