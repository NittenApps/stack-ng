import { NgStyle } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { StackFormsModule } from '@nittenapps/forms';
import { addonsExtension } from './addons.extension';
import { StackWrapperAddons } from './addons.wrapper';

@NgModule({
  declarations: [StackWrapperAddons],
  imports: [
    FaIconComponent,
    MatButtonModule,
    MatIconModule,
    NgStyle,
    StackFormsModule.forChild({
      wrappers: [{ name: 'addons', component: StackWrapperAddons }],
      extensions: [{ name: 'addons', extension: { onPopulate: addonsExtension } }],
    }),
  ],
})
export class StackMatAddonsModule {}
