const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.users_signup = (req, res, next) => {
    User.find({ email: req.body.email })    //returns array of users
        .exec()
        .then(user => {
            if (user.length >= 1) {
                console.log(user);
                return res.status(409).json({
                    message: 'E-mail exists'
                });
            } else {
                bcrypt.hash(req.body.password, 13, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'User created'
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            }); 
                    }
                })
            }
        });
}

exports.users_login = (req, res, next) => {
    User.find({ email: req.body.email })    //returns array of users
        .exec()
        .then(user => {
            if (user.length < 1) {      //user does not exist
                console.log(user);
                return res.status(401).json({
                    message: 'Auth failed.1'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {      //comparison between body and DB failed
                    return res.status(401).json({
                        message: 'Auth failed.2'
                    });
                }
                if (result) {       //user&pass is good
                    const token = jwt.sign(
                        {
                            email: user[0].email,
                            userId: user[0]._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1h"
                        }
                    )
                    return res.status(200).json({
                        message: 'Auth succeeded.',
                        token: token
                    });
                }
                res.status(401).json({  //bad pass
                    message: 'Auth Failed.3'
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.users_delete_user = (req, res, next) => {
    User.findByIdAndDelete({_id: req.params.userId})
        .exec()
        .then(result => {
            console.log('DELETE: ' + result);
            res.status(200).json({
                message: 'User deleted'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}