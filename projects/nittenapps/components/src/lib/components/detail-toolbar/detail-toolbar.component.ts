import { NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { FaDuotoneIconComponent, FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faFloppyDisk } from '@fortawesome/pro-duotone-svg-icons';
import { faArrowLeft } from '@fortawesome/pro-solid-svg-icons';

@Component({
    selector: 'nas-detail-toolbar',
    imports: [
        FaDuotoneIconComponent,
        FaIconComponent,
        MatButtonModule,
        MatToolbarModule,
        MatTooltipModule,
        NgTemplateOutlet,
    ],
    templateUrl: './detail-toolbar.component.html',
    styleUrl: './detail-toolbar.component.scss'
})
export class DetailToolbarComponent {
  readonly faArrowLeft = faArrowLeft;
  readonly faFloppyDisk = faFloppyDisk;

  @ContentChild('leftActions') leftActions: TemplateRef<any> | null = null;
  @ContentChild('rightActions') rightActions: TemplateRef<any> | null = null;

  @Input() allowSave = true;
  @Input() canSave = true;

  @Output() save = new EventEmitter<void>();

  constructor(private route: ActivatedRoute, private router: Router) {}

  _back(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  _save(): void {
    this.save.emit();
  }
}
