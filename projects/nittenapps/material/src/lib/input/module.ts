import { NgClass } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@nittenapps/common';
import { StackFormsModule } from '@nittenapps/forms';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { StackMatFormFieldModule } from '../form-field';
import { StackFieldInput } from './input.type';

@NgModule({
  declarations: [StackFieldInput],
  imports: [
    CommonModule,
    MatInputModule,
    NgClass,
    NgxMaskDirective,
    NgxMaskPipe,
    ReactiveFormsModule,
    StackMatFormFieldModule,
    StackFormsModule.forChild({
      types: [
        {
          name: 'input',
          component: StackFieldInput,
          wrappers: ['form-field'],
        },
        { name: 'string', extends: 'input' },
        {
          name: 'number',
          extends: 'input',
          defaultOptions: {
            props: {
              type: 'number',
              format: 'decimal',
            },
          },
        },
        {
          name: 'integer',
          extends: 'input',
          defaultOptions: {
            props: {
              type: 'number',
            },
          },
        },
        {
          name: 'percent',
          extends: 'input',
          defaultOptions: {
            props: {
              type: 'percent',
            },
          },
        },
        {
          name: 'date',
          extends: 'input',
          defaultOptions: {
            props: {
              type: 'date',
              format: 'date',
            },
          },
        },
        {
          name: 'datetime',
          extends: 'input',
          defaultOptions: {
            props: {
              type: 'date',
              format: 'datetime',
            },
          },
        },
        {
          name: 'uppercase',
          extends: 'input',
          defaultOptions: {
            props: {
              format: 'uppercase',
            },
          },
        },
        {
          name: 'lowercase',
          extends: 'input',
          defaultOptions: {
            props: {
              format: 'lowercase',
            },
          },
        },
        {
          name: 'textarea',
          extends: 'input',
          defaultOptions: {
            props: {
              type: 'textarea',
            },
          },
        },
      ],
    }),
  ],
})
export class StackMatInputModule {}
