import { Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from '../services/settings.service';

/**
 * Rain data transformation pipe
 *
 * This pipe processes precipitation data from weather API responses and formats it
 * according to the user's preferred unit system (metric or imperial).
 *
 * Usage example in template:
 * {{ rainData | rain:fullResponse }}
 */
@Pipe({
  name: 'rain',
  standalone: true,
})
export class RainPipe implements PipeTransform {
  /**
   * Injects the SettingsService to access user preferences for unit display
   */
  constructor(private settingsService: SettingsService) {}

  /**
   * Transforms rain precipitation data to the correct format and unit system
   *
   * @param value - Rain precipitation data which can be in different formats:
   *                - Object with "1h" property: { "1h": 0.5 }
   *                - Direct number value
   * @param resp - Full API response (currently unused but available for context)
   * @returns Formatted rain amount in mm (metric) or inches (imperial), with 2 decimal places
   *
   * The pipe:
   * 1. Extracts rain data from potentially different API response structures
   * 2. Converts to inches if the user has selected imperial units
   * 3. Returns the value rounded to 2 decimal places
   */
  transform(value: any, resp: any): number {
    // Extract rain data - handle potentially different API response structures
    let rainAmount = 0;

    if (value && typeof value === 'object' && value['1h']) {
      rainAmount = value['1h']; // If it's in the format { "1h": 0.5 }
    } else if (typeof value === 'number') {
      rainAmount = value; // If it's directly a number
    }

    // Convert to inches if units are imperial
    if (this.settingsService.getUnits() === 'imperial') {
      // 1 mm = 0.0393701 inches - using same factor as in SettingsService
      return Number((rainAmount * 0.0393701).toFixed(2));
    }

    return Number(rainAmount.toFixed(2));
  }
}
