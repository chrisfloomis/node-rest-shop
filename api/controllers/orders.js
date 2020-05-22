const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

exports.orders_get_all = (req, res, next) => {
    Order.find()                            //find all orders
        .select('product quantity _id')     //select properties
        .populate('product', 'name')        //gets info of the product beyond _id
        .exec()                             //creates promise, stack trace back to call in your code
        .then(docs => {                     //then return json
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + doc._id
                        }
                    }
                })
            });
        })
        .catch(err => {                     //or return error
            res.status(500).json({
                error: err
            });
        });
}

exports.orders_create_order = (req, res, next) => {
    Product.findById(req.body.productId)            //check if product exists
        .then(product => {
            if (!product) {                         //if it does not return error
                return res.status(400).json({
                    message: 'Product not found'
                });
            }
            const order = new Order({               //otherwise create new order
                _id: new mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            return order.save();                    //save b/c we are in Product.findById chain
        })
        .then(result => {                           //this code will only run if product exists
            if (res.statusCode === 400 ) {          //if product was not found return res
                return res;
            }
            console.log(result);
            res.status(201).json({
                message: 'Order stored!',
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                },
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders/' + result._id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.orders_get_order = (req, res, next) => {
    Order.findById(req.params.orderId)
        .populate('product')
        .exec()
        .then(order => {
            if (!order) {
                return res.status(404).json({
                    message: 'Order not found'
                });
            }
            res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders'
                }
            });
        })
        .catch( err => {
            res.status(500).json({
                error: err
            });
        });
}

exports.orders_delete_order = (req, res, next) => {
    Order.findByIdAndDelete(req.params.orderId)         //allows me to check if the order exist
    //Order.deleteOne({ _id: req.params.orderId })      <-what Max did in tut
        .exec()
        .then(result => {
            if (!result) {
                return res.status(404).json({
                    message: 'Order not found. Cannot delete' 
                });
            }
            res.status(200).json({
                message: 'Order deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/orders',
                    body: { productId: 'ID', quantity: 'Number' }
                }
            });
        })
        .catch( err => {
            res.status(500).json({
                error: err
            });
        });
}