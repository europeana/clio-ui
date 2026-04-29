import { ClioCheck } from '../_models';

type TupleType = string | number | undefined;

export class ExportCSVService {
  headersCheck: Array<string> = [
    'id',
    'dataset-id',
    'dataset-name',
    'creation-time',
    'data-provider',
    'provider',
    'percent-in-operation'
  ];

  fieldNamesRun = [
    'id',
    'datasetId',
    'datasetName',
    'date',
    'dataProvider',
    'provider',
    'percentLinksInOperation'
  ];

  sanitiseVal(str: string): string {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }

  pushToTuple(arr: Array<TupleType>, val: TupleType): void {
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

  csvFromClioChecks(items: Array<ClioCheck>): string {
    const tuples: Array<Array<string | number | undefined>> = [];
    let tuple: Array<string | number | undefined> = [];

    items.forEach((item: ClioCheck) => {
      this.fieldNamesRun.forEach((fieldName: string) => {
        this.pushToTuple(tuple, item[fieldName as keyof ClioCheck]);
      });
      tuples.push(tuple);
      tuple = this.getTuple(0);
    });

    return this.joinCSV(this.headersCheck, tuples);
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
