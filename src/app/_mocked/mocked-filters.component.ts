import { Component, model, ModelSignal } from '@angular/core';
import { CheckDataRequest, ClioInfo } from '../_models';

@Component({
  selector: 'app-filters',
  template: ''
})
export class MockFiltersComponent {
  modelClioInfo: ModelSignal<ClioInfo> = model({
    datasetChecks: {},
    list: [],
    listLength: -1,
    listAverageScore: -1,
    filterOps: {},
    titleMarkup: []
  } as ClioInfo);

  getDataServerDataRequest(): CheckDataRequest {
    return {
      filters: {}
    } as unknown as CheckDataRequest;
  }
}
