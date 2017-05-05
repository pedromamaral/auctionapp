import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

@Injectable()
export class SignInService {
	public token: string; //to store the jwt authentication token to re-send to the server if needed
  public latitute: number; //= 39.9611755; //latitute of the browser position
  public longitude: number; //= -82.998794199; //longitude of the browser position
 	private signinUrl = '/api/authenticate'; //URL to API authenticate service
  //constructor receives Http object from angular 2 for api calls. 
  constructor(private http: Http) { 
  	//set token if saved in local storage
  	var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) this.token = currentUser.token;
  }


  // Submit User name and Password

  login (username: string, password: string, latitute: number, longitude: number): Observable<boolean> {
      this.latitute = latitute;
      this.longitude = longitude;
      return this.http.post(this.signinUrl, { username: username, password: password, latitute: latitute, longitude:longitude  })
                    .map((res: Response) => {
  						let token = res.json().token;
  						console.log(token);
  						//if there is a token in the response 
  						if (token){
  						   console.log('token verified'); 	
  						  //set token property
  						  this.token = token;
                localStorage.setItem('currentUser', JSON.stringify({username: username, token:token}));
  						  return true //indicates sucessful login
  					    } else {
  					    	return false //indicates failed login
  					    }
  					})
                    .catch((error: Response | any) =>{
                    	 let errMsg: string;
 					     if (error instanceof Response) {
   					        errMsg = error.status + ' - ' + error.statusText;
  						 } else {
    						errMsg = error.message ? error.message : error.toString();
  						 }
  						console.error(errMsg);
 						return Observable.throw(errMsg);
                    });
  }

  logout (): void {
  	//clear token remove user from local storage to log user out
  	this.token = null;
  	localStorage.removeItem ('currentUser');
  }

}
