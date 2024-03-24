import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { headerReducer } from './ngrx/reducers/header.reducer';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserModule,
      BrowserAnimationsModule
    ),
    provideRouter(routes),
    provideHttpClient(),
    provideStore({
      header: headerReducer,
    }), provideAnimationsAsync(),
  ],
};
