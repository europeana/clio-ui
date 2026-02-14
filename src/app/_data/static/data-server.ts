import { BreakdownResults, CheckDataRequest } from '../../_models';
import { ClioCheck, Dataset } from '../../_models/new';

export const today = new Date().toISOString().split('T')[0];
export const yearZero = new Date(Date.parse('20 Nov 2008 12:00:00 GMT'));

interface DataProvider {
  id: number;
  name: string;
  providers: Array<number>;
}

const providers: Array<string> = [
  'AthenaPlus',
  'Bulgariana',
  'CultureGrid',
  'Daguerreobase',
  'Europeana 280',
  'Foundation Virtual Library Miguel de Cervantes',
  'Galileo Museum',
  'Digital Library of Latvia',
  'Philharmonie de Paris'
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
  },
  {
    id: 13,
    name: 'A. Ozoliņas privātkolekcija',
    providers: [7]
  },
  {
    id: 14,
    name: 'Artūrs Bebris',
    providers: [7]
  },
  {
    id: 15,
    name: 'Edgars Šķenderis',
    providers: [7]
  },
  {
    id: 16,
    name: 'Elmārs Priednieks',
    providers: [7]
  },
  {
    id: 17,
    name: 'Kursīši Library information centre',
    providers: [7]
  },
  {
    id: 18,
    name: 'Philharmonie de Paris',
    providers: [4, 8]
  },
  {
    id: 19,
    name: 'Balzac House',
    providers: [3]
  }
];

export const dataSets: Array<Dataset> = new Array(100)
  .fill(null)
  .map((_: unknown, index: number) => {
    const dataProvider = dataProviders[index % dataProviders.length];
    const provider =
      providers[
        dataProvider.providers[(index + 1) % dataProvider.providers.length]
      ];

    return {
      id: index,
      datasetName: `my_dataset_${index}`,
      dataProvider: dataProvider.name,
      provider
    };
  });

// Factory of all checks
const numChecks = 1000;
const checks: Array<ClioCheck> = new Array(numChecks)
  .fill(null)
  .map((_: unknown, index: number) => {
    const checkId = index;
    const dataset = dataSets[index % dataSets.length];
    const datasetId = `${dataset.id}`;
    const datasetName = dataset.datasetName;
    const dataProvider = dataset.dataProvider;
    const provider = dataset.provider;
    const percentInOperation = 100 - Math.floor((index * 17.6) % 100);
    const createdDate = new Date(today);

    createdDate.setDate(yearZero.getDate() - index);

    return {
      checkId,
      createdDate: createdDate.toISOString(),
      datasetId,
      datasetName,
      dataProvider,
      provider,
      percentInOperation
    };
  });

const allChecks: Array<ClioCheck> = checks;

// MOCK STATS SERVER...

function getDistinctValues(
  checks: Array<ClioCheck>,
  filterName: string,
  top?: number
): Array<string> {
  let res = Object.keys(
    checks.reduce((map: { [key: string]: boolean }, check: ClioCheck) => {
      const rVal = (check as unknown as { [key: string]: string })[filterName];
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
  dataRequest: CheckDataRequest
): BreakdownResults {
  const filterproof: Array<string> = [];
  const specifiedFilterNames = Object.keys(dataRequest.filters);
  const filteredRuns = structuredClone(allChecks).filter((check: ClioCheck) => {
    let res = true;

    specifiedFilterNames.forEach((fName: string) => {
      const filter = dataRequest.filters[fName];

      if (filter.values) {
        if (fName === 'dataset-id') {
          if (!filter.values.includes(check.datasetId)) {
            res = false;
          }
        } else if (fName === 'dataset-name') {
          res = false;
          filter.values.forEach((val: string) => {
            if (check.datasetName.indexOf(val) > -1) {
              res = true;
            }
          });
        } else if (fName === 'date-from') {
          const dateParam = Date.parse(filter.values[0]);
          const checkDate = Date.parse(check['createdDate']);
          if (checkDate < dateParam) {
            res = false;
          }
        } else if (fName === 'date-to') {
          const dateParam = Date.parse(filter.values[0]);
          const checkDate = Date.parse(check['createdDate']);
          if (checkDate > dateParam) {
            res = false;
          }
        } else if (fName === 'score') {
          const scoreParam = parseInt(filter.values[0]);
          const checkScore = check.percentInOperation;
          if (checkScore < scoreParam || checkScore > scoreParam + 20) {
            res = false;
          }
        } else if (fName === 'check-id') {
          if (!filter.values.includes(`${check.checkId}`)) {
            res = false;
          }
        } else if (
          !filter.values.includes(
            (check as unknown as { [key: string]: string })[fName]
          )
        ) {
          res = false;
        } else {
          filterproof.push(fName);
        }
      }
    });
    return res;
  });

  const facetNames = ['dataProvider', 'provider'];

  const filterOptions = facetNames.reduce(
    (result: { [key: string]: Array<string> }, fName: string) => {
      const possibleValues = getDistinctValues(
        filterproof.includes(fName) ? structuredClone(allChecks) : filteredRuns,
        fName
      );
      result[fName] = possibleValues;
      return result;
    },
    {}
  );

  return {
    filteringOptions: filterOptions,
    results: filteredRuns
  };
}
