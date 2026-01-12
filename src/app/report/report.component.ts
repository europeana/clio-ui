import { DatePipe, NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReportItem } from '../_models';
import { DATE_VERBOSE_FMT } from '../_data/static/date-formats';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  imports: [DatePipe, NgFor]
})
export class ReportComponent {
  public DATE_VERBOSE_FMT = DATE_VERBOSE_FMT;

  @Input() report: Array<ReportItem>;
  index = 0;

  nav(bump: number): void {
    if (!this.report) {
      return;
    }
    this.index += bump;
    if (this.index < 0) {
      this.index = Math.max(0, this.report.length - 1);
    } else if (this.index >= this.report.length) {
      this.index = 0;
    }
  }
}
