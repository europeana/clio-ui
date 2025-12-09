import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AvailableReport, BatchItem } from '../_models';
import { apiSettings } from '../../environments/apisettings';

@Injectable({ providedIn: 'root' })
export class APIService {
  constructor(private readonly http: HttpClient) {}

  availableReports(): Observable<Array<AvailableReport>> {
    const url = `${apiSettings.serverAPI}/available-reports`;
    return this.http.get<Array<AvailableReport>>(url);
  }

  batches(): Observable<Array<BatchItem>> {
    const url = `${apiSettings.serverAPI}/batches?maxResults=1`;
    return this.http.get<Array<BatchItem>>(url);
  }

  latestReport(): Observable<string> {
    const url = `${apiSettings.serverAPI}/latest-report`;
    const headers = new HttpHeaders().set('accept', 'text/csv');
    return this.http.get<string>(url, {
      headers: headers,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      responseType: 'text' as any,
    });
  }

  reportByBatchId(id: string): Observable<string> {
    const url = `${apiSettings.serverAPI}/report-by-batch-id?batchId=${id}`;
    return this.http.get<string>(url);
  }
}
