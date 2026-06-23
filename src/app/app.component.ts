import { Component, HostListener, inject, ViewChild } from '@angular/core';

import { apiSettings } from '../environments/apisettings';
import { ClioCheck, DownloadRequest } from './_models';
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
  public apiSettings = apiSettings;

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
        id: [`${id}`]
      }
    } as DownloadRequest);
  }

  downloadDataset(id: string): void {
    const runIdsForDatasetId = this.listing
      .clioInfo()
      .datasetChecks[id].list.map((run: ClioCheck) => {
        return `${run.id}`;
      });

    const exclusionMap = this.listing.form.value['check_ids'];
    const exclusionList = Object.keys(exclusionMap).filter((key: string) => {
      return !exclusionMap[key] && runIdsForDatasetId.includes(key);
    });
    const downloadRequest = this.filters.getDataServerDataRequest();

    downloadRequest.filters['datasetId'] = [id];

    this.api.getDownload({
      ...downloadRequest,
      excluded_check_ids: exclusionList
    });
  }

  downloadAll(): void {
    const exclusionMap = this.listing.form.value['check_ids'];
    const exclusionList = Object.keys(exclusionMap).filter((key: string) => {
      return !exclusionMap[key];
    });
    this.api.getDownload({
      ...this.filters.getDataServerDataRequest(),
      excluded_check_ids: exclusionList
    });
  }

  pageString(): string {
    if (!this.filters?.form) {
      return '0 - 0';
    }
    const offset = Number.parseInt(this.filters.form.value.offset ?? 0);
    const limit = Number.parseInt(this.filters.form.value.limit ?? 0);

    return offset + ' - ' + (offset + limit);
  }

  canLoadPrevPage(): boolean {
    return !!Number.parseInt(this.filters?.form?.value?.offset ?? '');
  }

  loadPrevPage(): void {
    this.filters.dropPage();
    this.filters.loadData();
  }

  loadNextPage(): void {
    this.filters.bumpPage();
    this.filters.loadData();
  }
}
