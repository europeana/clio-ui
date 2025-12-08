import { JsonPipe, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { APIService } from './_services';
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
  data?: string;
  error?: HttpErrorResponse;

  @ViewChild('batchId') batchId!: ElementRef;

  loadReportByBatchId(): void {
    this.error = undefined;
    this.api.reportByBatchId('1234').subscribe(
      (data: string) => {
        this.data = data;
      },
      (err: HttpErrorResponse) => {
        this.error = err;
      },
    );
  }

  loadLatestReport(): void {
    this.error = undefined;
    this.api.latestReport().subscribe(
      (data: string) => {
        this.data = data;
      },
      (err: HttpErrorResponse) => {
        this.error = err;
      },
    );
  }

  loadBatches(): void {
    this.error = undefined;
    this.api.batches().subscribe(
      (data: string) => {
        this.data = data;
      },
      (err: HttpErrorResponse) => {
        this.error = err;
      },
    );
  }

  loadAvailableReports(): void {
    this.error = undefined;
    this.api.availableReports().subscribe(
      (data: string) => {
        this.data = data;
      },
      (err: HttpErrorResponse) => {
        this.error = err;
      },
    );
  }
}
