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
  public documentClick(event: { target: HTMLElement }): boolean | void {
    this.clickService.documentClickedTarget.next(event.target);
  }

  public downloadCheck(id: number): void {
    this.api.getDownload({
      filters: { id: [`${id}`] }
    } as DownloadRequest);
  }

  public downloadDataset(id: string): void {
    const datasetRuns = this.listing().clioInfo().datasetChecks[id]?.list || [];
    const activeChecks = this.listing().selectedCheckIds();

    const exclusionList: string[] = [];
    datasetRuns.forEach((run: ClioCheck) => {
      if (!activeChecks.has(run.id!)) {
        exclusionList.push(`${run.id}`);
      }
    });

    const downloadRequest = this.filters().getDataServerDataRequest();
    downloadRequest.filters['datasetId'] = [id];

    const payload = {
      ...downloadRequest,
      excluded_check_ids: exclusionList,
      pagination: { offset: 0, limit: 100000 }
    };

    this.api.getDownload(payload as unknown as DownloadRequest);
  }

  public downloadAll(): void {
    const allVisibleRuns = this.listing().clioInfo()?.list || [];
    const activeChecks = this.listing().selectedCheckIds();

    const exclusionList: string[] = [];
    allVisibleRuns.forEach((run: ClioCheck) => {
      if (!activeChecks.has(run.id!)) {
        exclusionList.push(`${run.id}`);
      }
    });

    const downloadRequest = this.filters().getDataServerDataRequest();

    const payload = {
      ...downloadRequest,
      excluded_check_ids: exclusionList,
      pagination: { offset: 0, limit: 100000 }
    };

    this.api.getDownload(payload as unknown as DownloadRequest);
  }

  private readonly queryParamsSignal = toSignal<Params, Params>(
    this.route.queryParams,
    { initialValue: {} as Params }
  );

  public readonly canLoadPrevPageSignal: Signal<boolean> = computed(() => {
    const params = this.queryParamsSignal();
    const offset = Number(params['offset'] ?? 0);
    return offset > 0;
  });

  public readonly paginationText: Signal<string> = computed(() => {
    const params = this.queryParamsSignal();
    const offset = Number(params['offset'] ?? 0);
    const limit = Number(params['limit'] ?? 25);
    const maxBound = offset + limit;
    return `${offset} - ${maxBound}`;
  });

  public readonly canLoadNextPageSignal = computed(() => {
    return !!this.filters().hasMoreAvailable();
  });

  public loadPrevPage(): void {
    this.filters().dropPage();
  }

  public loadNextPage(): void {
    this.filters().bumpPage();
  }
}
