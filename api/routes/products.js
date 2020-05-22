const express = require('express');
const router = express.Router();    //express creates router
const multer = require('multer');   //for parsing image uploads from form body

const prodCtrlr = require('../controllers/products');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    //reject file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5                   //1mb * 5 = 5mb
    },
    fileFilter: fileFilter
});

const Product = require('../models/product');

router.get('/', prodCtrlr.products_get_all);

router.post('/', checkAuth, upload.single('productImage'), prodCtrlr.products_create_product);

router.get('/:productId', prodCtrlr.products_get_product);

router.patch('/:productId', checkAuth, prodCtrlr.products_update_product);

router.delete('/:productId', checkAuth, prodCtrlr.products_delete_product);

module.exports = router;