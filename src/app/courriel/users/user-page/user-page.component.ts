import { Title } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/classes/user';
import { UserService } from '../../../services/user.service';
import { Strings } from 'src/app/classes/strings';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.scss'],
})
export class UserPageComponent implements OnInit {
  constructor(public userService: UserService, private route: ActivatedRoute, private titleService: Title) { this.titleService.setTitle(Strings.profilTitle) }

  ngOnInit(): void { }

  logout() {
    this.userService.logout();
  }
}
