import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Link } from '../classes/link';
import { Strings } from '../classes/strings';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss'],
})
export class AppsComponent implements OnInit {
  Link = Link;
  user = this.userService;
  constructor(
    private userService: UserService,
    private titleService: Title,
    ) {
      this.titleService.setTitle(Strings.appsTitle)
    }

  ngOnInit(): void {}
}
