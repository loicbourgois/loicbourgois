import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SpreadComponent } from './spread/spread.component';
import { HomeComponent } from './home/home.component';
import { LinesComponent } from './lines/lines.component';

@NgModule({
  declarations: [
    AppComponent,
    SpreadComponent,
    HomeComponent,
    LinesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
