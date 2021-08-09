import { FlatTreeControl, NestedTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { FlowService } from 'src/app/courriel/flows/flow.service';
import { UserService } from 'src/app/services/user.service';
import { Entity } from 'src/app/classes/entity';
import { SearchService } from '../search.service';

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchResultComponent implements OnInit {
  entity: Entity = new Entity();
  @Input() query: string = '';

  activeEntityFilter$ = this.searchService.activeEntityFilter$;
  activeLabelFilter$ = this.searchService.activeLabelFilter$;

  results$ = this.flowService.searchAppResult$;
  params$ = this.route.queryParams;

  filteredResult$ = this.params$.pipe(
    switchMap((params) => {
      let searchFilters: any = { _and: {} };

      const entityFilter = parseInt(params.e) ? parseInt(params.e) : 0;
      const labelFilter = params.l ? params.l : '';
      const query = params.q ? params.q : '';

      query &&
        (searchFilters._and._or = [
          { title: { _ilike: `%${query}%` } },
          { content: { _ilike: `%${query}%` } },
          { labels: { _ilike: `%${query}%` } },
          { initiator_text: { _ilike: `%${query}%` } },
          { reference: { _ilike: `%${query}%` } },
        ]);

      entityFilter && (searchFilters._and.initiator_id = { _eq: entityFilter });
      labelFilter && (searchFilters._and.labels = { _eq: labelFilter });

      return this.flowService.searchQuery(searchFilters);

      // return results.filter((flow: any) => {
      //   return entityFilter
      //     ? labelFilter
      //       ? flow.labels.includes(labelFilter) &&
      //         flow.initiator_id == entityFilter
      //       : flow.initiator_id == entityFilter
      //     : labelFilter
      //     ? flow.labels.includes(labelFilter)
      //     : true;
      // });
    })
  );

  constructor(
    public flowService: FlowService,
    private searchService: SearchService,
    public userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {}

  filterEntity() {}
}
