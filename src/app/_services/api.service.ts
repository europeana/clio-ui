import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  BreakdownRequest,
  BreakdownResults,
  DownloadRequest,
  Run,
  RunGroup
} from '../_models';
import { dataServerRequest } from '../_data/static/data-server';
import { apiSettings } from '../../environments/apisettings';

@Injectable({ providedIn: 'root' })
export class APIService {
  constructor(private readonly http: HttpClient) {}

  /** getRunAverage
   *  calculates average percentInOperation
   **/

  // TODO

  /** groupRuns
   *  groups array entries by dataset id,
   *  initialising the opened and percentInOperation fields
   **/
  groupRuns(results: Array<Run>): Array<RunGroup> {
    const mapped = results.reduce(
      (map: { [key: string]: Array<Run> }, run: Run) => {
        const id = run.datasetId;
        map[id] = map[id] ?? [];
        map[id].push(run);
        return map;
      },
      {}
    );

    return Object.keys(mapped).map((id: string) => {
      const list = mapped[id];
      const percentInOperation = Math.floor(
        list.reduce((sum, obj) => sum + obj.percentInOperation, 0) / list.length
      );
      return {
        list,
        opened: false,
        percentInOperation
      };
    });
  }

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
    const headers = new HttpHeaders().set(
      'Content-Type',
      'text/plain; charset=utf-8'
    );
    this.http
      .post(`${apiSettings.serverAPI}/download`, request, {
        headers: headers,
        responseType: 'text'
      })
      .pipe(
        catchError(() => {
          console.log('download request:' + JSON.stringify(request, null, 4));
          return of('CSV_DOWNLOAD');
        })
      )
      .subscribe((data: unknown) => {
        this.download(data as string, 'clio_report');
      });
  }
}
