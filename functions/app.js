const express = require('express');
const serverless = require('serverless-http'); // ADDED
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const model = require('../models/models'); // Note the ".." to go up one level
const flash = require('connect-flash');
require('dotenv').config();
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();
const router = express.Router(); // ADDED ROUTER

// FIX VIEW ENGINE PATH
app.set('view engine', 'ejs');
app.set('views', require('path').join(process.cwd(), 'views'));
app.use(bodyParser.urlencoded({ extended: true }));

// SESSION CONFIG
app.use(session({
    secret: process.env.SESSION_SECRET || "fallback_secret_key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.mongoURI,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 
    }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// PASSPORT CONFIG
passport.use('ngo', model.NGO.createStrategy());
passport.use('restaurant', model.RESTAURANT.createStrategy());

passport.serializeUser((user, done) => {
    done(null, { id: user.id, type: user.constructor.modelName });
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

// DB CONNECTION
const mongoURI = process.env.mongoURI;
if (mongoURI) {
    mongoose.connect(mongoURI).then(() => console.log("MongoDB Connected"));
}

// --- ROUTES (CHANGED app.get TO router.get) ---

router.get("/", function(req, res) {
    res.render('index');
});

router.get("/about", function(req, res) {
    res.render('about');
});
router.get("/contact", function(req, res) {
    res.render('contact');
});

//NGO handling
router.get("/ngoHomepage", function(req, res) {
    if (req.isAuthenticated() && req.user.role == "ngo") {
        res.render('ngo-homepage', { user: req.user });
    } else {
        res.redirect("/.netlify/functions/app/ngoLogin"); // Note the path adjustment
    }
});

router.get("/ngoRestaurants", async function(req, res) {
    if (req.isAuthenticated() && req.user.role == "ngo") {
        try {
            const orders = await model.FOODORDER.find({ status: 'available' });
            const restaurants = await model.RESTAURANT.find({});
            res.render('ngo-restaurants', { orders: orders, restaurants: restaurants, user: req.user });
        } catch (err) {
            res.redirect("/.netlify/functions/app/ngoHomepage");
        }
    } else {
        res.redirect("/.netlify/functions/app/ngoLogin");
    }
});

router.get("/ngoLogin", function(req, res) {
    res.render('ngo-login');
});

router.post("/ngoLogin", passport.authenticate('ngo', {
    successRedirect: "/.netlify/functions/app/ngoHomepage",
    failureRedirect: "/.netlify/functions/app/ngoLogin"
}));

router.post("/ngoRegister", function(req, res) {
    const newNGO = new model.NGO({
        name: req.body.nName,
        registrationNumber: req.body.ngoRegistration,
        city: req.body.city,
        address: req.body.nAddress,
        contact: req.body.nContact,
        email: req.body.nEmail,
    });
    model.NGO.register(newNGO, req.body.nPassword, function(err, user) {
        if (err) {
            console.log(err);
            return res.redirect("/.netlify/functions/app/ngoLogin");
        } else {
            passport.authenticate('ngo')(req, res, function() {
                res.redirect('/.netlify/functions/app/ngoHomepage');
            });
        }
    });
});

//Restaurant handling
router.get("/restaurant", function(req, res) {
    if (req.isAuthenticated() && req.user.role == "restaurant") {
        res.render('restaurant-homepage', { user: req.user });
    } else {
        res.redirect("/.netlify/functions/app/restaurantLogin");
    }
});

router.get("/restaurantLogin", function(req, res) {
    res.render('restaurant-login');
});

router.post("/restaurantLogin", passport.authenticate('restaurant', {
    successRedirect: "/.netlify/functions/app/restaurant",
    failureRedirect: "/.netlify/functions/app/restaurantLogin"
}));

router.post("/restaurantRegister", function(req, res) {
    const newRestaurant = new model.RESTAURANT({
        name: req.body.rName,
        address: req.body.rAddress,
        city: req.body.city,
        contact: req.body.rContact,
        email: req.body.rEmail,
        openingHours: req.body.rOpeningHours
    });
    model.RESTAURANT.register(newRestaurant, req.body.rPassword, function(err, user) {
        if (err) {
            console.log(err);
            return res.redirect("/.netlify/functions/app/restaurantLogin");
        } else {
            passport.authenticate('restaurant')(req, res, function() {
                res.redirect('/.netlify/functions/app/restaurant');
            });
        }
    });
});

//Handle Order
router.get("/createOrder", function(req, res) {
    if (req.isAuthenticated() && req.user.role == "restaurant") {
        const successMessage = req.flash('success');
        res.render('restaurant-createOrder', { successMessage: successMessage });
    } else {
        res.redirect("/.netlify/functions/app/restaurantLogin");
    }
});

router.post('/food-order', async function(req, res) {
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
            res.redirect("/.netlify/functions/app/createOrder");
        } catch (err) {
            res.redirect("/.netlify/functions/app/createOrder");
        }
    } else {
        res.redirect("/.netlify/functions/app/restaurantLogin");
    }
});

router.get("/rorderHistory", async function(req, res) {
    if (req.isAuthenticated() && req.user.role == "restaurant") {
        try {
            const orders = await model.FOODORDER.find({ restaurantid: req.user.id }).sort({ createdAt: -1 });
            const ngos = await model.NGO.find({});
            res.render('restaurant-orderHistory', { orders: orders, ngos: ngos });
        } catch (err) {
            res.redirect("/.netlify/functions/app/restaurant");
        }
    } else {
        res.redirect("/.netlify/functions/app/restaurantLogin");
    }
});

router.get("/norderHistory", async function(req, res) {
    if (req.isAuthenticated() && req.user.role == "ngo") {
        try {
            const orders = await model.FOODORDER.find({ ngoid: req.user.id }).sort({ createdAt: -1 });
            const restaurants = await model.RESTAURANT.find({});
            res.render('ngo-ordersHistory', { orders: orders, restaurants: restaurants });
        } catch (err) {
            res.redirect("/.netlify/functions/app/ngoHomepage");
        }
    } else {
        res.redirect("/.netlify/functions/app/ngoLogin");
    }
});

router.get("/acceptOrder/:orderid", async function(req, res) {
    if (req.isAuthenticated() && req.user.role == "ngo") {
        await model.FOODORDER.findOneAndUpdate({ _id: req.params.orderid }, { $set: { status: "claimed", ngoid: req.user.id } });
        res.redirect("/.netlify/functions/app/ngoRestaurants");
    } else {
        res.redirect("/.netlify/functions/app/ngoLogin");
    }
});

router.get("/cancelOrder/:orderid", async function(req, res) {
    if (req.isAuthenticated() && req.user.role == "ngo") {
        await model.FOODORDER.findOneAndUpdate({ _id: req.params.orderid }, { $set: { status: "available" }, $unset: { ngoid: 1 } });
        res.redirect("/.netlify/functions/app/ngoRestaurants");
    } else {
        res.redirect("/.netlify/functions/app/ngoLogin");
    }
});

router.get("/completeOrder/:orderid", async function(req, res) {
    if (req.isAuthenticated() && req.user.role == "restaurant") {
        await model.FOODORDER.findOneAndUpdate({ _id: req.params.orderid }, { $set: { status: "completed" } });
        res.redirect("/.netlify/functions/app/rorderHistory");
    } else {
        res.redirect("/.netlify/functions/app/restaurantLogin");
    }
});

router.get("/deleteOrder/:orderid", async function(req, res) {
    if (req.isAuthenticated() && req.user.role == "restaurant") {
        await model.FOODORDER.deleteOne({ _id: req.params.orderid });
        res.redirect("/.netlify/functions/app/rorderHistory");
    } else {
        res.redirect("/.netlify/functions/app/restaurantLogin");
    }
});

router.get("/logout/:role", (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect("/.netlify/functions/app/");
    });
});

// ATTACH ROUTER AND EXPORT
app.use('/.netlify/functions/app', router);
module.exports.handler = serverless(app);