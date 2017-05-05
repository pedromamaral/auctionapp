import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import {User} from './user';

@Injectable()
export class RegisterService {
	private registerUrl = "/api/newuser"

  constructor(private http: Http) {
   }

// Http POST call to the api to submit the new user data returns a boolean observer to indicate success
 submitNewUser (user: User) : Observable <boolean> {
              
              return this.http.post(this.registerUrl, user)
                    		  .map((res: Response) => {
  								//if the answer was a 200s code 
  								if (res.ok){
  						   		  console.log('user created with success'); 	
  						  		  return true //indicates sucessful response
  					    		} else {
  					    		  return false //indicates failed registration
  					    		}
  							  }) //catch any server errors
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


}
