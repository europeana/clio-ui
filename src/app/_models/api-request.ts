import { ClioCheck } from '../_models';

export type FilterParameterName =
  | 'provider'
  | 'dataProvider'
  | 'datasetId'
  | 'datasetName'
  | 'dateFrom'
  | 'dateTo'
  | 'checkId'
  | 'score';

export interface CheckDataRequest {
  filters: {
    [details in FilterParameterName]: Array<string>;
  };
}

export interface DownloadRequest extends CheckDataRequest {
  excluded_check_ids?: Array<string>;
}

export interface CheckDataResults {
  filteringOptions: { [key: string]: Array<string> };
  results: Array<ClioCheck>;
}
