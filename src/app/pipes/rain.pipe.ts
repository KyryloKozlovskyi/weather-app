import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rain',
  standalone: true,
})
export class RainPipe implements PipeTransform {
  transform(rainfall: unknown, weatherData?: any): unknown {
    // Check if rainfall data exists directly
    if (rainfall && typeof rainfall === 'object' && '1h' in rainfall) {
      return rainfall['1h'];
    }

    // If no direct rainfall data, check daily forecast
    if (weatherData && weatherData.daily && weatherData.daily.length > 0) {
      // Get today's rainfall from daily forecast
      const todayRainfall = weatherData.daily[0].rain;
      if (todayRainfall !== undefined) {
        return todayRainfall;
      }
    }

    // If no rainfall data found, return 0
    return '0';
  }
}
