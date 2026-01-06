import { Component, inject } from '@angular/core';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {

  public readonly keycloak = inject(Keycloak);

}
