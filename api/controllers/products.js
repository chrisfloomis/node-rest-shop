const mongoose = require('mongoose');
const fs = require('fs');

const Product = require('../models/product');

exports.products_get_all = (req, res, next) => {
    Product.find()
        .select('name price productImage _id')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(404).json({
                error: err
            });
        });
}

exports.products_create_product = (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
//save new product then log result, or catch error and log
    product.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Created product successfully',
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    productImage: result.productImage,
                    _id: result._id,
                    response: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + result._id
                    }
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

exports.products_get_product = (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price productImage _id')
        .exec()
        .then(doc => {
            console.log("From DB", doc);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        descritpion: 'Get list of all products',
                        url: 'http://localhost:3000/products/'
                    }
                });
            } else {
                res.status(404).json({
                    message: 'No valid entry found for ID ' + id
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
}

exports.products_update_product = (req, res, next) => {
    const id = req.params.productId;
    const props = req.body;
    // const updateOps = {}; //update operations
    // //for loop is expecting an array such as [{"propName" : "name", "value": "<new-name>"}]
    // for (const ops of req.body) {
    //     updateOps[ops.propName] = ops.value;
    // }
    Product.updateOne({ _id: id }, props) //$set is 
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Producted updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + id
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

exports.products_delete_product = (req, res, next) => {
    Product.findByIdAndDelete(req.params.productId)
        .exec()
        .then(result => {
            if (!result) {
                return res.status(404).json({
                    message: 'Product not found. Cannot delete' 
                });
            } 
            fs.unlink(result.productImage, (err) => {
                if (err) {console.log('del product image err: ' + err);}
                else {console.log('Image deleted: ' + result.productImage);}
            });
            res.status(200).json({
                message: 'Product deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/products',
                    body: { name: 'String', price: 'Number', productImage: 'jpeg or png' }
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