import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntityService } from 'src/app/services/entity.service';
import { UserService } from 'src/app/services/user.service';
import { Entity } from 'src/app/classes/entity';
import { AppFile } from 'src/app/classes/file';
import { Flow } from 'src/app/classes/flow';
import { FlowService } from '../../flow.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, switchMap } from 'rxjs/operators';
import { NotificationService } from 'src/app/services/notification.service';
import { FileService } from 'src/app/services/file.service';

@Component({
  selector: 'send-flow-form',
  templateUrl: './send-flow.component.html',
  styleUrls: ['./send-flow.component.scss'],
})
export class SendFlowFormComponent implements OnInit {
  sendFlowForm: FormGroup;
  parentFlow: Flow = new Flow();
  activeUser = this.userService._activeUser;
  queryParams$ = this.route.queryParams;
  userEntity$ = this.entityService.userEntity$;
  userEntity = this.entityService._userEntity;
  activeUser$ = this.userService.activeUser$;
  flowId$ = this.queryParams$.pipe(map((params) => parseInt(params.flow_id)));
  parentFlow$ = this.flowId$.pipe(
    switchMap((id: number) => {
      return this.flowService.getFlow(id);
    })
  );

  constructor(
    private route: ActivatedRoute,
    private flowService: FlowService,
    private userService: UserService,
    private fileService: FileService,
    private notification: NotificationService,
    private fb: FormBuilder,
    private entityService: EntityService
  ) {
    this.parentFlow$.subscribe((data) => {
      this.parentFlow = new Flow(data);
    });

    this.sendFlowForm = this.fb.group({
      labels: [],
      content: ['', Validators.compose([Validators.required])],
      note: [],
      urgent: [false],
      signature: [false],
      receivers: [[], Validators.compose([Validators.required])],
      files: [],
    });
  }

  ngOnInit(): void {}

  submit() {
    const form = this.sendFlowForm.value;
    const flows: any[] = [];

    if (!this.activeUser) return;

    const form_files: {
      name: string;
      size: number;
      type: string;
      src: string;
      destination: string;
      filename: string;
      lastModified: number;
    }[] = [];

    this.fileService.files$.value.forEach((file: any) => {
      form_files.push({
        name: file.name,
        size: file.size,
        destination: file.destination,
        filename: file.filename,
        type: file.type,
        src: file.src,
        lastModified: file.lastModified.toString(),
      });
    });

    form.receivers.forEach((entity: Entity) => {
      let flow = {
        user_id: this.activeUser!.id,
        initiator_id: this.activeUser!.entity_id,
        action: 2,
        root_id: this.parentFlow.rootId(),
        parent_id: this.parentFlow.id,
        content: form.content,
        note: form.note,
        labels: form.labels ? form.labels.join(',') : null,
        files: {
          data: form_files,
        },
        urgent: form.urgent,
        signature: form.signature,
      };

      flow = entity.id
        ? { ...flow, ...{ owner_id: entity.id, owner_text: entity.short } }
        : { ...flow, ...{ owner_text: entity.short } };

      flows.push(flow);
    });

    this.entityService.incrementEntitySentCount();

    this.flowService.insertFlows(flows).subscribe((data) => {
      this.notification.notify('Envoyé');
    });

    console.log(flows);
  }
}
