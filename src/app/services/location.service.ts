import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor() {
    console.log('[LocationService] Service initialized');
  }

  getCurrentPosition(): Observable<GeolocationPosition> {
    console.log('[LocationService] Getting current position');

    if (!navigator.geolocation) {
      console.error(
        '[LocationService] Geolocation is not supported by this browser'
      );
      throw new Error('Geolocation is not supported by this browser.');
    }

    return from(
      new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      })
    ).pipe(
      tap((position) =>
        console.log('[LocationService] Position obtained:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      ),
      catchError((error) => {
        console.error(
          '[LocationService] Error getting current position',
          error
        );
        return of(null as unknown as GeolocationPosition);
      })
    );
  }

  // Save last used location to local storage
  saveLastLocation(lat: number, lon: number, name: string): void {
    console.log(`[LocationService] Saving location: ${name} (${lat}, ${lon})`);
    const location = { lat, lon, name };
    localStorage.setItem('lastLocation', JSON.stringify(location));
  }

  // Get last used location from local storage
  getLastLocation(): { lat: number; lon: number; name: string } | null {
    console.log('[LocationService] Getting last location from localStorage');
    const locationData = localStorage.getItem('lastLocation');
    const location = locationData ? JSON.parse(locationData) : null;

    if (location) {
      console.log(
        `[LocationService] Found saved location: ${location.name} (${location.lat}, ${location.lon})`
      );
    } else {
      console.log('[LocationService] No saved location found');
    }

    return location;
  }

  // Clear the last saved location from localStorage
  clearLastLocation(): void {
    console.log('[LocationService] Clearing last location from localStorage');
    localStorage.removeItem('lastLocation');
  }
}
