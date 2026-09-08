import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FaDuotoneIconComponent, FaIconComponent } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

/**
 * Renders material icons or Font Awesome icons based on the selected type.
 *
 * @selector nas-icon
 * @standalone
 *
 * @example
 * <nas-icon type="mat" icon="home"></nas-icon>
 * <nas-icon type="fa" icon="coffee"></nas-icon>
 * <nas-icon type="fad" icon="star"></nas-icon>
 */
@Component({
  selector: 'nas-icon',
  imports: [FaDuotoneIconComponent, FaIconComponent, MatIconModule],
  templateUrl: './icon.component.html',
})
export class IconComponent {
  /**
   * Optional CSS classes to add to the icon element.
   */
  @Input() class?: string;

  /**
   * The icon to render. Accepts a Material icon name or a Font Awesome icon definition.
   */
  @Input() icon!: string | IconProp;

  /**
   * The icon library to use.
   *
   * - `mat`: Angular Material icon
   * - `fa`: Font Awesome icon
   * - `fad`: Font Awesome duotone icon
   */
  @Input() type!: 'mat' | 'fa' | 'fad';

  /**
   * Enables opacity swapping behavior for the icon when supported by the selected icon type.
   */
  @Input() swapOpacity: boolean = false;
}
