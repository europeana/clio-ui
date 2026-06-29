import { RenameFilterPipe } from '.';

describe('RenameFilterPipe', () => {
  it('should translate the filter names', () => {
    const pipe = new RenameFilterPipe();
    expect(pipe.transform('DataProvider')).toEqual('DataProvider');
    expect(pipe.transform('dataProvider')).toEqual('data provider');
    expect(pipe.transform('provider')).toEqual('provider');
  });
});
