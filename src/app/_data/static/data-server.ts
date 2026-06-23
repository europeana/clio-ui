import { Dataset } from '../../_models';

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
