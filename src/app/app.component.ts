import { JsonPipe, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AvailableReport, BatchItem } from './_models';
import { APIService, ExportCSVService } from './_services';
import { HeaderComponent } from './header';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [HeaderComponent, JsonPipe, NgIf, NgTemplateOutlet],
})
export class AppComponent {
  title = 'Clio UI';
  api = inject(APIService);
  exportCSV = inject(ExportCSVService);

  data?: string;
  error?: HttpErrorResponse;

  @ViewChild('batchId') batchId!: ElementRef;
  @ViewChild('downloadAnchor') downloadAnchor!: ElementRef;

  loadReportByBatchId(batchParam: string): void {
    this.error = undefined;
    this.api.reportByBatchId(batchParam).subscribe(
      (data: string) => {
        this.data = data;
      },
      (err: HttpErrorResponse) => {
        this.error = err;
      },
    );
  }

  loadLatestReport(download = false): void {
    this.error = undefined;
    this.api.latestReport().subscribe(
      (data: string) => {
        this.data = data;
        if (download) {
          this.exportCSV.download(data, 'latest-report');
        }
      },
      (err: HttpErrorResponse) => {
        this.error = err;
      },
    );
  }

  downloadLatestReport(): void {
    this.loadLatestReport(true);
  }

  loadBatches(download = false): void {
    this.error = undefined;
    this.api.batches().subscribe(
      (data: Array<BatchItem>) => {
        this.data = JSON.stringify(data);
        if (download) {
          const fileData = this.exportCSV.csvFromBatchItem(data);
          this.exportCSV.download(fileData, 'recent-batches');
        }
      },
      (err: HttpErrorResponse) => {
        this.error = err;
      },
    );
  }

  downloadBatches(): void {
    this.loadBatches(true);
  }

  loadAvailableReports(download = false): void {
    this.error = undefined;
    this.api.availableReports().subscribe(
      (data: Array<AvailableReport>) => {
        this.data = JSON.stringify(data);
        if (download) {
          const fileData = this.exportCSV.csvFromAvailableReport(data);
          this.exportCSV.download(fileData, 'available-reports');
        }
      },
      (err: HttpErrorResponse) => {
        this.error = err;
      },
    );
  }

  downloadAvailableReports(): void {
    this.loadAvailableReports(true);
  }
}
