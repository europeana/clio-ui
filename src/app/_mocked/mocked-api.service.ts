import { Observable, of } from 'rxjs';
import { AvailableReport, BatchItem } from '../_models';

export class MockAPIService {
  reportByBatchId(id: string): Observable<string> {
    return of('');
  }
  latestReport(): Observable<string> {
    return of('');
  }
  batches(): Observable<Array<BatchItem>> {
    return of([{} as unknown as BatchItem]);
  }
  availableReports(): Observable<Array<AvailableReport>> {
    return of([{} as unknown as AvailableReport]);
  }
}
