const express = require('express');
const router = express.Router();

const ordersCtrlr = require('../controllers/orders');
const checkAuth = require('../middleware/check-auth');

router.get('/', checkAuth, ordersCtrlr.orders_get_all);

router.post('/', checkAuth, ordersCtrlr.orders_create_order);

router.get('/:orderId', checkAuth, ordersCtrlr.orders_get_order);

router.delete('/:orderId', checkAuth, ordersCtrlr.orders_delete_order);

module.exports = router;