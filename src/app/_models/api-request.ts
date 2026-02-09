import { Run } from '../_models';

export interface BreakdownRequest {
  filters: {
    [details: string]: RequestFilter;
  };
}

export interface DownloadRequest extends BreakdownRequest {
  excluded_run_ids: Array<string>;
}

export interface RequestFilter {
  breakdown?: number;
  values?: Array<string>;
}

export interface BreakdownResults {
  filteringOptions: { [key: string]: Array<string> };
  results: Array<Run>;
}
