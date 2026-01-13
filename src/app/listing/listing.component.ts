import { DatePipe, NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';

import {
  FormControl,
  UntypedFormBuilder,
  UntypedFormGroup
} from '@angular/forms';

import { DATE_VERBOSE_FMT } from '../_data/static/date-formats';
import { ClickAwareDirective } from '../_directives';
import { AvailableReport, ReportItem } from '../_models';
import { APIService } from '../_services';
import { CheckboxComponent } from '../checkbox';

import { ReportComponent } from '../report';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
  imports: [
    CheckboxComponent,
    ClickAwareDirective,
    DatePipe,
    NgClass,
    ReportComponent
  ]
})
export class ListingComponent implements OnInit {
  public DATE_VERBOSE_FMT = DATE_VERBOSE_FMT;

  api = inject(APIService);
  latestList: Array<AvailableReport>;
  listSelectionCount = 0;
  listScore = 0;

  previewedId?: number;
  browsableReport?: Array<ReportItem>;

  private readonly fb = inject(UntypedFormBuilder);

  form: UntypedFormGroup;

  ngOnInit(): void {
    const formGroup = new UntypedFormGroup({});
    this.form = new UntypedFormGroup({
      record_ids: formGroup
    });
    this.loadLatestReports();
  }

  closeReport(): void {
    this.previewedId = undefined;
    this.browsableReport = undefined;
  }

  updateIds(): void {
    const vals = this.form.value['record_ids'];

    this.listSelectionCount = Object.keys(vals).filter((key: string) => {
      return vals[key];
    }).length;

    this.listScore = Math.floor(Math.random() * 5);
  }

  loadLatestReports(): void {
    this.api.loadLatestListJSON().subscribe((data: Array<AvailableReport>) => {
      const formGroup = this.form.get('record_ids') as UntypedFormGroup;
      data.forEach((report: AvailableReport) => {
        formGroup.addControl(report.reportId + '', new FormControl(true, []));
      });

      setTimeout(() => {
        this.listSelectionCount = data.length;
        this.latestList = data;
      }, 100);
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
