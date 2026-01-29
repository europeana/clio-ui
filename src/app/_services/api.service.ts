import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  BreakdownRequest,
  BreakdownResults,
  DownloadRequest
} from '../_models';
import { dataServerRequest } from '../_data/static/data-server';
import { apiSettings } from '../../environments/apisettings';

@Injectable({ providedIn: 'root' })
export class APIService {
  constructor(private readonly http: HttpClient) {}

  getFilteredReports(request: BreakdownRequest): Observable<BreakdownResults> {
    return this.http
      .post<BreakdownResults>(`${apiSettings.serverAPI}/reports`, request)
      .pipe(
        catchError(() => {
          const fakeResult = dataServerRequest(request);
          console.log(
            'Server Failed: send static data = ',
            JSON.stringify(fakeResult, null, 4)
          );
          return of(fakeResult);
        })
      );
  }

  async download(data: string, downloadName: string): Promise<void> {
    const anchor = document.createElement('a');
    anchor.href = window.URL.createObjectURL(
      new Blob([data], { type: 'text/csv;charset=utf-8' })
    );
    anchor.target = '_blank';
    anchor.download = downloadName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  getDownload(request: DownloadRequest): void {
    const headers = new HttpHeaders().set('accept', 'text/csv');
    this.http
      .post<string>(`${apiSettings.serverAPI}/download`, request, {
        headers: headers
      })
      .subscribe((data: string) => {
        this.download(data, 'my_download');
      });
  }
}
