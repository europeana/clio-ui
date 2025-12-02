import { Component } from '@angular/core';
import { apiSettings } from '../environments/apisettings';

import { HeaderComponent } from './header';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [HeaderComponent],
})
export class AppComponent {
  title = 'Clio UI';
  endpoint = apiSettings.serverAPI;
}
