import { Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from '../services/settings.service';

@Pipe({
  name: 'rain',
  standalone: true,
})
export class RainPipe implements PipeTransform {
  constructor(private settingsService: SettingsService) {}

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
