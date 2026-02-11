export interface Dataset {
  id: number;
  datasetName: string;
  size: number;
  dataProvider: string;
  provider: string;
  lastIndexTime: string;
}

export interface Run {
  runId: number;
  creationTime: string;
  datasetId: string;
  datasetName: string;
  provider: string;
  dataProvider: string;
  percentInOperation: number;
  url: string;
}

export interface RunGroup {
  list: Array<Run>;
  opened: boolean;
  percentInOperation: number;
}

export interface ClioInfo {
  filterOps: { [key: string]: Array<string> };
  list: Array<Run>;
  groupedRuns: Array<RunGroup>;
  listLength: number;
  listAverageScore: number;
  titleMarkup: Array<{ label: string; fn?: () => void }>;
}
