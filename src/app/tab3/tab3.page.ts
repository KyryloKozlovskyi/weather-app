import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { LocationService } from '../services/location.service';
import {
  informationCircleOutline,
  codeOutline,
  trashOutline,
  thermometerOutline,
  cloudDownloadOutline,
  contrastOutline,
  moonOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class Tab3Page implements OnInit {
  temperatureUnit = 'metric'; // Default to metric
  darkMode = 'system'; // Default to system
  savedLocation: any = null;

  constructor(
    private locationService: LocationService,
    private toastController: ToastController
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

    // Check if there are saved preferences in localStorage
    const savedUnit = localStorage.getItem('temperatureUnit');
    if (savedUnit) {
      this.temperatureUnit = savedUnit;
    }

    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      this.darkMode = savedTheme;
      this.applyTheme(this.darkMode);
    }
  }

  // Handle temperature unit change
  unitChanged(event: any) {
    this.temperatureUnit = event.detail.value;
    localStorage.setItem('temperatureUnit', this.temperatureUnit);
    this.showToast('Temperature unit updated');
  }

  // Handle theme change
  themeChanged(event: any) {
    this.darkMode = event.detail.value;
    localStorage.setItem('darkMode', this.darkMode);
    this.applyTheme(this.darkMode);
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
    } else if (theme === 'light') {
      document.body.classList.add('light');
    }
    // If 'system', do nothing and let the OS decide
  }
}
