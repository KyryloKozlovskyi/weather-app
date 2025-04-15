import { Injectable } from '@angular/core'; // Angular's dependency injection system
import { BehaviorSubject, Observable } from 'rxjs'; // Reactive programming utilities

/**
 * SettingsService
 *
 * This service manages application-wide settings and preferences, including:
 * - Temperature units (metric vs imperial)
 * - Unit symbols and conversions
 *
 * It uses localStorage to persist settings between sessions
 * and broadcasts changes via Observables for real-time updates.
 */
@Injectable({
  providedIn: 'root', // Makes this a singleton service available throughout the app
})
export class SettingsService {
  /**
   * BehaviorSubject to store and broadcast the current temperature unit
   * Initialized from localStorage if available, defaults to 'metric'
   * BehaviorSubject maintains the latest value and provides it to new subscribers
   */
  private temperatureUnitSubject = new BehaviorSubject<string>(
    localStorage.getItem('temperatureUnit') || 'metric'
  );

  constructor() {
    // No initialization needed beyond BehaviorSubject setup above
  }

  /**
   * Returns an Observable of the temperature unit that components can subscribe to
   * Components use this to react to temperature unit changes in real-time
   *
   * @returns Observable<string> - Emits current and future temperature unit values
   */
  get temperatureUnit$(): Observable<string> {
    return this.temperatureUnitSubject.asObservable();
  }

  /**
   * Returns the current temperature unit value ('metric' or 'imperial')
   *
   * @returns string - Current temperature unit
   */
  get currentTemperatureUnit(): string {
    return this.temperatureUnitSubject.value;
  }

  /**
   * Changes the temperature unit setting and persists it to localStorage
   * Also notifies all subscribers about the change
   *
   * @param unit - New temperature unit ('metric' or 'imperial')
   */
  setTemperatureUnit(unit: string): void {
    localStorage.setItem('temperatureUnit', unit);
    this.temperatureUnitSubject.next(unit);
  }

  /**
   * Returns the appropriate temperature symbol based on current unit setting
   *
   * @returns string - '°C' for metric, '°F' for imperial
   */
  getUnitSymbol(): string {
    return this.currentTemperatureUnit === 'metric' ? '°C' : '°F';
  }

  /**
   * Returns the appropriate wind speed unit based on current unit setting
   *
   * @returns string - 'km/h' for metric, 'mph' for imperial
   */
  getWindSpeedUnit(): string {
    return this.currentTemperatureUnit === 'metric' ? 'km/h' : 'mph';
  }

  /**
   * Returns the appropriate rainfall unit based on current unit setting
   *
   * @returns string - 'mm' for metric, 'in' for imperial
   */
  getRainfallUnit(): string {
    return this.currentTemperatureUnit === 'metric' ? 'mm' : 'in';
  }

  /**
   * Returns the current unit system for use in API calls
   *
   * @returns string - Current temperature unit ('metric' or 'imperial')
   */
  getUnits(): string {
    return this.currentTemperatureUnit;
  }

  /**
   * Converts rainfall values between metric and imperial units
   * If using imperial units, converts from millimeters to inches
   *
   * @param rainfall - Rainfall amount in millimeters
   * @returns number - Rainfall in appropriate units (mm or inches)
   */
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
