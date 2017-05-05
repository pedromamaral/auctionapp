import { Injectable } from '@angular/core';
import { SignInService } from './signin.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

@Injectable()
export class SocketService {
	private url = 'http://localhost:3000';
	private socket;
 
 //constructor receives IO object and SignInService to check for authentication token
  constructor(private signInService: SignInService) { }
  
  connect (){
  	this.socket = io(this.url,{'multiplex': false ,
			      query: 'token=' + this.signInService.token
		      })
  }

  disconnect(){
  	 this.socket.disconnect();
  }

  // sends a new event with name EventName and data Data
  sendEvent (EventName,Data){
  						 // newUser:username' is the name of the event in the server. 	
  		this.socket.emit(EventName , Data);
  }

 // configures an observable to emit a value every time we receive a event with name
  getEvent(Eventname){
  	 let observable = new Observable (observer =>{
  	 	this.socket.on(Eventname, (data) => {
  	 		observer.next(data);
  	 	});
  	 })
  	 return observable;
  }

}