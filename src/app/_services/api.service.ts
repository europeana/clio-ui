import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiSettings } from '../../environments/apisettings';

@Injectable({ providedIn: 'root' })
export class APIService {
  constructor(private readonly http: HttpClient) {}

  availableReports(): Observable<string> {
    const url = `${apiSettings.serverAPI}/available-reports`;
    return this.http.get<string>(url);
  }

  batches(): Observable<string> {
    const url = `${apiSettings.serverAPI}/batches?maxResults=1`;
    return this.http.get<string>(url);
  }

  latestReport(): Observable<string> {
    const url = `${apiSettings.serverAPI}/latest-report`;
    return this.http.get<string>(url);
  }

  reportByBatchId(id: string): Observable<string> {
    const url = `${apiSettings.serverAPI}/report-by-batch-id?batchId=${id}`;
    return this.http.get<string>(url);
  }
}
