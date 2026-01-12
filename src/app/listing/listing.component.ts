import { DatePipe, NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';

import { DATE_VERBOSE_FMT } from '../_data/static/date-formats';
import { ClickAwareDirective } from '../_directives';
import { AvailableReport, ReportItem } from '../_models';
import { APIService } from '../_services';

import { ReportComponent } from '../report';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
  imports: [ClickAwareDirective, DatePipe, NgClass, ReportComponent]
})
export class ListingComponent implements OnInit {
  public DATE_VERBOSE_FMT = DATE_VERBOSE_FMT;

  api = inject(APIService);
  latestList: Array<AvailableReport>;
  previewedId?: number;
  browsableReport?: Array<ReportItem>;

  ngOnInit(): void {
    this.loadLatestReports();
  }

  closeReport(): void {
    this.previewedId = undefined;
    this.browsableReport = undefined;
  }

  loadLatestReports(): void {
    this.api.loadLatestListJSON().subscribe((data: Array<AvailableReport>) => {
      this.latestList = data;
    });
  }

  openPreview(id: number): void {
    this.previewedId = this.previewedId === id ? undefined : id;

    if (!this.previewedId) {
      return;
    }

    this.api.loadLatestReportJSON().subscribe((data: Array<ReportItem>) => {
      this.browsableReport = data;
    });
  }
}
