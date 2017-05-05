import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
//import Router module
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AgmCoreModule } from 'angular2-google-maps/core';

import { AuctionComponent } from './auction/auction.component';
import { InsertitemComponent } from './insertitem/insertitem.component';
import { RegisterComponent } from './register/register.component';
import { SigninComponent } from './signin/signin.component';
import { AuthGuard } from './auth.guard';
import { SocketService } from './socket.service';
import {SignInService} from './signin.service';
import {AuctionService} from './auction.service';
import {RegisterService} from './register.service';
import {InsertitemService} from './insertitem.service';


// Define the routes
const ROUTES = [
  {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full'
  },
  {
    path: 'signin',
    component: SigninComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'insertitem',
    component: InsertitemComponent, 
    canActivate: [AuthGuard]         //can only route here after sucessfull login
  },
  {
    path: 'auction',
    component: AuctionComponent,
    canActivate: [AuthGuard]        //can only route here after sucessfull login
  }
];


@NgModule({
  declarations: [
    AppComponent,
    AuctionComponent,
    InsertitemComponent,
    RegisterComponent,
    SigninComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    JsonpModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDK2FfAWfHhrgQmk34IxxCVdfdh5hvzcNw'
    }),
    RouterModule.forRoot(ROUTES) // Add routes to the app
  ],
  providers: [
     SignInService,
     SocketService,
     AuctionService,
     RegisterService,
     InsertitemService,
     AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
