import { Title } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { Link } from 'src/app/classes/link';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
  Link = Link;
  constructor(
    public userService: UserService,
    private titleService: Title
    ) {
      this.titleService.setTitle('Mef-courriel')
    }

  ngOnInit(): void {}
}
