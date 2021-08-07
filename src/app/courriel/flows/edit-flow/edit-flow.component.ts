import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, map } from 'rxjs/operators';
import { Entity } from 'src/app/classes/entity';
import { AppFile } from 'src/app/classes/file';
import { Flow } from 'src/app/classes/flow';
import { Link } from 'src/app/classes/link';
import { Strings } from 'src/app/classes/strings';
import { FileService } from 'src/app/services/file.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';
import { FlowService } from '../flow.service';

@Component({
  selector: 'app-edit-flow',
  templateUrl: './edit-flow.component.html',
  styleUrls: ['./edit-flow.component.scss'],
})
export class EditFlowComponent implements OnInit {
  flow_id = 0;
  loading = false;
  Strings = Strings;
  Link = Link;
  editFlowForm = new FormGroup({});

  user = this.userService._activeUser;

  flow$ = this.route.queryParams.pipe(
    switchMap((routeData) => {
      this.flow_id = parseInt(routeData.flow_id);
      return this.flowService
        .getFlow(this.flow_id)
        .pipe(map((flows) => flows[0]));
    })
  );

  deleteFile = this.fileService.removeExistingFile;

  constructor(
    private flowService: FlowService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    public fileService: FileService,
    private userService: UserService,
    private notification: NotificationService
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

    this.flow$.subscribe((flow: Flow) => {
      console.log(flow);
      this.editFlowForm.patchValue({
        content: flow.content,
        title: flow.title,
        type_text: flow.type_text,
        letter_text: flow.letter_text,
        note: flow.note,
        numero: flow.numero,
        date: flow.date,
        entity: flow.initiator_id
          ? new Entity(flow.initiator)
          : new Entity({ short: flow.initiator_text }),
        date_received: flow.date_received,
        reference: flow.reference,
        urgent: flow.urgent,
        labels: flow.labels?.length ? flow.labels.split(',') : null,
      });
    });
  }

  submit() {
    const form = this.editFlowForm.value;
    console.log(form);

    this.loading = true;

    const form_files: {
      name: string;
      size: number;
      type: string;
      src: string;
      destination: string;
      filename: string;
      flow_id: number;
      lastModified: number;
    }[] = [];

    form.files?.forEach((file: any) => {
      form_files.push({
        name: file.name,
        flow_id: this.flow_id,
        size: file.size,
        destination: file.destination,
        filename: file.filename,
        type: file.type,
        src: file.src,
        lastModified: file.lastModified.toString(),
      });
    });

    const flowVariables = {
      action: 1,
      title: form.title,
      content: form.content,
      note: form.note,
      reference: form.reference,
      labels: form.labels?.join(','),
      user_id: this.user?.id,
      date: form.date,
      urgent: form.urgent,
      type_text: form.type_text,
      letter_text: form.letter_text,
      numero: form.numero,
      date_received: form.date_received,
      owner_id: this.user?.entity_id,
      initiator_id: form.entity.id ? form.entity.id : null,
      initiator_text: form.entity.short,
      // files: {
      //   data: form_files,
      // },
    };

    if (form_files.length) {
      this.fileService.insertFiles(form_files).subscribe((data) => {
        console.log(data);
      });
    }

    this.flowService
      .updateFlow(this.flow_id, flowVariables)
      .subscribe((data: any) => {
        this.fileService.files$.next([]);
        this.fileService.progress$.next(null);
        this.notification.notify('Modifications Enregistré');
        this.loading = false;
      });
  }
}
