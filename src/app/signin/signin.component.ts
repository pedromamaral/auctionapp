import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SignInService } from '../signin.service';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.sass']
})

export class SigninComponent implements OnInit {
  errorMessage : string; // string to store error messages
  View : string; //string that is written in the main menu. 
  latitute: number; //= 39.9611755; //latitute of the browser position
  longitude: number; //= -82.998794199; //longitude of the browser position

  constructor(private signinservice: SignInService, private router: Router, private socketservice: SocketService ) { }

  ngOnInit() {
  	this.View= "Sign In";
  }

  login (username: string, password: string ){
    this.setCurrentPosition(); // stores current position
  	if (!username || !password)	{return; } // if user name and password are filled then subscribe to the Http service 
  	this.signinservice.login(username,password,this.latitute,this.longitude)
  	    .subscribe(
  	    	result => {                  
  	    	  	if (result == true){   // if the result of the Http POST call made in the signinservice is true 
  	    	  	this.socketservice.connect();	
  	    	  	this.socketservice.sendEvent('newUser:username',{username: username});
  	    		console.log('navigating to auction')
  	    		//login successful navigate to acution page
  	    		this.router.navigate(['/auction']);
  	    		} else {
  	    		//login failed
  	    		this.errorMessage = 'Username or password is incorrect';
  	    		}
  	    	},	
  	    	error => {
  	    		this.errorMessage = <any>error;	
  	    	}	
  	    );
  }

  clearError(){
  	this.errorMessage="";
  }

  logout(){
  	//perform any needed logout logic here 
  	this.socketservice.disconnect();
  	this.router.navigate(['/signin']);
  	this.signinservice.logout();
  }

    private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitute = position.coords.latitude;//this.convertStringToNumber(position.coords.latitude);
        this.longitude = position.coords.longitude;//this.convertStringToNumber(position.coords.longitude);
      });
    }
  }

}

