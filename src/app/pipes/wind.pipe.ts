import { Pipe, PipeTransform } from '@angular/core';

/**
 * Wind direction pipe that converts wind degrees to cardinal directions
 *
 * This pipe transforms numerical wind degree values (0-360) into
 * human-readable cardinal directions (N, NE, E, SE, S, SW, W, NW).
 *
 * Usage example in template:
 * {{ windDegreeValue | wind }}
 */
@Pipe({
  name: 'wind',
  standalone: true,
})
export class WindPipe implements PipeTransform {
  /**
   * Transforms wind direction in degrees to cardinal direction
   *
   * @param degrees - Wind direction in degrees (0-360)
   * @returns Cardinal direction as a string (N, NE, E, SE, S, SW, W, NW)
   *          or 'Invalid degrees' if value is outside 0-360 range
   *
   * Direction mappings:
   * - North (N): 0° to <45°
   * - Northeast (NE): 45° to 90°
   * - East (E): >90° to 135°
   * - Southeast (SE): >135° to 180°
   * - South (S): >180° to 225°
   * - Southwest (SW): >225° to 270°
   * - West (W): >270° to 315°
   * - Northwest (NW): >315° to 360°
   */
  transform(degrees: number): string {
    if (degrees >= 0 && degrees < 45) {
      return 'N';
    } else if (degrees >= 45 && degrees <= 90) {
      return 'NE';
    } else if (degrees >= 90 && degrees <= 135) {
      return 'E';
    } else if (degrees >= 135 && degrees <= 180) {
      return 'SE';
    } else if (degrees >= 180 && degrees <= 225) {
      return 'S';
    } else if (degrees >= 225 && degrees <= 270) {
      return 'SW';
    } else if (degrees >= 270 && degrees <= 315) {
      return 'W';
    } else if (degrees >= 315 && degrees <= 360) {
      return 'NW';
    } else {
      return 'Invalid degrees';
    }
  }
}
