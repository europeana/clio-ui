import { Run } from '../_models';

export interface BreakdownRequest {
  filters: {
    [details: string]: RequestFilter | RequestFilterRange;
  };
}

export interface RequestFilterRange {
  from: string;
  to: string;
}

export interface RequestFilter {
  breakdown?: number;
  values?: Array<string>;
}

export interface BreakdownResults {
  filteringOptions: { [key: string]: Array<string> };
  results: Array<Run>;
}
