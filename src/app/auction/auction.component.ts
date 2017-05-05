import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../socket.service';
import { AuctionService } from '../auction.service';
import { SignInService } from '../signin.service';
import {Item} from '../item';
import {Useronline} from '../useronline';
import {Marker} from '../marker'

@Component({
  selector: 'app-auction',
  templateUrl: './auction.component.html',
  styleUrls: ['./auction.component.sass']
})
export class AuctionComponent implements OnInit {
  items: Item[]; //array of items to store the items. 
  messages: string[]; //array of message strings
  showBid: boolean;  //boolean to control if the show bid form is placed in the DOM
  view: string;
  selectedItem: Item; //Selected Item 
  updateBid; //Object that contains the Observable subscription for the New Bid Websocket event
  newitem; //Object that contains the Observable subscription for the New Item Websocket event
  itemsold; //Object that contains the Observable subscription for the Item Sold Websocket event
  timerticks; //Object that contains the Observable subscription for the timer tick events
  latitute: number; //= 39.9611755; //latitute of the browser position
  longitude: number; //= -82.998794199; //longitude of the browser position
  zoom: number = 8; //map zoom
  markers: Marker[]; //array to store the markers for the looged users posistions. 
  receivedUpdateBid: Item;
  userName: string;
  errorMessage: string; //string to store error messages received in the interaction with the api


  constructor(private router: Router, private socketservice: SocketService, private auctionservice: AuctionService,
   private signinservice: SignInService) {
     //use google maps to show user current location
    
    //this.setCurrentPosition();    
   }

  ngOnInit() {
    this.view = "Auction";
    //gets the username from the localStorage where it is stored together with the Authorization token
    // in the currenUser Object (this is stored by the signinservice when the HTTP call to the API is successfull)
    let currentuser = JSON.parse(localStorage.getItem('currentUser'));
    this.userName = currentuser.username;  
    this.messages = [];
    this.items = [];
    this.markers = [];
    this.messages.push("Hello " + this.userName + "! Welcome to the RIT II auction site.");


    // Get initial item data from the the server api using http call in the auctionservice
    this.auctionservice.getItems()

        .subscribe(items => {
          let receiveddata = items as Item[]; // cast the received data as an array of items (must be sent like that from server)
            this.items = receiveddata;
        },
        error => this.errorMessage = <any>error );

      // Get initial item user locations from the the server api using http call in the auctionservice
    this.auctionservice.getUsers()

        .subscribe(users => {
          let receiveddata = users as Useronline[]; // cast the received data as an array of users (must be sent like that from server)
            this.showPositions(receiveddata);     //use the users vectors to build markers to show on the map and to obtain browser coordinates to center the map.       
        },
        error => this.errorMessage = <any>error );    

     

    //subscribe to the incoming websocket events 
    //subscribe to the upadate bid event
    this.updateBid = this.socketservice.getEvent("update:bid")
    					       .subscribe(
    					 	       data =>{
                            let receiveddata = data as Item; //cast the generic data object to the Item object;
                            console.log("received update:bid event for item: " + receiveddata);
                            if (this.items){  
                              let exists = false;
                              for (let i=0; i< this.items.length; i++){
                                if (this.items[i].description == receiveddata.description) {
                                  this.items[i] = receiveddata;
                                  exists = true;
                                }
                              }
                              if (!exists) {
                                console.log("received update:bid event for an unexistent item");
                              } 
                            }   
    					 	       }
    					       );
    
    //subscribe to the new item event

    this.newitem = this.socketservice.getEvent("new:item")
                     .subscribe(
                       data =>{
                            let receiveddata = data as Item; //cast the generic data object to the Item object;
                            if (this.items){  
                              let exists = false;
                              for (let i=0; i< this.items.length; i++){
                                if (this.items[i].description == receiveddata.description) {
                                  exists = true;
                                }
                              }
                              if (!exists) {
                                this.items.push(receiveddata);
                              } 
                            }  
                       }
                     );

  //subscribe to the item sold event

    this.itemsold = this.socketservice.getEvent("item:sold")
                     .subscribe(
                       data =>{
                            let receiveddata = data as Item; //cast the generic data object to the Item object;
                            if (this.items){  
                              let exists = false;
                              for (let i=0; i< this.items.length; i++){
                                if (this.items[i].description == receiveddata.description) {
                                  exists = true;
                                  this.items.splice(i,1); // remove sold item from screen
                                  if (receiveddata.wininguser == this.userName) {
                                    this.messages.push(this.userName + " CONGRATULATIONS you have WON the "+ 
                                                        receiveddata.description + " auction with a winning bid of: " + receiveddata.currentbid);
                                  } else {
                                    this.messages.push(receiveddata.wininguser + " has WON the auction for item: "+ 
                                                        receiveddata.description+ " with a winning bid of: " + receiveddata.currentbid);
                                  }
                                }
                              }
                              if (!exists) {
                                console.log("received item:sold event for an unexistent item");
                              } 
                            } 
                       }
                     );


    // subscription to the timer in the auction service. 
    this.timerticks = this.auctionservice.timertick()
                      .subscribe(
                        t =>{
                          this.decreaseTime(t);
                        }   
                      );            


  }

  logout(){
  	//perform any needed logout logic here 
  	this.socketservice.disconnect();
    //navigate back to the log in page
    this.router.navigate(['/signin']);
    //call the logout function in the signInService to clear the token in the browser
    this.signinservice.logout();

  }

  selectBidItem(item: Item){
  	console.log("Selected item = ", item);
  	this.selectedItem = item;
  	this.showBid = true;
  }

   submitBid(bid: number){
  	console.log("submitted bid = ", bid);
  	this.selectedItem.currentbid = bid;      //send the item with the bid 
  	this.selectedItem.wininguser = this.userName; //send this username as the wininuser (the server will verify if it is or not)
  	console.log ("submitting send:bid event with data = ", this.selectedItem);
  	this.socketservice.sendEvent('send:bid',this.selectedItem);
  }

   cancelBid(){
   	this.showBid = false;
   }

   //function called each time the timer ticks time is the number of elapsed seconds from the start of the timer
   decreaseTime(time: number){
    if (this.items){  
      for (let i=0; i< this.items.length; i++){
        if (this.items[i].remainingtime >0) this.items[i].remainingtime-=1;
      }
    }
   }

    // function to cleat the alert box that display errors returned by the api form the DOM
    clearError(){
    this.errorMessage=""
  }

  private showPositions(users: Useronline[]) {
    // browser coordinates to center the map 
    this.latitute = this.signinservice.latitute;   // browser latitute obtained at signin
    this.longitude = this.signinservice.longitude; //browser longitude obtained at signin
    this.zoom = 8;
    for (let user of users){  // create the markers for all users
      this.markers.push(new Marker(user.latitute,user.longitude,user.username));
    }
  }

  private convertStringToNumber(value): number {
        return +value;
    }

}
