import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StackFormsModule } from '@nittenapps/forms';
import { FaDuotoneIconComponent, FaIconComponent } from '@fortawesome/angular-fontawesome';

import { StackMatButton } from './button.type';

@NgModule({
  declarations: [StackMatButton],
  imports: [
    CommonModule,
    FaDuotoneIconComponent,
    FaIconComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    StackFormsModule.forChild({
      types: [{ name: 'button', component: StackMatButton }],
    }),
  ],
})
export class StackMatButtonModule {}
