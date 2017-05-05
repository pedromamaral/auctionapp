/**
 * api code file
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const item = require('../models/item.js');
const user = require('../models/user.js');
const secret = 'this is the secret secret secret 12356'; // same secret as in socket.js used here to sign the authentication token
//get the file with the socket api code
const socket = require('./socket.js');

/*
 * POST User sign in. User Sign in POST is treated here
 */	
exports.Authenticate =  (req, res) =>  {
  console.log('Received Authentication')
  
  user.findOne({$and:[{username:req.body.username},{password:req.body.password}]}, (err, User) =>{
       if (err) {
        console.error("ERROR: While checking for user with login");
        console.error(err);     
     } 
       if (User != null){ //user exists
        
         //update user with current latitute and longitude
        user.update({username : req.body.username}, {$set:{latitute : req.body.latitude, longitude : req.body.longitude }}, (err, result)=>{
        if(err){
          console.error(err);
        }
        if(result){
          console.log("User coordinates updated");
        }  
        // We are sending some user info inside a JSON object in the authentication token
          var token = jwt.sign(req.body, secret);
          res.json({ token: token });    
       }
       else {
       res.status(401).send('Wrong user or password');   
       }   
    });
};

/*
 * POST User registration. User registration POST is treated here
 */	
exports.NewUser =  (req, res) => {
  console.log("received form submission new user");
  console.log(req.body);
  user.findOne({username:req.body.username}, (err, ExistingUser)=>{
       if (err) {
        console.error("ERROR: While accessing database");
        console.error(err);     
       }
       if (ExistingUser == null) { //if user still does not exist
         user.create({ name : req.body.name, email : req.body.email, username: req.body.username,
              password: req.body.password, islogged: false, latitute: 0, longitude: 0 } , (err, newUser) => {
                if (err) {
                console.error("Error on saving new user");
                console.error(err); // log out to Terminal all errors     
                } else {
                console.log("Created a new user!");
                console.log(newUser);
                res.status(200).send("OK"); //sends back ok to confirm storage
               }
        });
        } else {
          console.log("User already exists");
          res.status(401).send('User name already exists');
          console.log(res.data);
          }
     });
  //check if user already exists
  //if user still does not exist
  //create a new user object instance with the fields defined in the usermodel object 
  // save the newUser to the database
};

/*
 * POST Item creation. Item creation POST is treated here
 */ 
exports.NewItem =  (req, res) => {
  console.log("received form submission new item");
	console.log(req.body);
  //check if item already exists using the description field if not create item:
  item.findOne({description:req.body.description}, (err, ExistingItem)=>{
       if (err) {
        console.error("ERROR: While accessing database");
        console.error(err);     
       }
       if (ExistingItem == null) { //if user still does not exist
         item.create({ description: req.body.description, currentbid: req.body.currentbid,
              remainingtime: req.body.remainingtime, wininguser: req.body.wininguser,
              sold: req.body.sold } , (err, newItem) => {
                if (err) {
                console.error("Error on saving new item");
                console.error(err); // log out to Terminal all errors     
                } else {
                console.log("Created a new item!");
                console.log(newItem);
                res.status(200).send("OK"); //sends back ok to confirm storage
                socket.NewItemBroadcast(newItem);
               }
        });
        } else {
          console.log("Item already exists");
          res.status(404).send('An Item with the same description already exists');
          console.log(res.data);
          }
     });
  //save the newItem to the database
	//socket.NewItemBroadcast(newItem); //broadcast to all clients the new item. 
};

/*
GET to obtain all active items in the database 
*/
exports.GetItems = (req, res) => {

/*Dummy items you should send the items that exist in the database
    let item1 = new item({description:'Smartphone',currentbid:250, remainingtime:120, wininguser:'dummyuser1'}); 
    let item2 = new item({description:'Tablet',currentbid:300, remainingtime:120, wininguser:'dummyuser2'}); 
    let item3 = new item({description:'Computer',currentbid:120, remainingtime:120, wininguser:'dummyuser3'}); 
    let items = [item1,item2,item3];
    */

  item.find({sold:false},{description: 1, currentbid: 1, wininguser: 1, remainingtime: 1},(err, Items)=>{
    if (err){
      console.error(err);
      res.status(500).send('Server Error');
    } else
    if (Items !=null){
      res.json(Items); //send array of existing active items in JSON notation
    } else {
      res.status(200).send('ok');
    }

  });
};

/*
GET to obtain all active users in the database 
*/
exports.GetUsers = (req, res) => {

  user.find({sold:false},{username: 1, latitute: 1, longitude: 1},(err, Users)=>{
    if (err){
      console.error(err);
      res.status(500).send('Server Error');
    } else
    if (Users !=null){
      res.json(Users); //send array of existing active items in JSON notation
    } else {
      res.status(200).send('ok');
    }

  });
};
