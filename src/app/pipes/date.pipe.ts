import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'date',
  standalone: true,
})
// Date pipe to transform unix timestamp into a readable date
export class DatePipe implements PipeTransform {
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
      const minutes = zero < 10 ? `0${zero}` : zero;

      return `${day}, ${date} ${month} ${hours}:${minutes}`;
    }

    // For other formats, you could implement additional formatting options
    return ts.toLocaleString();
  }
}
