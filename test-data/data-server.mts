import {
  CheckDataRequest,
  CheckDataResults,
  ClioCheck, Dataset,
  FilterParameterName
} from './src-copy/api-request.mjs';

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
    const id = index;
    const dataset = dataSets[index % dataSets.length];
    const datasetId = `${dataset.id}`;
    const datasetName = dataset.datasetName;
    const dataProvider = dataset.dataProvider;
    const provider = dataset.provider;
    const percentLinksInOperation = 100 - Math.floor((index * 17.6) % 100);
    const date = new Date(today);

    date.setDate(yearZero.getDate() - index);

    return {
      id,
      date: date.toISOString(),
      datasetId,
      datasetName,
      dataProvider,
      provider,
      percentLinksInOperation
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
): CheckDataResults {
  const filterproof: Array<string> = [];

  // Extract all the filter names the client has provided
  const specifiedFilterNames = Object.keys(
    dataRequest.filters || {}
  ) as Array<FilterParameterName>;

  let filteredRuns = structuredClone(allChecks).filter((check: ClioCheck) => {
    let res = true;

    specifiedFilterNames.forEach((fName: FilterParameterName) => {
      let filter = dataRequest.filters[fName];

      if (['offset', 'limit'].includes(fName)) {
        return;
      }

      const firstVal = Array.isArray(filter) ? filter[0] : filter;

      if (fName === 'datasetId') {
        const allowedIds = Array.isArray(filter) ? filter : [String(filter)];
        if (allowedIds.length > 0 && !allowedIds.includes(String(check.datasetId))) {
          res = false;
        }
      } else if (fName === 'datasetName') {
        if (firstVal) {
          if (!check.datasetName.includes(String(firstVal))) {
            res = false;
          }
        }
      } else if (fName === 'dateFrom') {
        if (firstVal && String(firstVal).trim() !== '') {
          const dateParam = Date.parse(String(firstVal));
          const checkDate = Date.parse(check['date']);
          if (!isNaN(dateParam) && checkDate < dateParam) {
            res = false;
          }
        }
      } else if (fName === 'dateTo') {
        if (firstVal && String(firstVal).trim() !== '') {
          const dateParam = Date.parse(String(firstVal));
          const checkDate = Date.parse(check['date']);
          if (!isNaN(dateParam) && checkDate > dateParam) {
            res = false;
          }
        }
      } else if (fName === 'percentLinksInOperationFrom') {
        const scoreParam = Number.parseInt(String(firstVal || 0), 10);
        if (check.percentLinksInOperation < scoreParam) {
          res = false;
        }
      } else if (fName === 'id') {
        const allowedIds = Array.isArray(filter) ? filter : [String(filter)];
        if (!allowedIds.includes(`${check.id}`)) {
          res = false;
        }
      } else if (['dataProvider', 'provider'].includes(fName)) {
        // Map dynamic custom checkboxes safely
        const checkValue = (check as unknown as { [key: string]: string })[fName];
        const targetFilters = Array.isArray(filter) ? filter : [filter];

        if (targetFilters.length > 0 && targetFilters[0] !== undefined) {
          if (targetFilters.includes(checkValue)) {
            if (!filterproof.includes(fName)) {
              filterproof.push(fName);
            }
          } else {
            res = false;
          }
        }
      } else {
        console.log('unknown filter option dropped: ' + fName);
      }
    });
    return res;
  });

  const facetNames = ['dataProvider', 'provider'];
  const filterOptions = facetNames.reduce(
    (result: { [key: string]: Array<string> }, fName: string) => {
      const targetSource = filterproof.includes(fName) ? allChecks : filteredRuns;
      result[fName] = getDistinctValues(structuredClone(targetSource), fName);
      return result;
    },
    {}
  );

  const rawOffset = dataRequest.filters['offset'];
  const rawLimit = dataRequest.filters['limit'];
  const offset = Number(Array.isArray(rawOffset) ? rawOffset[0] : (rawOffset ?? 0));
  const limit = Number(Array.isArray(rawLimit) ? rawLimit[0] : (rawLimit ?? 25));

  const totalCountBeforeSlice = filteredRuns.length;
  (filterOptions as any)['hasMoreAvailable'] = (offset + limit) < totalCountBeforeSlice;

  filteredRuns = filteredRuns.slice(offset, offset + limit);

  return {
    filterOptions,
    results: filteredRuns
  };
}
