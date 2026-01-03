// const express=require('express');
// const bodyParser=require('body-parser');
// const ejs=require('ejs');
// const app=express();
// const mongoose=require('mongoose');
// const model=require('./models/models');
// const flash = require('connect-flash');
// require('dotenv').config();
// const session = require("express-session");
// const passport = require("passport");
// const passportLocalMongoose = require("passport-local-mongoose");


// app.use(bodyParser.urlencoded({extended:true}));
// app.use(express.static("public"));
// app.set('view engine','ejs');

// app.use(session({
//     secret : "any long secret key",
//     resave : false,
//     saveUninitialized : false
// }));

// app.use(passport.initialize());
// app.use(passport.session());
// app.use(flash());
// //NGO
// passport.use('ngo',model.NGO.createStrategy());
// //Restaurant
// passport.use('restaurant',model.RESTAURANT.createStrategy());

// passport.serializeUser((user, done) => {
//   done(null, {
//     id: user.id,
//     type: user.constructor.modelName // <- this is "NGO" or "Restaurant"
//   });
// });

// passport.deserializeUser(async (obj, done) => {
//   const Model = obj.type === "NGO" ? model.NGO : model.RESTAURANT;
//   const user = await Model.findById(obj.id);
//   done(null, user);
// });

// const mongoURI= process.env.mongoURI;
// console.log(mongoURI);
// mongoose.connect(mongoURI);
// // mongoose.connect("mongodb://database:27017/donation-app" || "mongodb://localhost:27017/donation-app");
// app.get("/",function(req,res){
//     res.render('index');
// });

// app.get("/about",function(req,res){
//     res.render('about');
// });
// app.get("/contact",function(req,res){
//     res.render('contact');
// });
// //NGO handling
// app.get("/ngoHomepage",function(req,res){
//     if(req.isAuthenticated() && req.user.role=="ngo"){
//         console.log(req.user);
//         res.render('ngo-homepage',{user:req.user});
//     }
//     else{
//         console.log("Unauthentic User");
//         res.redirect("/ngoLogin");
//     }
    
// });

// app.get("/ngoRestaurants",async function(req,res){
//     if(req.isAuthenticated() && req.user.role=="ngo"){
//         console.log(req.user);
//         const orders=await model.FOODORDER.find({status:'available'});
//         console.log(orders)
//         const restaurants=await model.RESTAURANT.find({});
//         res.render('ngo-restaurants',{orders:orders,restaurants:restaurants,user:req.user});
//     }
//     else{
//         console.log("Unauthentic User");
//         res.redirect("/ngoLogin");
//     }
    
// });

// app.get("/ngoLogin",function(req,res){

//     res.render('ngo-login');
// });

// app.post("/ngoLogin",passport.authenticate('ngo',{
//     successRedirect:"/ngoHomepage",
//     failureRedirect:"/ngoLogin"
// }));



// app.post("/ngoRegister",function(req,res){
     
//     const newNGO=new model.NGO({
//      name:req.body.nName,
//      registrationNumber:req.body.ngoRegistration,
//      city:req.body.city,
//      address:req.body.nAddress,
//      contact:req.body.nContact,
//      email:req.body.nEmail,
//     });
//     const password=req.body.nPassword;
//     console.log(password);
//     model.NGO.register(newNGO,password,function (err, user) {      
//     if (err) {
    
//       // if some error is occurring, log that error
//       console.log(err);
//     }
//     else {
//         console.log("No error came");
//       req.login(user, function(err) {
//         if (err) { return next(err); }
//         res.redirect('/ngoLogin');
//       });
//     }
//     });
    
// });




// //Restaurant handling
// app.get("/restaurant",function(req,res){
//         if(req.isAuthenticated() && req.user.role=="restaurant"){
//         res.render('restaurant-homepage',{user:req.user});
//     }
//     else{
//         console.log("Unauthentic User");
//         res.redirect("/restaurantLogin");
//     }
// });

// app.get("/restaurantLogin",function(req,res){
//     res.render('restaurant-login');
// });

// app.post("/restaurantLogin",passport.authenticate('restaurant',{
//     successRedirect:"/restaurant",
//     failureRedirect:"/restaurantLogin"
// }));

// app.post("/restaurantRegister", function(req, res) {
//     const newRestaurant=new model.RESTAURANT({
//      name : req.body.rName,
//      address : req.body.rAddress,
//      city : req.body.city,
//      contact : req.body.rContact,
//      email : req.body.rEmail,
//      openingHours : req.body.rOpeningHours

//     });
//     const password = req.body.rPassword;

//     console.log(password);
//     model.RESTAURANT.register(newRestaurant,password,function (err, user) {      
//     if (err) {
//       console.log(err);
//     }
//     else {
//         console.log("No error came");
//       req.login(user, function(err) {
//         if (err) { return next(err); }
//         res.redirect('/restaurantLogin');
//       });
//     }
//     });


// });

// //Handle Order
// app.get("/createOrder",function(req,res){
//         if(req.isAuthenticated() && req.user.role=="restaurant"){
//           const successMessage = req.flash('success');
//         res.render('restaurant-createOrder',{successMessage:successMessage});
//     }
//     else{
//         console.log("Unauthentic User");
//         res.redirect("/restaurantLogin");
//     }
// });


// app.post('/food-order',async function(req, res)  {
//   if(req.isAuthenticated() && req.user.role=="restaurant"){

//     const newOrder=new model.FOODORDER({
//        itemName:req.body.itemName,
//        description:req.body.description,
//        quantity:req.body.quantity,
//        restaurantid: req.user.id
//     });
//     await newOrder.save();
//   // You can now save to DB, send a response, etc.
//   // res.send('Food request created check orders!');
//   req.flash('success', 'Order successfully created!');
//   res.redirect("/createOrder");
// }
// else{
//         console.log("Unauthentic User");
//         res.redirect("/restaurantLogin");
//     }
// });

// app.get("/rorderHistory",async function(req,res){
//     if(req.isAuthenticated() && req.user.role=="restaurant"){
//           const orders= await model.FOODORDER.find({restaurantid:req.user.id}).sort({createdAt:-1});
//           const ngos= await model.NGO.find({});
//           console.log(orders);
//           res.render('restaurant-orderHistory',{orders:orders,ngos:ngos});
//     }
//     else{
//         console.log("Unauthentic User");
//         res.redirect("/restaurantLogin");
//     }
// });

// app.get("/norderHistory",async function(req,res){
//     if(req.isAuthenticated() && req.user.role=="ngo"){
//           const orders= await model.FOODORDER.find({ngoid:req.user.id}).sort({createdAt:-1});
//           const restaurants=await model.RESTAURANT.find({});
//           console.log(orders);
//           res.render('ngo-ordersHistory',{orders:orders,restaurants:restaurants});
//     }
//     else{
//         console.log("Unauthentic User");
//         res.redirect("/ngoLogin");
//     }
// });


// app.get("/acceptOrder/:orderid",async function(req,res){
//   if(req.isAuthenticated() && req.user.role=="ngo"){
//     await model.FOODORDER.findOneAndUpdate({_id:req.params.orderid},{$set: {status:"claimed",ngoid:req.user.id}});
//     res.redirect("/ngoRestaurants");
//   }
//     else{
//         console.log("Unauthentic User");
//         res.redirect("/ngotLogin");
//     }
// });

// app.get("/cancelOrder/:orderid",async function(req,res){
//   if(req.isAuthenticated() && req.user.role=="ngo"){
//     await model.FOODORDER.findOneAndUpdate({_id:req.params.orderid},{$set: {status:"available"},$unset:{ngoid:1}});
//     res.redirect("/ngoRestaurants");
//   }
//     else{
//         console.log("Unauthentic User");
//         res.redirect("/ngotLogin");
//     }
// });

// app.get("/completeOrder/:orderid",async function(req,res){
//   if(req.isAuthenticated() && req.user.role=="restaurant"){
//     await model.FOODORDER.findOneAndUpdate({_id:req.params.orderid},{$set: {status:"completed"}});
//     res.redirect("/rorderHistory");
//   }
//     else{
//         console.log("Unauthentic User");
//         res.redirect("/restaurantLogin");
//     }
// });

// app.get("/deleteOrder/:orderid",async function(req,res){
//   if(req.isAuthenticated() && req.user.role=="restaurant"){
//     await model.FOODORDER.deleteOne({_id:req.params.orderid});
//     res.redirect("/rorderHistory");
//   }
//     else{
//         console.log("Unauthentic User");
//         res.redirect("/restaurantLogin");
//     }
// });


// //Logout
// app.get("/logout/:role", (req, res, next) => {
//   if (req.params.role=="ngo"){
//     req.logout(function(err) {
//     if (err) { return next(err); }
//     res.redirect("/");
//   });
//   }
//   else{
//     req.logout(function(err) {
//     if (err) { return next(err); }
//     res.redirect("/");
//   });

//   }
  
// });

// //Port Listening
// // app.listen(3000,function(){
// //     console.log("Server Running ...");
// // })

// const PORT = process.env.PORT || 3000; // Use the system port or fallback to 3000
// app.listen(PORT, function() {
//     console.log(`Server running on port ${PORT}`);
// });.


const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
const mongoose = require('mongoose');
const model = require('./models/models');
const flash = require('connect-flash');
require('dotenv').config();
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const MongoStore = require('connect-mongo'); // 1. IMPORT THIS

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

// 2. UPDATED SESSION CONFIGURATION
// We use MongoStore so users stay logged in even if the server restarts
app.use(session({
    secret: process.env.SESSION_SECRET || "fallback_secret_key", // Use Env Var
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.mongoURI, // Store sessions in your MongoDB
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//NGO
passport.use('ngo', model.NGO.createStrategy());
//Restaurant
passport.use('restaurant', model.RESTAURANT.createStrategy());

passport.serializeUser((user, done) => {
    done(null, {
        id: user.id,
        type: user.constructor.modelName // <- this is "NGO" or "Restaurant"
    });
});

passport.deserializeUser(async (obj, done) => {
    const Model = obj.type === "NGO" ? model.NGO : model.RESTAURANT;
    try {
        const user = await Model.findById(obj.id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Database Connection
const mongoURI = process.env.mongoURI;
if (!mongoURI) {
    console.error("Error: mongoURI not found in environment variables.");
} else {
    mongoose.connect(mongoURI)
        .then(() => console.log("MongoDB Connected Successfully"))
        .catch((err) => console.log("MongoDB Connection Error:", err));
}

app.get("/", function(req, res) {
    res.render('index');
});

app.get("/about", function(req, res) {
    res.render('about');
});
app.get("/contact", function(req, res) {
    res.render('contact');
});

//NGO handling
app.get("/ngoHomepage", function(req, res) {
    if (req.isAuthenticated() && req.user.role == "ngo") {
        res.render('ngo-homepage', { user: req.user });
    } else {
        res.redirect("/ngoLogin");
    }
});

app.get("/ngoRestaurants", async function(req, res) {
    if (req.isAuthenticated() && req.user.role == "ngo") {
        try {
            const orders = await model.FOODORDER.find({ status: 'available' });
            const restaurants = await model.RESTAURANT.find({});
            res.render('ngo-restaurants', { orders: orders, restaurants: restaurants, user: req.user });
        } catch (err) {
            console.log(err);
            res.redirect("/ngoHomepage");
        }
    } else {
        res.redirect("/ngoLogin");
    }
});

app.get("/ngoLogin", function(req, res) {
    res.render('ngo-login');
});

app.post("/ngoLogin", passport.authenticate('ngo', {
    successRedirect: "/ngoHomepage",
    failureRedirect: "/ngoLogin"
}));

app.post("/ngoRegister", function(req, res) {
    const newNGO = new model.NGO({
        name: req.body.nName,
        registrationNumber: req.body.ngoRegistration,
        city: req.body.city,
        address: req.body.nAddress,
        contact: req.body.nContact,
        email: req.body.nEmail,
    });
    const password = req.body.nPassword;
    model.NGO.register(newNGO, password, function(err, user) {
        if (err) {
            console.log(err);
            return res.redirect("/ngoLogin"); // Handle error gracefully
        } else {
            passport.authenticate('ngo')(req, res, function() {
                res.redirect('/ngoHomepage');
            });
        }
    });
});

//Restaurant handling
app.get("/restaurant", function(req, res) {
    if (req.isAuthenticated() && req.user.role == "restaurant") {
        res.render('restaurant-homepage', { user: req.user });
    } else {
        res.redirect("/restaurantLogin");
    }
});

app.get("/restaurantLogin", function(req, res) {
    res.render('restaurant-login');
});

app.post("/restaurantLogin", passport.authenticate('restaurant', {
    successRedirect: "/restaurant",
    failureRedirect: "/restaurantLogin"
}));

app.post("/restaurantRegister", function(req, res) {
    const newRestaurant = new model.RESTAURANT({
        name: req.body.rName,
        address: req.body.rAddress,
        city: req.body.city,
        contact: req.body.rContact,
        email: req.body.rEmail,
        openingHours: req.body.rOpeningHours
    });
    const password = req.body.rPassword;
    model.RESTAURANT.register(newRestaurant, password, function(err, user) {
        if (err) {
            console.log(err);
            return res.redirect("/restaurantLogin");
        } else {
            passport.authenticate('restaurant')(req, res, function() {
                res.redirect('/restaurant');
            });
        }
    });
});

//Handle Order
app.get("/createOrder", function(req, res) {
    if (req.isAuthenticated() && req.user.role == "restaurant") {
        const successMessage = req.flash('success');
        res.render('restaurant-createOrder', { successMessage: successMessage });
    } else {
        res.redirect("/restaurantLogin");
    }
});


app.post('/food-order', async function(req, res) {
    if (req.isAuthenticated() && req.user.role == "restaurant") {
        try {
            const newOrder = new model.FOODORDER({
                itemName: req.body.itemName,
                description: req.body.description,
                quantity: req.body.quantity,
                restaurantid: req.user.id
            });
            await newOrder.save();
            req.flash('success', 'Order successfully created!');
            res.redirect("/createOrder");
        } catch (err) {
            console.log(err);
            res.redirect("/createOrder");
        }
    } else {
        res.redirect("/restaurantLogin");
    }
});

app.get("/rorderHistory", async function(req, res) {
    if (req.isAuthenticated() && req.user.role == "restaurant") {
        try {
            const orders = await model.FOODORDER.find({ restaurantid: req.user.id }).sort({ createdAt: -1 });
            const ngos = await model.NGO.find({});
            res.render('restaurant-orderHistory', { orders: orders, ngos: ngos });
        } catch (err) {
            console.log(err);
            res.redirect("/restaurant");
        }
    } else {
        res.redirect("/restaurantLogin");
    }
});

app.get("/norderHistory", async function(req, res) {
    if (req.isAuthenticated() && req.user.role == "ngo") {
        try {
            const orders = await model.FOODORDER.find({ ngoid: req.user.id }).sort({ createdAt: -1 });
            const restaurants = await model.RESTAURANT.find({});
            res.render('ngo-ordersHistory', { orders: orders, restaurants: restaurants });
        } catch (err) {
            console.log(err);
            res.redirect("/ngoHomepage");
        }
    } else {
        res.redirect("/ngoLogin");
    }
});


app.get("/acceptOrder/:orderid", async function(req, res) {
    if (req.isAuthenticated() && req.user.role == "ngo") {
        await model.FOODORDER.findOneAndUpdate({ _id: req.params.orderid }, { $set: { status: "claimed", ngoid: req.user.id } });
        res.redirect("/ngoRestaurants");
    } else {
        res.redirect("/ngoLogin");
    }
});

app.get("/cancelOrder/:orderid", async function(req, res) {
    if (req.isAuthenticated() && req.user.role == "ngo") {
        await model.FOODORDER.findOneAndUpdate({ _id: req.params.orderid }, { $set: { status: "available" }, $unset: { ngoid: 1 } });
        res.redirect("/ngoRestaurants");
    } else {
        res.redirect("/ngoLogin");
    }
});

app.get("/completeOrder/:orderid", async function(req, res) {
    if (req.isAuthenticated() && req.user.role == "restaurant") {
        await model.FOODORDER.findOneAndUpdate({ _id: req.params.orderid }, { $set: { status: "completed" } });
        res.redirect("/rorderHistory");
    } else {
        res.redirect("/restaurantLogin");
    }
});

app.get("/deleteOrder/:orderid", async function(req, res) {
    if (req.isAuthenticated() && req.user.role == "restaurant") {
        await model.FOODORDER.deleteOne({ _id: req.params.orderid });
        res.redirect("/rorderHistory");
    } else {
        res.redirect("/restaurantLogin");
    }
});


//Logout
app.get("/logout/:role", (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect("/");
    });
});

//Port Listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log(`Server running on port ${PORT}`);
});