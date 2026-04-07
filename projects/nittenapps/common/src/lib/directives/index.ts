import { Provider } from '@angular/core';
import { LowercaseDirective } from './lowercase/lowercase.directive';
import { NormalizeValueDirective } from './normalize-value/normalize-value.directive';
import { NumberFormatDirective } from './number-format/number-format.directive';
import { UppercaseDirective } from './uppercase/uppercase.directive';
import { DisplayWithDirective } from './display-with/display-with.directive';

export { DisplayWithDirective, LowercaseDirective, NormalizeValueDirective, NumberFormatDirective, UppercaseDirective };

/** Reusable directives exposed by the common package. */
export const COMMON_DIRECTIVES: Provider[] = [
  DisplayWithDirective,
  LowercaseDirective,
  NormalizeValueDirective,
  NumberFormatDirective,
  UppercaseDirective,
];
