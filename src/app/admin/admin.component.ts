import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Link } from 'src/app/classes/link';
import { UserService } from '../services/user.service';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  Link = Link;
  constructor(public userService: UserService, public router: Router) {
    this.userService.loggedOut$.subscribe((loggedOut) => {
      if (loggedOut) {
        router.navigate(['/']);
      }
    });
  }

  ngOnInit(): void {}
}
