import {
  BreakdownRequest,
  BreakdownResults,
  RequestFilter
} from '../../_models';
import { Dataset, Run } from '../../_models/new';

export const today = new Date().toISOString().split('T')[0];
export const yearZero = new Date(Date.parse('20 Nov 2008 12:00:00 GMT'));

interface DataProvider {
  id: number;
  name: string;
  providers: Array<number>;
}

interface Run_DATA extends Run {
  provider: string;
  dataProvider: string;
}

const providers: Array<string> = [
  'AthenaPlus',
  'Bulgariana',
  'CultureGrid',
  'Daguerreobase',
  'Europeana 280',
  'Foundation Virtual Library Miguel de Cervantes',
  'Galileo Museum'
];

const dataProviders: Array<DataProvider> = [
  {
    id: 0,
    name: '"Pilar Aróstegui" Municipal Archive',
    providers: [4]
  },
  {
    id: 1,
    name: 'State Archives Obwalden',
    providers: [2]
  },
  {
    id: 2,
    name: 'Virtual Library of Historical Press',
    providers: [2]
  },
  {
    id: 3,
    name: 'Luca Paul Communal Library in Domnesti',
    providers: [2]
  },
  {
    id: 4,
    name: 'Tbilisi History Museum, Georgia',
    providers: [2]
  },
  {
    id: 5,
    name: 'The Trustees of the Natural History Museum, London',
    providers: [3]
  },
  {
    id: 6,
    name: 'The Lowry',
    providers: [4]
  },
  {
    id: 7,
    name: 'Institute for Bulgarian Language of the Bulgarian Academy of Science',
    providers: [1, 3]
  },
  {
    id: 8,
    name: 'Institute of Balkan Studies with Center for Thracology',
    providers: [0, 1]
  },
  {
    id: 9,
    name: 'Virginia Academy of Science',
    providers: [1, 6]
  },
  {
    id: 10,
    name: 'Vienna Museum of Science and Technology',
    providers: [5, 6]
  },
  {
    id: 11,
    name: 'Institute of Ethnology, Czech Academy of Sciences',
    providers: [3, 5]
  },
  {
    id: 12,
    name: '"Alexandru Ioan Cuza" University',
    providers: [0, 5]
  }
];

export const dataSets: Array<Dataset> = new Array(25)
  .fill(null)
  .map((_: unknown, index: number) => {
    const dataProvider = dataProviders[index % dataProviders.length];
    const provider =
      providers[dataProvider.providers[index % dataProvider.providers.length]];

    return {
      id: index,
      datasetName: `my_dataset_${index}`,
      size: (index * 13) % 7,
      dataProvider: dataProvider.name,
      provider,
      lastIndexTime: ''
    };
  });

// Factory of all runs
const numRuns = 100;
const runs: Array<Run_DATA> = new Array(numRuns)
  .fill(null)
  .map((_: unknown, index: number) => {
    const runId = index;
    const dataset = dataSets[index % dataSets.length];
    const datasetId = dataset.id;
    const datasetName = dataset.datasetName;
    const dataProvider = dataset.dataProvider;
    const provider = dataset.provider;
    const url = `http://localhost:3000/report?id=${runId}`;
    const score = 100 - Math.floor((index * 17.6) % 100);
    const creationTime = new Date(today);

    creationTime.setDate(yearZero.getDate() - index);

    return {
      runId,
      creationTime: creationTime.toISOString(),
      datasetId,
      datasetName,
      url,
      dataProvider,
      provider,
      score
    };
  });

const allRunData: Array<Run_DATA> = runs;

// MOCK STATS SERVER...

function getDistinctValues(
  runs: Array<Run_DATA>,
  filterName: string,
  top?: number
): Array<string> {
  let res = Object.keys(
    runs.reduce((map: { [key: string]: boolean }, run: Run_DATA) => {
      const rVal = (run as unknown as { [key: string]: string })[filterName];
      map[rVal] = true;
      return map;
    }, {})
  );

  if (top) {
    res = res.slice(0, top);
  }
  return res;
}

export function dataServerRequest(
  breakdownRequest: BreakdownRequest
): BreakdownResults {
  const filterproof: Array<string> = [];
  const specifiedFilterNames = Object.keys(breakdownRequest.filters);
  const filteredReports = structuredClone(allRunData).filter(
    (run: Run_DATA) => {
      let res = true;

      specifiedFilterNames.forEach((fName: string) => {
        const filter = breakdownRequest.filters[fName] as RequestFilter;

        if (filter.values) {
          if (fName === 'dataset-id') {
            if (!filter.values.includes(`${run.datasetId}`)) {
              res = false;
            }
          } else if (fName === 'date-from') {
            const dateParam = Date.parse(filter.values[0]);
            const runDate = Date.parse(run['creationTime']);
            if (runDate < dateParam) {
              res = false;
            }
          } else if (fName === 'date-to') {
            const dateParam = Date.parse(filter.values[0]);
            const runDate = Date.parse(run['creationTime']);
            if (runDate > dateParam) {
              res = false;
            }
          } else if (
            !filter.values.includes(
              (run as unknown as { [key: string]: string })[fName]
            )
          ) {
            res = false;
          } else {
            filterproof.push(fName);
          }
        }
      });
      return res;
    }
  );

  const facetNames = ['dataProvider', 'provider'];

  const filterOptions = facetNames.reduce(
    (result: { [key: string]: Array<string> }, fName: string) => {
      const possibleValues = getDistinctValues(
        filterproof.includes(fName)
          ? structuredClone(allRunData)
          : filteredReports,
        fName
      );
      result[fName] = possibleValues;
      return result;
    },
    {}
  );

  return {
    filteringOptions: filterOptions,
    results: filteredReports
  };
}
