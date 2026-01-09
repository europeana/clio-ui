import { DatePipe, JsonPipe, NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReportItem } from '../_models';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  imports: [DatePipe, NgFor, JsonPipe]
})
export class ReportComponent {
  @Input() report: Array<ReportItem>;
  index = 0;

  nav(bump: number): void {
    this.index += bump;
    if (this.index < 0 && this.report) {
      this.index = this.report.length - 1;
    } else if (this.index >= this.report.length) {
      this.index = 0;
    }
  }
}
