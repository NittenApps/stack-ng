import { NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { FaDuotoneIconComponent } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/pro-duotone-svg-icons';

@Component({
    selector: 'nas-list-toolbar',
    imports: [FaDuotoneIconComponent, MatButtonModule, MatToolbarModule, MatTooltipModule, NgTemplateOutlet, RouterLink],
    templateUrl: './list-toolbar.component.html',
    styleUrl: './list-toolbar.component.scss'
})
export class ListToolbarComponent {
  readonly faPlus = faPlus;

  @ContentChild('leftActions') leftActions: TemplateRef<any> | null = null;
  @ContentChild('rightActions') rightActions: TemplateRef<any> | null = null;

  @Input() allowNew = true;
}
