import { Component, HostListener, inject, ViewChild } from '@angular/core';

import { Run } from './_models';
import { APIService, ClickService } from './_services';
import { HeaderComponent } from './header';
import { FiltersComponent } from './filters';
import { ListingComponent } from './listing';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [FiltersComponent, HeaderComponent, ListingComponent]
})
export class AppComponent {
  title = 'Clio UI';
  private readonly api = inject(APIService);
  private readonly clickService = inject(ClickService);

  @ViewChild('listing', { static: false }) listing: ListingComponent;
  @ViewChild('filters', { static: false }) filters: FiltersComponent;

  /**
   * documentClick
   * - global document click handler
   * - push the clicked element to the clickService
   * - (picked up by the click-aware directive)
   **/
  @HostListener('document:click', ['$event'])
  documentClick(event: { target: HTMLElement }): boolean | void {
    this.clickService.documentClickedTarget.next(event.target);
  }

  downloadCheck(id: number): void {
    this.api.getDownload({
      filters: {
        'run-id': {
          values: [`${id}`]
        }
      }
    });
  }

  downloadDataset(id: string): void {
    const runIdsForDatasetId = this.listing
      .clioInfo()
      .datasetRuns[id].list.map((run: Run) => {
        return `${run.runId}`;
      });

    const exclusionMap = this.listing.form.value['run_ids'];
    const exclusionList = Object.keys(exclusionMap).filter((key: string) => {
      return !exclusionMap[key] && runIdsForDatasetId.includes(key);
    });
    const downloadRequest = this.filters.getDataServerDataRequest();

    downloadRequest.filters['dataset-id'] = {
      values: [id]
    };

    this.api.getDownload({
      ...downloadRequest,
      excluded_run_ids: exclusionList
    });
  }

  downloadAll(): void {
    const exclusionMap = this.listing.form.value['run_ids'];
    const exclusionList = Object.keys(exclusionMap).filter((key: string) => {
      return !exclusionMap[key];
    });
    this.api.getDownload({
      ...this.filters.getDataServerDataRequest(),
      excluded_run_ids: exclusionList
    });
  }
}
