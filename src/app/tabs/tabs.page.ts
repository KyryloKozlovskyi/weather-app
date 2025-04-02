import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { IonTabs, GestureController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class TabsPage implements AfterViewInit {
  @ViewChild(IonTabs) tabs!: IonTabs;
  tabNames = ['tab1', 'tab2', 'tab3'];
  currentTab = 0;

  constructor(private gestureController: GestureController) {}

  ngAfterViewInit() {
    setTimeout(() => {
      // Wait for the tabs to be fully initialized
      this.setupSwipeGesture();
    }, 300);
  }

  setupSwipeGesture() {
    const tabsElement = document.querySelector('ion-tabs');
    if (!tabsElement) return;

    const contentElement = tabsElement.querySelector('div.tabs-inner');
    if (!contentElement) return;

    // Create the gesture
    const gesture = this.gestureController.create({
      el: contentElement,
      threshold: 50,
      direction: 'x',
      gestureName: 'tab-swipe',
      onStart: () => {},
      onMove: () => {},
      onEnd: (ev) => {
        const deltaX = ev.deltaX;

        if (deltaX > 100) {
          // Swipe right (go to previous tab)
          this.navigateToPreviousTab();
        } else if (deltaX < -100) {
          // Swipe left (go to next tab)
          this.navigateToNextTab();
        }
      },
    });

    // Enable the gesture
    gesture.enable();
  }

  navigateToPreviousTab() {
    // Use the @ViewChild reference instead of querySelector
    if (!this.tabs) return;

    const activeTab = this.tabs.getSelected();
    const currentIndex = this.tabNames.findIndex((name) => name === activeTab);

    if (currentIndex > 0) {
      this.tabs.select(this.tabNames[currentIndex - 1]);
    }
  }

  navigateToNextTab() {
    // Use the @ViewChild reference instead of querySelector
    if (!this.tabs) return;

    const activeTab = this.tabs.getSelected();
    const currentIndex = this.tabNames.findIndex((name) => name === activeTab);

    if (currentIndex < this.tabNames.length - 1) {
      this.tabs.select(this.tabNames[currentIndex + 1]);
    }
  }
}
