import { ClioCheck } from '../_models';

interface RequestFilter {
  values?: Array<string>;
}

export interface CheckDataRequest {
  filters: {
    [details: string]: RequestFilter;
  };
}

export interface DownloadRequest extends CheckDataRequest {
  excluded_check_ids?: Array<string>;
}

export interface BreakdownResults {
  filteringOptions: { [key: string]: Array<string> };
  results: Array<ClioCheck>;
}
