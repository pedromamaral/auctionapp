import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import {Item} from './item';

@Injectable()
export class InsertitemService {
	private newitemUrl = "/api/newitem"

  constructor(private http: Http) {
   }

 // Http POST call to the api to submit the new user data returns a boolean observer to indicate success
  submitNewItem (item: Item) : Observable <boolean> {
              
              return this.http.post(this.newitemUrl, item)
                    		  .map((res: Response) => {
  								//if the answer was a 200s code 
  								if (res.ok){
  						   		  console.log('item inserted with success'); 	
  						  		  return true //indicates sucessful response
  					    		} else {
  					    		  return false //indicates failed item creation
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
