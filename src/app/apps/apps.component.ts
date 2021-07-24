import { Component, OnInit } from '@angular/core';
import { Link } from '../classes/link';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss'],
})
export class AppsComponent implements OnInit {
  Link = Link;
  user = this.userService;
  constructor(private userService: UserService) {}

  ngOnInit(): void {}
}
