const express = require('express');
const router = express.Router();

const userCtrlr = require('../controllers/users');
const checkAuth = require('../middleware/check-auth');

router.post('/signup', userCtrlr.users_signup);

router.post('/login', userCtrlr.users_login);

router.delete('/:userId', checkAuth, userCtrlr.users_delete_user);

module.exports = router;