import { NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { FaDuotoneIconComponent } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/pro-duotone-svg-icons';

/**
 * Toolbar component for list pages with optional action slots.
 *
 * Provides a Material toolbar that can render custom content in the left and right action areas,
 * and exposes an `allowNew` flag to enable or disable the default "new item" action.
 */
@Component({
  selector: 'nas-list-toolbar',
  imports: [FaDuotoneIconComponent, MatButtonModule, MatToolbarModule, MatTooltipModule, NgTemplateOutlet, RouterLink],
  templateUrl: './list-toolbar.component.html',
  styleUrl: './list-toolbar.component.scss',
})
export class ListToolbarComponent {
  readonly faPlus = faPlus;

  /**
   * Template rendered in the left section of the toolbar.
   */
  @ContentChild('leftActions') leftActions: TemplateRef<any> | null = null;

  /**
   * Template rendered in the right section of the toolbar.
   */
  @ContentChild('rightActions') rightActions: TemplateRef<any> | null = null;

  /**
   * Whether the default "new" action button is enabled.
   */
  @Input() allowNew = true;
}
