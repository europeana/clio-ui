import { Observable, of, throwError, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
  BreakdownRequest,
  BreakdownResults,
  DownloadRequest,
  Run,
  RunGroup
} from '../_models';

export class MockAPIService {
  errorMode = false;

  getError<T>(msg: string): Observable<T> {
    return timer(1).pipe(
      switchMap(() => {
        return throwError(new Error(msg));
      })
    );
  }

  groupRunsByDatasetId(_: Array<Run>): { [key: string]: RunGroup } {
    return {} as { [key: string]: RunGroup };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getDownload(_: BreakdownRequest): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getDownloadAll(_: DownloadRequest): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getDownloadDataset(_: DownloadRequest): void {}

  getFilteredRuns(_: BreakdownRequest): Observable<BreakdownResults> {
    if (this.errorMode) {
      return this.getError('mock getFilteredRuns throws error');
    }
    return of({
      filteringOptions: {},
      results: []
    } as BreakdownResults);
  }
}

export class MockAPIServiceErrors extends MockAPIService {
  errorMode = true;
}
