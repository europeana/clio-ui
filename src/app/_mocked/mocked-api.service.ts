import { Observable, of, throwError, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { BreakdownRequest, BreakdownResults, Run, RunGroup } from '../_models';

export class MockAPIService {
  errorMode = false;

  getError<T>(msg: string): Observable<T> {
    return timer(1).pipe(
      switchMap(() => {
        return throwError(new Error(msg));
      })
    );
  }

  groupRuns(_: Array<Run>): Array<RunGroup> {
    return [] as Array<RunGroup>;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getDownload(_: BreakdownRequest): void {}

  getFilteredReports(_: BreakdownRequest): Observable<BreakdownResults> {
    if (this.errorMode) {
      return this.getError('mock getFilteredReports throws error');
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
