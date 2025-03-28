import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor() {}

  getCurrentPosition(): Observable<GeolocationPosition> {
    if (!navigator.geolocation) {
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
      catchError((error) => {
        console.error('Error getting current position', error);
        return of(null as unknown as GeolocationPosition);
      })
    );
  }

  // Save last used location to local storage
  saveLastLocation(lat: number, lon: number, name: string): void {
    const location = { lat, lon, name };
    localStorage.setItem('lastLocation', JSON.stringify(location));
  }

  // Get last used location from local storage
  getLastLocation(): { lat: number; lon: number; name: string } | null {
    const locationData = localStorage.getItem('lastLocation');
    return locationData ? JSON.parse(locationData) : null;
  }
}
