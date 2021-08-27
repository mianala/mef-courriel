import { Title } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { Link } from 'src/app/classes/link';
import { UserService } from '../../services/user.service';
import { Strings } from 'src/app/classes/strings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  Link = Link;

  default_app = Link.FLOW_APP;
  constructor(private userService: UserService,
    private titleService: Title
    ) {
    userService.activeUser$.subscribe((user) => {
      this.default_app = user ? user.settings_default_app : this.default_app;
      this.titleService.setTitle(Strings.settingTitle)
    });
  }

  ngOnInit(): void {}

  updateDefaultApp(e: any) {
    this.userService.updateDefaultApp(e.value);
  }
}
