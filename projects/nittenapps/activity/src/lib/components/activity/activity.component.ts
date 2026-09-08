import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Represents the top-level activity shell component.
 *
 * This component renders the nested activity routes through the Angular router
 * outlet so child activity views can be displayed within the activity feature
 * area.
 */
@Component({
    selector: 'nas-activity',
    imports: [RouterOutlet],
    template: `<router-outlet />`
})
export class ActivityComponent {}
