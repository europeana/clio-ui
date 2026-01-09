import { DatePipe, JsonPipe, NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';

import { DATE_VERBOSE_FMT } from '../_data/static/date-formats';
import { AvailableReport } from '../_models';
import { APIService } from '../_services';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
  imports: [DatePipe, JsonPipe, NgClass]
})
export class ListingComponent implements OnInit {
  public DATE_VERBOSE_FMT = DATE_VERBOSE_FMT;

  api = inject(APIService);
  latestList: Array<AvailableReport>;
  previewedId?: number;

  ngOnInit(): void {
    this.loadLatestReports();
  }

  loadLatestReports(): void {
    this.api.loadLatestListJSON().subscribe((data: Array<AvailableReport>) => {
      this.latestList = data;
    });
  }

  openPreview(id: number): void {
    this.previewedId = this.previewedId === id ? undefined : id;
  }
}
