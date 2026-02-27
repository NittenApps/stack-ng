import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { StackFormsModule } from '@nittenapps/forms';
import { StackMatFile } from './file.type';

@NgModule({
  declarations: [StackMatFile],
  imports: [
    CommonModule,
    FaIconComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    StackFormsModule.forChild({ types: [{ name: 'file', component: StackMatFile }] }),
  ],
})
export class StackMatFileModule {}
