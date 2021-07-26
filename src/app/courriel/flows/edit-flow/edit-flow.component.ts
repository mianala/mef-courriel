import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, map } from 'rxjs/operators';
import { AppFile } from 'src/app/classes/file';
import { Link } from 'src/app/classes/link';
import { Strings } from 'src/app/classes/strings';
import { FlowService } from '../flow.service';

@Component({
  selector: 'app-edit-flow',
  templateUrl: './edit-flow.component.html',
  styleUrls: ['./edit-flow.component.scss'],
})
export class EditFlowComponent implements OnInit {
  activeFile: AppFile | null = null;
  flow_id = 0;
  app_page = false;
  loading = true;
  Strings = Strings;
  Link = Link;

  flow$ = this.route.queryParams.pipe(
    switchMap((routeData: { flow_id: string }) => {
      const flow_id = parseInt(routeData.flow_id);
      return this.flowService
        .getFlow(flow_id)
        .pipe(map((flows: any[]) => flows[0]));
    })
  );
  constructor(
    private flowService: FlowService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {}
}
