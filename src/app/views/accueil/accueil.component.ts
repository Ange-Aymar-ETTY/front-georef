import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss']
})
export class AccueilComponent implements OnInit {
  isSidenavToggled = false;
  username: string;

  constructor(public route: Router, private authServive: AuthService) { }

  ngOnInit() {
    this.authServive.currentUser.subscribe(user => {
      this.username = user.nom_prenoms;
    })
  }

}
