import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  AvailableReport,
  BatchItem,
  BreakdownRequest,
  BreakdownResults
} from '../_models';
import { dataServerRequest } from '../_data/static/data-server';
import { apiSettings } from '../../environments/apisettings';

@Injectable({ providedIn: 'root' })
export class APIService {
  constructor(private readonly http: HttpClient) {}

  loadCSV(url: string): Observable<string> {
    const headers = new HttpHeaders().set('accept', 'text/csv');
    return this.http.get<string>(url, {
      headers: headers,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      responseType: 'text' as any
    });
  }

  availableReports(): Observable<Array<AvailableReport>> {
    const url = `${apiSettings.serverAPI}/available-reports`;
    return this.http.get<Array<AvailableReport>>(url);
  }

  batches(maxResults = 1): Observable<Array<BatchItem>> {
    const url = `${apiSettings.serverAPI}/batches?maxResults=${maxResults}`;
    return this.http.get<Array<BatchItem>>(url);
  }

  latestReport(): Observable<string> {
    return this.loadCSV(`${apiSettings.serverAPI}/latest-report`);
  }

  reportByBatchId(id: string): Observable<string> {
    return this.loadCSV(
      `${apiSettings.serverAPI}/report-by-batch-id?batchId=${id}`
    );
  }

  getBreakdowns(request: BreakdownRequest): Observable<BreakdownResults> {
    return this.http
      .post<BreakdownResults>(`${apiSettings.serverAPI}`, request)
      .pipe(
        catchError(() => {
          const fakeResult = dataServerRequest(request);
          console.log(
            'Server Failed: send static data = ' +
              JSON.stringify(fakeResult, null, 4)
          );
          return of(fakeResult);
        })
      );
  }
}
