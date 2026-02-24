import { ClioCheck } from '../_models';

interface RequestFilter {
  values?: Array<string>;
}

export type FilterParameterName =
  | 'provider'
  | 'data-provider'
  | 'dataset-id'
  | 'dataset-name'
  | 'date-from'
  | 'date-to'
  | 'check-id'
  | 'score';

export interface CheckDataRequest {
  filters: {
    [details in FilterParameterName]: RequestFilter;
  };
}

export interface DownloadRequest extends CheckDataRequest {
  excluded_check_ids?: Array<string>;
}

export interface CheckDataResults {
  filteringOptions: { [key: string]: Array<string> };
  results: Array<ClioCheck>;
}
