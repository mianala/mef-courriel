import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from '@apollo/client/utilities';
import { combineLatest, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  share,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { Flow } from 'src/app/classes/flow';
import { Link } from 'src/app/classes/link';
import { Strings } from 'src/app/classes/strings';
import { EntityService } from 'src/app/services/entity.service';
import { UserService } from 'src/app/services/user.service';
import { FlowService } from './flow.service';
@Component({
  selector: 'inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss'],
})
export class FlowsComponent implements OnInit {
  searching = false;
  today = new Date();
  searchCtrl: FormControl = new FormControl('');

  // TODO: change later when most users won't have access to inbox
  activeTab = 'MAIN';
  Link = Link;

  // inboxFlows$ = this.flowService.inboxFlows$;

  // unreadInboxFlows$ = this.inboxFlows$?.pipe(
  //   map((flows: Flow[]) => {
  //     // null hides the badge
  //     return flows.filter((flow) => !flow.read).length || null;
  //   })
  // );

  // FIXME:
  pageLength = 1000;
  pageSize = 20;

  assignedFlows$ = this.flowService.assignedFlows$;
  unreadAssignedxFlows$ = this.assignedFlows$?.pipe(
    map((flows: Flow[]) => {
      // null hides the badge
      return flows.filter((flow) => !flow.read).length || null;
    })
  );

  queryParams$ = this.route.queryParams;

  flows$ = this.queryParams$.pipe(
    switchMap((params: any) => {
      this.activeTab = params.tab;
      let flow = this.inboxFlowsWithPagination$;
      switch (this.activeTab) {
        case Strings.inboxTypes.main.tabLabel:
          flow = this.inboxFlowsWithPagination$;
          break;
        case Strings.inboxTypes.assigned.tabLabel:
          flow = this.assignedFlows$;
          break;
        case Strings.inboxTypes.sign.tabLabel:
          flow = this.signatureFlowsWithPagination$;
          break;
        case Strings.inboxTypes.lecture.tabLabel:
          flow = this.lectureFlowsWithPagination$;
          break;
        case 'SEARCH':
          flow = this.searchFlows$;
          break;
      }

      return flow;
    })
  );

  inboxFlowsWithPagination$ = combineLatest([
    this.queryParams$,
    this.userService.activeUserEntityId$,
  ]).pipe(
    switchMap(([params, entity_id]) => {
      const page = parseInt(params.page) || 0;
      const items = parseInt(params.items) || this.pageSize;
      const offset = page * items;

      return this.flowService.inboxFlowsWithPagination(
        entity_id,
        offset,
        items
      );
    })
  );

  searchFlows$ = this.searchCtrl.valueChanges.pipe(
    tap((query) => {
      this.searching = true;

      this.router.navigate([Link.FLOWS_INBOX], {
        queryParams: { q: query },
        queryParamsHandling: 'merge',
      });
    }),
    debounceTime(300),
    switchMap((query: string) => {
      const where = { _and: {} };
      where._and = {
        _or: [
          { title: { _ilike: `%${query}%` } },
          { content: { _ilike: `%${query}%` } },
          { labels: { _ilike: `%${query}%` } },
          { initiator_text: { _ilike: `%${query}%` } },
          { reference: { _ilike: `%${query}%` } },
        ],
      };
      return this.flowService.filterQuery(where);
    }),
    tap(() => {
      this.searching = false;
    })
  );

  signatureFlowsWithPagination$ = combineLatest([
    this.queryParams$,
    this.userService.activeUserEntityId$,
  ]).pipe(
    switchMap(([params, entity_id]) => {
      console.log(params, entity_id);

      const page = parseInt(params.page) || 0;
      const items = parseInt(params.items) || this.pageSize;
      const offset = page * items;

      return this.flowService.signatureFlowsWithPagination(
        entity_id,
        offset,
        items
      );
    })
  );

  lectureFlowsWithPagination$ = combineLatest([
    this.queryParams$,
    this.userService.activeUserEntityId$,
  ]).pipe(
    switchMap(([params, entity_id]) => {
      console.log(params, entity_id);

      const page = parseInt(params.page) || 0;
      const items = parseInt(params.items) || this.pageSize;
      const offset = page * items;

      return this.flowService.lectureFlowsWithPagination(
        entity_id,
        offset,
        items
      );
    })
  );

  tabs = [
    {
      tab: Strings.inboxTypes.main.tabLabel,
      title: Strings.inboxTypes.main.title,
      icon: 'inbox',
      id: 0,
      order: 0,
      // unread: this.unreadInboxFlows$,
    },
    {
      tab: Strings.inboxTypes.lecture.tabLabel,
      title: Strings.inboxTypes.lecture.title,
      icon: 'import_contacts',
      id: 0,
      order: 0,
    },
    {
      tab: Strings.inboxTypes.sign.tabLabel,
      title: Strings.inboxTypes.sign.title,
      icon: 'draw',
      id: 0,
      order: 0,
    },
    {
      tab: Strings.inboxTypes.assigned.tabLabel,
      title: Strings.inboxTypes.assigned.title,
      icon: 'work_outline',
      id: 0,
      order: 0,
      unread: this.unreadAssignedxFlows$,
    },
    {
      tab: 'SEARCH',
      title: 'Rechercher',
      icon: 'search',
      id: 0,
      order: 0,
    },
  ];

  constructor(
    public flowService: FlowService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  pageEvent(e: PageEvent) {
    console.log(e);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: e.pageIndex },
      queryParamsHandling: 'merge',
    });
  }

  ngOnInit(): void {}
}
