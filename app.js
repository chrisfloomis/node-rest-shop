const express = require('express');
const app = express();
const morgan = require('morgan'); //logger
const bodyParser = require('body-parser'); //can parse URL & JSON bodies
const mongoose = require('mongoose');

//routes
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');

mongoose.connect(
    'mongodb+srv://crisp_mini:' + 
    process.env.MONGO_ATLAS_PW + 
    '@node-shop-jezeh.mongodb.net/test?retryWrites=true&w=majority', 
    {
        useNewUrlParser: true, useUnifiedTopology: true
    }
);

//middleware
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));      //route for GET /uploads/<img>: 1st param sets route, 2nd param makes dir public
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//CORS (cross origin resource sharing)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers", 
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === 'OPTIONS') {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});

//route handlers
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);

//error handlers
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

//export to be used by server.js
module.exports = app;