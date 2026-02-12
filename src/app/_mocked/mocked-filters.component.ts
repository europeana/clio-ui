import { Component, model, ModelSignal } from '@angular/core';
import { BreakdownRequest, ClioInfo } from '../_models';

@Component({
  selector: 'app-filters',
  template: ''
})
export class MockFiltersComponent {
  modelClioInfo: ModelSignal<ClioInfo> = model({
    datasetRuns: {},
    list: [],
    listLength: -1,
    listAverageScore: -1,
    filterOps: {},
    titleMarkup: []
  } as ClioInfo);

  getDataServerDataRequest(): BreakdownRequest {
    return {
      filters: {}
    } as unknown as BreakdownRequest;
  }
}
