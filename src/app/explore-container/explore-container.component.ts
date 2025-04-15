import { Component, Input } from '@angular/core';

/**
 * ExploreContainerComponent
 *
 * A reusable component that displays a title and a link to Ionic documentation.
 * Used across multiple tab pages to provide placeholder content.
 */
@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
  standalone: false,
})
export class ExploreContainerComponent {
  /**
   * Optional title text to display in the container
   * Passed from parent components
   */
  @Input() name?: string;
}
