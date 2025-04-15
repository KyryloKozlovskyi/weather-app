import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { IonTabs, GestureController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/**
 * TabsPage component handles the tab navigation with swipe gestures
 * This allows users to navigate between tabs by swiping left or right
 */
@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class TabsPage implements AfterViewInit {
  // Get access to the IonTabs component from the template
  @ViewChild(IonTabs) tabs!: IonTabs;
  // Define the tab IDs used in the application
  tabNames = ['tab1', 'tab2', 'tab3'];
  // Track the current active tab index
  currentTab = 0;

  // Inject the GestureController to create swipe gestures
  constructor(private gestureController: GestureController) {}

  /**
   * After the view initializes, set up swipe gesture detection
   * Uses setTimeout to ensure tabs are fully rendered
   */
  ngAfterViewInit() {
    setTimeout(() => {
      // Wait for the tabs to be fully initialized
      this.setupSwipeGesture();
    }, 300);
  }

  /**
   * Configures swipe gesture detection for tab navigation
   * Detects horizontal swipes and navigates between tabs accordingly
   */
  setupSwipeGesture() {
    // Get the parent tabs element from the DOM
    const tabsElement = document.querySelector('ion-tabs');
    if (!tabsElement) return;

    // Get the content area inside the tabs where gestures should be detected
    const contentElement = tabsElement.querySelector('div.tabs-inner');
    if (!contentElement) return;

    // Create the gesture configuration for swipe detection
    const gesture = this.gestureController.create({
      el: contentElement, // Element to attach gesture detection to
      threshold: 50, // Minimum distance required before recognizing
      direction: 'x', // Only detect horizontal swipes
      gestureName: 'tab-swipe', // Name for this gesture
      onStart: () => {}, // Handler for gesture start (empty)
      onMove: () => {}, // Handler for gesture movement (empty)
      onEnd: (ev) => {
        // Get the final horizontal distance swiped
        const deltaX = ev.deltaX;

        // Determine swipe direction and navigate accordingly
        if (deltaX > 100) {
          // Swipe right (go to previous tab)
          this.navigateToPreviousTab();
        } else if (deltaX < -100) {
          // Swipe left (go to next tab)
          this.navigateToNextTab();
        }
      },
    });

    // Enable the gesture detection
    gesture.enable();
  }

  /**
   * Navigate to the previous tab in the sequence if available
   * Uses the IonTabs API to change the selected tab
   */
  navigateToPreviousTab() {
    // Use the @ViewChild reference instead of querySelector
    if (!this.tabs) return;

    // Get the currently active tab ID
    const activeTab = this.tabs.getSelected();
    // Find its index in our tab array
    const currentIndex = this.tabNames.findIndex((name) => name === activeTab);

    // If not at the first tab, go to the previous one
    if (currentIndex > 0) {
      this.tabs.select(this.tabNames[currentIndex - 1]);
    }
  }

  /**
   * Navigate to the next tab in the sequence if available
   * Uses the IonTabs API to change the selected tab
   */
  navigateToNextTab() {
    // Use the @ViewChild reference instead of querySelector
    if (!this.tabs) return;

    // Get the currently active tab ID
    const activeTab = this.tabs.getSelected();
    // Find its index in our tab array
    const currentIndex = this.tabNames.findIndex((name) => name === activeTab);

    // If not at the last tab, go to the next one
    if (currentIndex < this.tabNames.length - 1) {
      this.tabs.select(this.tabNames[currentIndex + 1]);
    }
  }
}
