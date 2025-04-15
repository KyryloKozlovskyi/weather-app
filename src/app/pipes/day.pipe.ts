import { Pipe, PipeTransform } from '@angular/core';

/**
 * Day pipe for transforming Unix timestamps into abbreviated day names
 *
 * This pipe converts Unix timestamps (in seconds) into human-readable
 * three-letter abbreviations for days of the week (Sun, Mon, Tue, etc.).
 *
 * Usage example in template:
 * {{ unixTimestamp | day }}
 */
@Pipe({
  name: 'day',
  standalone: true,
})
export class DayPipe implements PipeTransform {
  /**
   * Transforms a Unix timestamp into a day of the week abbreviation
   *
   * @param value - Unix timestamp in seconds (can be number or string)
   * @returns Three-letter abbreviation for the day of week (Sun, Mon, Tue, etc.)
   *
   * The method:
   * 1. Converts Unix timestamp (seconds) to milliseconds and creates a Date object
   * 2. Uses the Date.getDay() method to get day index (0-6, where 0 is Sunday)
   * 3. Returns the corresponding day abbreviation from the daylist array
   */
  transform(value: any): unknown {
    let day = new Date(+value * 1000); // Convert Unix timestamp to JavaScript Date object
    let daylist = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // Array of weekday abbreviations
    return daylist[day.getDay()];
  }
}
