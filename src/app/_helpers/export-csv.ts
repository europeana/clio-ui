import { Run } from '../_models';

export class ExportCSVService {
  headersRun: Array<string> = [
    'id',
    'dataset-id',
    'dataset-name',
    'creation-time',
    'data-provider',
    'provider',
    'score',
    'url'
  ];

  fieldNamesRun = [
    'runId',
    'datasetId',
    'datasetName',
    'creationTime',
    'dataProvider',
    'provider',
    'score',
    'url'
  ];

  sanitiseVal(str: string): string {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }

  pushToTuple(
    arr: Array<string | number | undefined>,
    val: string | number | undefined
  ): void {
    val = val && typeof val === 'string' ? this.sanitiseVal(val) : val;
    arr.push(val);
  }

  getTuple(padding: number): Array<string | number | undefined> {
    const res: Array<string | number | undefined> = [];
    new Array(padding).fill(null).forEach(() => {
      res.push(undefined);
    });
    return res;
  }

  csvFromRuns(items: Array<Run>): string {
    const tuples: Array<Array<string | number | undefined>> = [];
    let tuple: Array<string | number | undefined> = [];

    items.forEach((item: Run) => {
      this.fieldNamesRun.forEach((fieldName: string) => {
        this.pushToTuple(tuple, item[fieldName as keyof Run]);
      });
      tuples.push(tuple);
      tuple = this.getTuple(0);
    });

    return this.joinCSV(this.headersRun, tuples);
  }

  joinCSV(
    headers: Array<string>,
    tuples: Array<Array<string | number | undefined>>
  ): string {
    return (
      headers.join(',') +
      '\n\r' +
      tuples
        .map((tuple: Array<string | number | undefined>) => {
          return tuple.join(',');
        })
        .join('\n')
    );
  }
}
