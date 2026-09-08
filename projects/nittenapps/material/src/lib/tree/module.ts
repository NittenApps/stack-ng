import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { StackFormsModule } from '@nittenapps/forms';
import { StackFieldTree } from './tree.type';

@NgModule({
  declarations: [StackFieldTree],
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatIconModule,
    MatTreeModule,
    ReactiveFormsModule,
    StackFormsModule.forChild({ types: [{ name: 'tree', component: StackFieldTree }] }),
  ],
})
export class StackMatTreeModule {}
