import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { TimerObservable } from 'rxjs/Observable/TimerObservable';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

import { SignInService } from './signin.service';
import {Item} from './item';
import {Useronline} from './useronline';

@Injectable()
export class AuctionService {

  constructor(private http: Http, private signInService: SignInService) { }

  //method to return an Observable Timer to use in the remaining auction time
  timertick(){

  	let timer = TimerObservable.create(0,1000); //emits a number every 1 seconds with a 0 delay at start
  	return timer;
  }

   getItems(): Observable<Item[]> {
        // add authorization header with jwt token
        let headers = new Headers({ 'Authorization': 'Bearer ' + this.signInService.token }); // insert tokern in the requests
        let options = new RequestOptions({ headers: headers });
 
        // get users from api
        return this.http.get('/api/items', options)
            .map((res: Response) => {
            	let body = res.json();
            	console.log ("recebi items: ", body);
            	return body;
            }
            )
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

   getUsers(): Observable<Useronline[]> {
        // add authorization header with jwt token
        let headers = new Headers({ 'Authorization': 'Bearer ' + this.signInService.token }); // insert tokern in the requests
        let options = new RequestOptions({ headers: headers });
 
        // get users from api
        return this.http.get('/api/users', options)
            .map((res: Response) => {
              let body = res.json();
              console.log ("recebi users: ", body);
              return body;
            }
            )
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
