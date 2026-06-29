/** RenameFilterPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for filters
*/
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'renameFilter',
  standalone: true
})
export class RenameFilterPipe implements PipeTransform {
  names: { [key: string]: string } = {
    dataProvider: 'data provider',
    provider: 'provider'
  };

  transform(value: string): string {
    return this.names[value] || value;
  }
}
