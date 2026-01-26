export interface Dataset {
  id: number;
  name: string;
  size: number;
  dataProvider: string;
  provider: string;
  lastIndexTime: string;
}

export interface Run {
  id: number;
  creationTime: string;
  datasetId: number;
  batchId: number;
  reportId: number;
  score: number;
  url: string;
}

export interface ClioInfo {
  filterOps: { [key: string]: Array<string> };
  list: Array<Run>;
  listLength: number;
  listAverageScore: number;
  titleMarkup: Array<{ label: string; fn?: () => void }>;
}
