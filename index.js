require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const mongoString = process.env.MONGODB_URL;
const UssdMenu=require('ussd-builder')
mongoose.connect(mongoString);
const Model=require('./models')
const database = mongoose.connection;
database.on("error", (error) => {
    console.log(error);
});
database.once("connected", () => {
    console.log("Database connected...");
});
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




let menu = new UssdMenu();
 let dataToSave={}
// Define menu states
menu.startState({
    run: () => {
        // use menu.con() to send response without terminating session      
        menu.con('Welcome. signIn or quit:' +
            '\n1. register' +
            '\n2. quit');
    },
    // next object links to next state based on user input
    next: {
        '1': 'register',
        '2': 'quit'
    }
});
 
menu.state('register', {
    run: () => {
        
        menu.con('Hi what is your name');
    },
    next:{
      '*[a-zA-Z]+': 'register.tickets'
    }
});
 
menu.state('register.tickets', {
    run: () => {
        let name=menu.val
        dataToSave.name=name
        menu.con(`${name} how many ticket you want`);
    },
    next: {
       '*\\d+': 'end'
    }
});
 
// nesting states
menu.state('end', {
    run: () => {
        let ticket=menu.val
        dataToSave.ticket=ticket
        menu.end('Thank you for your registerataion');
       
    }
});
 
// Registering USSD handler with Express
 
app.post('/ussd', function(req, res){
    menu.run(req.body, ussdResult => {
        res.send(ussdResult);
    });
});
 
app.listen(process.env.PORT,() => {
    console.log("What's popping? We're connected");
});