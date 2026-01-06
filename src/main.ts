import { enableProdMode, importProvidersFrom } from '@angular/core';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';

import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { provideKeycloakAngular } from './app/authentication/keycloak.config';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

const keycloakSettings = {
  url: '',
  realm: '',
  clientId: '',
};

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(AppRoutingModule, BrowserModule),
    provideHttpClient(withInterceptorsFromDi()),
    provideKeycloakAngular(keycloakSettings)
  ],
}).catch((err) => console.log(err));
