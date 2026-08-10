import {
  Component,
  computed,
  HostListener,
  inject,
  Signal,
  viewChild
} from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params } from '@angular/router';

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

  readonly listing = viewChild.required<ListingComponent>('listing');
  readonly filters = viewChild.required<FiltersComponent>('filters');

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
    const runIdsForDatasetId = this.listing()
      .clioInfo()
      .datasetChecks[id].list.map((run: ClioCheck) => {
        return `${run.id}`;
      });

    const exclusionMap = this.listing().form.value['check_ids'];
    const exclusionList = Object.keys(exclusionMap).filter((key: string) => {
      return !exclusionMap[key] && new Set(runIdsForDatasetId).has(key);
    });

    const downloadRequest = this.filters().getDataServerDataRequest();
    downloadRequest.filters['datasetId'] = [id];

    this.api.getDownload({
      ...downloadRequest,
      excluded_check_ids: exclusionList
    });
  }

  downloadAll(): void {
    const exclusionMap = this.listing().form.value['check_ids'];
    const exclusionList = Object.keys(exclusionMap).filter((key: string) => {
      return !exclusionMap[key];
    });

    this.api.getDownload({
      ...this.filters().getDataServerDataRequest(),
      excluded_check_ids: exclusionList
    });
  }

  // Reactive URL routing query stream wrapper matching core contract types
  private readonly queryParamsSignal = toSignal<Params, Params>(
    this.route.queryParams,
    {
      initialValue: {} as Params
    }
  );

  // Computes previous page navigation visibility state directly off the active URL parameter stream
  public readonly canLoadPrevPageSignal: Signal<boolean> = computed(() => {
    const params = this.queryParamsSignal();
    const offset = Number(params['offset'] ?? 0);
    return offset > 0;
  });

  // Calculates structural range text limits dynamically using real visible item counts
  public readonly paginationText: Signal<string> = computed(() => {
    const params = this.queryParamsSignal();
    const offset = Number(params['offset'] ?? 0);
    const limit = Number(params['limit'] ?? 25);

    const datasetChecksMap = this.listing().clioInfo()?.datasetChecks;
    const visibleDatasetCount = datasetChecksMap
      ? Object.keys(datasetChecksMap).length
      : 0;

    const maxBound =
      visibleDatasetCount < limit
        ? offset + visibleDatasetCount
        : offset + limit;

    return `${offset} - ${maxBound}`;
  });

  // Computes next page validation parameters smoothly off the required child filter signals
  readonly canLoadNextPageSignal = computed(() => {
    return !!this.filters().hasMoreAvailable();
  });

  loadPrevPage(): void {
    this.filters().dropPage();
  }

  loadNextPage(): void {
    this.filters().bumpPage();
  }
}
