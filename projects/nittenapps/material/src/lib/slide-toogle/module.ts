import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { StackFormsModule } from '@nittenapps/forms';
import { StackMatFormFieldModule } from '../form-field';
import { StackFieldToggle } from './slide-toggle.type';

@NgModule({
  declarations: [StackFieldToggle],
  imports: [
    CommonModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    StackMatFormFieldModule,
    StackFormsModule.forChild({ types: [{ name: 'toggle', component: StackFieldToggle }] }),
  ],
})
export class StackMatToggleModule {}
