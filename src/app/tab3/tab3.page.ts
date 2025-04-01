import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { LocationService } from '../services/location.service';
import { SettingsService } from '../services/settings.service';
import { addIcons } from 'ionicons';
import {
  informationCircleOutline,
  codeOutline,
  trashOutline,
  thermometerOutline,
  cloudDownloadOutline,
  contrastOutline,
  moonOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class Tab3Page implements OnInit, OnDestroy {
  temperatureUnit = 'metric'; // Default to metric
  darkMode: string = 'system'; // Default to system
  savedLocation: any = null;
  private darkModeMediaQuery: MediaQueryList | null = null;
  private darkModeChangeHandler: ((e: MediaQueryListEvent) => void) | null = null;

  constructor(
    private locationService: LocationService,
    private toastController: ToastController,
    private settingsService: SettingsService
  ) {
    addIcons({
      informationCircleOutline,
      codeOutline,
      trashOutline,
      thermometerOutline,
      cloudDownloadOutline,
      contrastOutline,
      moonOutline,
    });
  }

  ngOnInit() {
    // Check if there's a saved location
    this.savedLocation = this.locationService.getLastLocation();

    // Get current temperature unit from the service
    this.temperatureUnit = this.settingsService.currentTemperatureUnit;

    // Load saved theme preference
    const savedTheme = localStorage.getItem('darkMode') || 'system';
    this.darkMode = savedTheme;
    this.applyTheme(this.darkMode);
  }

  ngOnDestroy() {
    // Clean up event listener to prevent memory leaks
    if (this.darkModeMediaQuery && this.darkModeChangeHandler) {
      this.darkModeMediaQuery.removeEventListener('change', this.darkModeChangeHandler);
    }
  }

  // Handle temperature unit change
  unitChanged(event: any) {
    this.temperatureUnit = event.detail.value;
    this.settingsService.setTemperatureUnit(this.temperatureUnit);
    this.showToast('Temperature unit updated');
  }

  // Handle theme change
  themeChanged(event: any) {
    this.darkMode = event.detail.value;
    localStorage.setItem('darkMode', this.darkMode);
    this.applyTheme(this.darkMode);
    
    // Force Ionic components to update their styles
    document.querySelector('ion-content')?.classList.add('force-refresh');
    setTimeout(() => {
      document.querySelector('ion-content')?.classList.remove('force-refresh');
    }, 10);
    
    this.showToast('Theme preference updated');
  }

  // Delete saved location
  clearSavedLocation() {
    this.locationService.clearLastLocation();
    this.savedLocation = null;
    this.showToast('Saved location cleared');
  }

  // Show toast message
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'success',
      cssClass: 'toast-message',
    });
    await toast.present();
  }

  // Apply theme based on selection
  private applyTheme(theme: string) {
    document.body.classList.remove('dark', 'light');

    if (theme === 'dark') {
      document.body.classList.add('dark');
      document.documentElement.setAttribute('color-scheme', 'dark');
    } else if (theme === 'light') {
      document.body.classList.add('light');
      document.documentElement.setAttribute('color-scheme', 'light');
    } else if (theme === 'system') {
      // Clean up previous listener if exists
      if (this.darkModeMediaQuery && this.darkModeChangeHandler) {
        this.darkModeMediaQuery.removeEventListener('change', this.darkModeChangeHandler);
      }

      // Check system preference
      this.darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const isDarkMode = this.darkModeMediaQuery.matches;
      
      document.body.classList.add(isDarkMode ? 'dark' : 'light');
      document.documentElement.setAttribute('color-scheme', isDarkMode ? 'dark' : 'light');

      // Listen for changes in system preference
      this.darkModeChangeHandler = (e) => {
        if (this.darkMode === 'system') {
          document.body.classList.remove('dark', 'light');
          document.body.classList.add(e.matches ? 'dark' : 'light');
          document.documentElement.setAttribute('color-scheme', e.matches ? 'dark' : 'light');
        }
      };

      this.darkModeMediaQuery.addEventListener('change', this.darkModeChangeHandler);
    }

    // Force component update by triggering change detection
    setTimeout(() => {
      // This triggers a style recalculation
      window.dispatchEvent(new Event('resize'));
    }, 10);
  }
}
