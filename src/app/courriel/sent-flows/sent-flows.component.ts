import { Title } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { FlowService } from '../flows/flow.service';

@Component({
  selector: 'app-sent-flows',
  templateUrl: './sent-flows.component.html',
  styleUrls: ['./sent-flows.component.scss'],
})
export class SentFlowsComponent implements OnInit {
  sentFlows$ = this.flowService.sentFlows$;

  constructor(
    private flowService: FlowService,
    private titleService: Title,
    ) {
      this.titleService.setTitle('Sentbox')
    }

  ngOnInit(): void {}
}
