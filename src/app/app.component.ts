import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

/**
 * Root component of the weather application.
 * Handles theme application based on user preferences.
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule], // Required imports for standalone component
})
export class AppComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    // Apply theme on component initialization
    this.applyTheme();
  }

  /**
   * Applies theme based on user preference stored in localStorage.
   * Supports three modes: 'dark', 'light', and 'system' (follows OS setting).
   */
  private applyTheme() {
    // Get saved theme preference from localStorage, default to 'system' if not set
    const savedTheme = localStorage.getItem('darkMode') || 'system';

    // Remove any existing theme classes to start fresh
    document.body.classList.remove('dark', 'light');

    if (savedTheme === 'dark') {
      // Apply dark theme when explicitly selected
      document.body.classList.add('dark');
      document.documentElement.setAttribute('color-scheme', 'dark');
    } else if (savedTheme === 'light') {
      // Apply light theme when explicitly selected
      document.body.classList.add('light');
      document.documentElement.setAttribute('color-scheme', 'light');
    } else if (savedTheme === 'system') {
      // Use system preference when 'system' is selected
      const darkModeMediaQuery = window.matchMedia(
        '(prefers-color-scheme: dark)'
      );
      const isDarkMode = darkModeMediaQuery.matches;

      // Apply appropriate theme based on system preference
      document.body.classList.add(isDarkMode ? 'dark' : 'light');
      document.documentElement.setAttribute(
        'color-scheme',
        isDarkMode ? 'dark' : 'light'
      );

      // Listen for changes in system preference when using system setting
      darkModeMediaQuery.addEventListener('change', (e) => {
        // Only update theme if user still has 'system' preference
        if (localStorage.getItem('darkMode') === 'system') {
          // Remove existing theme classes
          document.body.classList.remove('dark', 'light');
          // Apply new theme based on updated system preference
          document.body.classList.add(e.matches ? 'dark' : 'light');
          // Update color-scheme attribute for browser compatibility
          document.documentElement.setAttribute(
            'color-scheme',
            e.matches ? 'dark' : 'light'
          );
        }
      });
    }
  }
}
