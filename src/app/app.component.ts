import { Component, HostListener, inject, Signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

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
  private readonly route = inject(ActivatedRoute);
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
      return !exclusionMap[key] && new Set(runIdsForDatasetId).has(key);
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

  public paginationText: Signal<string> = toSignal(
    this.route.queryParams.pipe(
      map(params => {
        const offset = Number(params['offset'] ?? 0);
        const limit = Number(params['limit'] ?? 25);
        return `${offset} - ${offset + limit}`;
      })
    ),
    { initialValue: '0 - 25' }
  );

  canLoadPrevPage(): boolean {
    const offset = this.filters?.form?.value?.offset;
    return !!(offset && Number(offset) > 0);
  }

  loadPrevPage(): void {
    this.filters.dropPage();
  }

  loadNextPage(): void {
    this.filters.bumpPage();
  }
}
