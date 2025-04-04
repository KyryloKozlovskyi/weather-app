import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AppComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    this.applyTheme();
  }

  private applyTheme() {
    // Get saved theme preference from localStorage
    const savedTheme = localStorage.getItem('darkMode') || 'system';

    document.body.classList.remove('dark', 'light');

    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
      document.documentElement.setAttribute('color-scheme', 'dark');
    } else if (savedTheme === 'light') {
      document.body.classList.add('light');
      document.documentElement.setAttribute('color-scheme', 'light');
    } else if (savedTheme === 'system') {
      // Check system preference
      const darkModeMediaQuery = window.matchMedia(
        '(prefers-color-scheme: dark)'
      );
      const isDarkMode = darkModeMediaQuery.matches;

      document.body.classList.add(isDarkMode ? 'dark' : 'light');
      document.documentElement.setAttribute(
        'color-scheme',
        isDarkMode ? 'dark' : 'light'
      );

      // Listen for changes in system preference when using system setting
      darkModeMediaQuery.addEventListener('change', (e) => {
        if (localStorage.getItem('darkMode') === 'system') {
          document.body.classList.remove('dark', 'light');
          document.body.classList.add(e.matches ? 'dark' : 'light');
          document.documentElement.setAttribute(
            'color-scheme',
            e.matches ? 'dark' : 'light'
          );
        }
      });
    }
  }
}
