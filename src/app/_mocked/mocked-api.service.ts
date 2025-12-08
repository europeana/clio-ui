import { Observable, of } from 'rxjs';

export class MockAPIService {
  availableReports(): Observable<string> {
    return of('{ data: []}');
  }

  batches(): Observable<string> {
    return of('{ data: []}');
  }

  latestReport(): Observable<string> {
    return of('{ data: []}');
  }

  reportByBatchId(id: string): Observable<string> {
    return of('{ data: []}');
  }
}
