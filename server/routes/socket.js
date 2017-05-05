/**
 * api code file
 */

const socketioJwt = require('socketio-jwt'); //to deal with authentication based in tokens -  WebSocket 
const user = require('../models/user.js'); //database use model
const item = require('../models/item.js');
const secret = 'this is the secret secret secret 12356'; // same secret as in api.js used here to verify the authentication token

var socketIDbyUsername = new Map(); // map to store clients the client object with username has key 
var usernamebySocketID = new Map(); // map to store clients the client object with socketid has key 
var ioSocket = null; // global store object for websocket

//timer function to decrement the remaining time in the items of the database with auctionTime bigger than 0. 
var IntervalId = setInterval(function(){
//start by udpating all active items with -1 auctionTime you can use the method  item.update({auctionTime: {$gt:0}},{$inc:{auctionTime: -1}},{multi:true})
/*after decrementing all items, obtain all that are less than 0 and not marked as sold yet using the item.find method that  
  returns all those items */
//send sold:item events to all clients stored in clients[]
        /* the following method sends the event for a specific socket id you can call in a cycle for all socket ids. 
           ioSocket.to(id).emit('sold:item', {  // send a sold event for each item
            //fill with object to send in JSON
           });*/ 
           //console.log ("timer interval");
  item.update({remainingtime: {$gt:0}},{$inc:{remainingtime: -1}},{multi:true}, (err, results)=> {
    if(err){
      console.error(err);
    }
  });
  
  item.find({$and:[{sold:false}, {remainingtime : {$lt:1}}]}, {description: 1, currentbid: 1, remainingtime:1, wininguser:1, sold:1}, (err, AllSoldItems) => {
    if (AllSoldItems!=null){
      for (var j=0;j<AllSoldItems.length;j++){   // for all items that reach 0 seconds
        if (!AllSoldItems[j].sold) {  // if no event sent send event and mark as sold 
          console.log ("Item vendido : " + AllSoldItems[j].description);
          item.update({description:AllSoldItems[j].description},{$set:{sold: true}},(err)=>{
            if (err) {
            console.error(err);     
            } 
          }); //update item to sold
          for (var socketID of socketIDbyUsername.values()){
            ioSocket.to(socketID).emit('item:sold', AllSoldItems[j]); 
            console.log("sold:item event sent for item:  " + AllSoldItems[j]);
          }       
        } // else do not send event
      } 
    }
  });

}, 1000); // 1000 miliseconds is the interval time 


/*broadcasts a new item to all logged clients exported so that it can be called from the index.js module after receiving POST for 
new item 
*/
exports.NewItemBroadcast = function(newItem){
   console.log("item enviado num evento websocket", newItem);
  if (ioSocket!=null){  // test if the socket was already created (at least one client already connected the websocket)

      itemtoSend = {
        description : newItem.description,
        currentbid : newItem.currentbid,
        wininguser : newItem.wininguser,
        remainingtime : newItem.remainingtime
      } 

    for (var socketID of socketIDbyUsername.values()){ // for all clients call the emit method for each socket id to send the new:item method
          ioSocket.to(socketID).emit('new:item', itemtoSend);
    }  
  } 
}

// export function for listening to the socket
exports.StartSocket =  (io) => {  

ioSocket = io; // store socket object for use in interval (timer) function

/*io.set('authorization', socketioJwt.authorize({ // demand the signed token in the WebSocket handshake
      secret: secret,
      handshake: true
    }));
     DEPRECATED*/  

io.use(socketioJwt.authorize({
       secret:secret,
       handshake:true
}));
  
io.on('connection', (socket) => {  // first time it is called is when the client connects sucessfully

  //console.log(socket.handshake.decoded_token.username, 'user connected'); // shows username in the valid token sent by client
  console.log(socket.decoded_token.username, 'user connected'); // shows username in the valid token sent by client
// defintion and handling of events:

  //new user event sent by client
  socket.on('newUser:username', data => {             
    
    /* if client is non-existent store it in clients array (the object you store is up to you) the id of the socket is 
   obtainable in the socket object : socket.id */
      /*update database user entry to user logged. Might be done more than once for the same user 
    (everytime the browser returns to the page that sends the event) no problem */  
  
   /* Send the new user the list of current not sold items from the database
    Query using item.find method with 3 arguments:
     1) an object for filtering {sold:false} 
     2) a list of properties to be return, { Description: 1, CurrentBid: 1, auctionTime:1, WiningUserName:1 } 
     3) callback function with (err, results)   err will include any error that occurred results is our resulting array of items */

  /* if sucess send the results array to the client
     socket.emit('init', {JSON OBJECT with online Users});*/       
   
   socketIDbyUsername.set(data.username,socket.id); // store client in the socketIDbyUsername map
   usernamebySocketID.set(socket.id,data.username); // store client in the usernamebySocketID map
   console.log ("new user event received: ");
  });


  socket.on('send:bid', data => {

    console.log ("received event send:bid with data = ",data);
    //veriry in the database if the data.bid is higher than the current one and is so update 
    //the wining user and send the update info for all clients
    item.findOne({$and:[{description : data.description}, {sold : false}]}, function(err, Item){
      if(err){
        console.error(err);
      }
       console.log("Item that received a bid: " + Item);
      if(Item != null){
        if(data.currentbid > Item.currentbid ){
          Item.wininguser = data.wininguser; // update wininguser and send 
          for (var socketID of socketIDbyUsername.values()){ // for all clients call the emit method for each socket id to send the new:item method
                   ioSocket.to(socketID).emit('update:bid', Item);
                   console.log ("update:bid event sent for item :" + Item);
          }  // update wininguser in database
          item.update({$and:[{description : data.description}, {sold : false}]}, {$set:{currentbid:data.currentbid, wininguser:data.wininguser}}, (err, result)=>{
              if(err){
                console.error(err);
              }
           });
        }
      }
    });
  });

  
  //when a user leaves this event is executed cleanup what you need here for example update user database
  socket.on('disconnect', function (){
       console.log("User disconnected");
       let username = usernamebySocketID.get(socket.id); // get username from socketId in the Map
       //update user status with looged in false
       user.update({username : username}, {$set:{islogged : false}}, (err, result)=>{
        if(err){
          console.error(err);
        }
        if(result){
          console.log("User disconnected");
        }

      });



  });
    

});

}