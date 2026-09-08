import { Pipe, PipeTransform } from '@angular/core';

/**
 * Angular pipe that returns the JavaScript type of a value.
 *
 * @example
 * ```html
 * {{ value | typeof }}
 * ```
 */
@Pipe({
  name: 'typeof',
  standalone: true,
})
export class TypeofPipe implements PipeTransform {
  /**
   * Returns the JavaScript `typeof` result for the provided value.
   *
   * @param value The value whose type should be determined.
   * @returns The JavaScript type of the value.
   */
  transform(value: any) {
    return typeof value;
  }
}
