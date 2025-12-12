import { Component, Input, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FaDuotoneIconComponent, FaIconComponent } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

@Component({
    selector: 'nas-icon',
    imports: [FaDuotoneIconComponent, FaIconComponent, MatIconModule],
    templateUrl: './icon.component.html'
})
export class IconComponent {
  @Input() class?: string;
  @Input() icon!: string | IconProp;
  @Input() type!: 'mat' | 'fa' | 'fad';
  @Input() swapOpacity: boolean = false;
}
