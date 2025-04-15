import { Pipe, PipeTransform } from '@angular/core';

/**
 * Date pipe for formatting Unix timestamps into human-readable dates
 *
 * This pipe transforms Unix timestamps into formatted date strings with
 * customizable output formats.
 *
 * Usage examples in templates:
 * {{ unixTimestamp | date }}
 * {{ unixTimestamp | date:'string' }}
 */
@Pipe({
  name: 'date',
  standalone: true,
})
export class DatePipe implements PipeTransform {
  /**
   * Transforms a Unix timestamp into a formatted date string
   *
   * @param timestamp - Unix timestamp in seconds (can be number or string)
   * @param format - Optional format specifier ('string' for default formatting,
   *                 omit for the same default format, or use other values for locale-based formatting)
   * @returns Formatted date string
   *
   * The method:
   * 1. Converts the input timestamp to a JavaScript Date object
   * 2. Formats the date based on the specified format:
   *    - Default format ('string' or undefined): "Day, Date Month Hours:Minutes" (e.g., "Mon, 15 Apr 10:30")
   *    - Other formats: Uses JavaScript's built-in toLocaleString() method
   */
  transform(timestamp: string | number, format?: string): string {
    // Handle both string and number inputs
    const ts = new Date(
      typeof timestamp === 'number' ? timestamp : +timestamp * 1000
    );

    // If format is specified and is 'string', use default formatting
    if (format === 'string' || !format) {
      const m = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      const d = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const zero = ts.getMinutes();

      // Format the date
      const day = d[ts.getDay()];
      const date = ts.getDate();
      const month = m[ts.getMonth()];
      const hours = ts.getHours();
      const minutes = zero < 10 ? `0${zero}` : zero; // Add leading zero for minutes less than 10

      return `${day}, ${date} ${month} ${hours}:${minutes}`;
    }

    // For other formats, you could implement additional formatting options
    return ts.toLocaleString();
  }
}
