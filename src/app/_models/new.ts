export interface InputDescription {
  controlName: string;
  group: string;
}

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

export interface Link {
  id: string;
  runId: number;
  recordId: string;
  recordEdmType: string;
  recordContentTier: string;
  recordMetadataTier: string;
  linkType: string;
  linkServer: string;
  linkUrl: string;
  error?: string;
  checkTime: string;
}

export interface ClioInfo {
  title: string;
  filterOps: { [key: string]: Array<string> };
  list: Array<Run>;
  listLength: number;
  listAverageScore: number;
}
