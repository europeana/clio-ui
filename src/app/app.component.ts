import { Component } from '@angular/core';
import { apiSettings } from '../environments/apisettings';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'clio-ui';
  endpoint = apiSettings.serverAPI;
}
