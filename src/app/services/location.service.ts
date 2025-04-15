import { Injectable } from '@angular/core'; // Angular's dependency injection system
import { Observable, from, of, BehaviorSubject } from 'rxjs'; // Reactive programming utilities
import { catchError, tap } from 'rxjs/operators'; // RxJS operators for stream transformation

/**
 * LocationService
 *
 * This service handles all location-related functionality including:
 * - Getting the current geolocation position
 * - Saving/retrieving location data to/from localStorage
 * - Broadcasting location changes to other components
 *
 * It serves as a central source of truth for location data in the application.
 */
@Injectable({
  providedIn: 'root', // Makes this a singleton service available throughout the app
})
export class LocationService {
  // Create a BehaviorSubject to hold the current location
  // BehaviorSubject maintains the latest value and provides it to new subscribers
  private locationSubject = new BehaviorSubject<{
    lat: number;
    lon: number;
    name: string;
  } | null>(null);

  // Create an observable that other components can subscribe to
  // This is the public API that components use to receive location updates
  public locationChanged$ = this.locationSubject.asObservable();

  /**
   * Constructor - initializes the service and loads any saved location
   */
  constructor() {
    console.log('[LocationService] Service initialized');
    // Initialize with saved location if available
    const savedLocation = this.getLastLocation();
    this.locationSubject.next(savedLocation);
  }

  /**
   * Gets the user's current geographic position using the browser's Geolocation API
   * Returns an Observable that emits the position or null if there's an error
   *
   * @returns Observable<GeolocationPosition> - An observable that emits the user's position
   * @throws Error if geolocation is not supported by the browser
   */
  getCurrentPosition(): Observable<GeolocationPosition> {
    console.log('[LocationService] Getting current position');

    // Check if the Geolocation API is supported by the browser
    if (!navigator.geolocation) {
      console.error(
        '[LocationService] Geolocation is not supported by this browser'
      );
      throw new Error('Geolocation is not supported by this browser.');
    }

    // Convert the callback-based Geolocation API to an Observable
    return from(
      new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, // Request the most accurate position available
          timeout: 10000, // Time to wait for a position (10 seconds)
          maximumAge: 0, // Don't use a cached position
        });
      })
    ).pipe(
      // Log position when received (for debugging)
      tap((position) =>
        console.log('[LocationService] Position obtained:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      ),
      // Handle errors and return null rather than failing
      catchError((error) => {
        console.error(
          '[LocationService] Error getting current position',
          error
        );
        return of(null as unknown as GeolocationPosition);
      })
    );
  }

  /**
   * Saves location data to localStorage and notifies subscribers of the change
   *
   * @param lat - Latitude of the location
   * @param lon - Longitude of the location
   * @param name - Name of the location (e.g., city name)
   */
  saveLastLocation(lat: number, lon: number, name: string): void {
    console.log(`[LocationService] Saving location: ${name} (${lat}, ${lon})`);
    const location = { lat, lon, name };
    localStorage.setItem('lastLocation', JSON.stringify(location));

    // Notify all subscribers that the location has changed
    this.locationSubject.next(location);
  }

  /**
   * Retrieves the last saved location from localStorage
   *
   * @returns The location object with lat, lon, and name, or null if no location is saved
   */
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

  /**
   * Clears the saved location from localStorage and notifies subscribers
   * This effectively "forgets" the user's last location
   */
  clearLastLocation(): void {
    console.log('[LocationService] Clearing last location from localStorage');
    localStorage.removeItem('lastLocation');

    // Notify all subscribers that the location has been cleared
    this.locationSubject.next(null);
  }
}
