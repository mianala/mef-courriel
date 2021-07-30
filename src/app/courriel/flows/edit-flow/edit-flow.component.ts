import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, map } from 'rxjs/operators';
import { Entity } from 'src/app/classes/entity';
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
  flow_id = 0;
  loading = true;
  Strings = Strings;
  Link = Link;
  editFlowForm = new FormGroup({});

  flow$ = this.route.queryParams.pipe(
    switchMap((routeData) => {
      const flow_id = parseInt(routeData.flow_id);
      return this.flowService.getFlow(flow_id).pipe(map((flows) => flows[0]));
    })
  );

  constructor(
    private flowService: FlowService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.editFlowForm = this.fb.group({
      content: [''],
      title: [
        '',
        Validators.compose([Validators.required, Validators.minLength(4)]),
      ],
      reference: [
        '',
        Validators.compose([Validators.required, Validators.minLength(1)]),
      ],
      type_text: ['Originale'],
      letter_text: ['Lettre'],
      note: [''],
      labels: [[]],
      files: [[]],
      entity: [new Entity()],
      numero: [
        ,
        Validators.compose([Validators.required, Validators.minLength(1)]),
      ],
      date: [
        new Date(),
        Validators.compose([Validators.required, Validators.minLength(1)]),
      ],
      date_received: [
        new Date(),
        Validators.compose([Validators.required, Validators.minLength(1)]),
      ],
      urgent: [
        false,
        Validators.compose([Validators.required, Validators.minLength(1)]),
      ],
    });
  }

  submit() {}
}
