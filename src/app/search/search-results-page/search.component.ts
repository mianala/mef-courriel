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
import { EntityService } from 'src/app/services/entity.service';

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchResultComponent implements OnInit {
  entity: Entity = new Entity();
  allEntities: Entity[] = [];
  @Input() query: string = '';

  activeEntityFilter$ = this.searchService.activeEntityFilter$;
  activeLabelFilter$ = this.searchService.activeLabelFilter$;

  results$ = this.flowService.searchAppResult$;
  params$ = this.route.queryParams;

  filteredResult$ = combineLatest([
    this.params$,
    this.entityService.allEntities$,
  ]).pipe(
    switchMap(([params, allEntities]) => {
      let searchFilters: any = { _and: [] };

      const entityIdFilter = parseInt(params.e) ? parseInt(params.e) : 0;
      const labelFilter = params.l ? params.l : '';
      const query = params.q ? params.q : '';

      const entity = allEntities.find((entity) => {
        return entity.id == entityIdFilter;
      });

      if (query) {
        searchFilters._and = [
          {
            _or: [
              { title: { _ilike: `%${query}%` } },
              { content: { _ilike: `%${query}%` } },
              { labels: { _ilike: `%${query}%` } },
              { initiator_text: { _ilike: `%${query}%` } },
              { reference: { _ilike: `%${query}%` } },
            ],
          },
        ];
      }

      entityIdFilter &&
        (searchFilters._and = [
          ...searchFilters._and,
          ...[
            {
              _or: [
                { initiator_id: { _eq: entityIdFilter } },
                {
                  initiator_text: {
                    _ilike: `%${entity?.short}%`,
                  },
                },
              ],
            },
          ],
        ]);

      labelFilter &&
        (searchFilters._and = [
          ...searchFilters._and,
          ...[{ labels: { _ilike: `%${labelFilter}%` } }],
        ]);

      return this.flowService.searchQuery(searchFilters);
    })
  );

  constructor(
    public flowService: FlowService,
    private searchService: SearchService,
    public userService: UserService,
    private entityService: EntityService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {}

  filterEntity() {}
}
