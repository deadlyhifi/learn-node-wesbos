const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));

router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));
router.get('/store/:id/edit', catchErrors(storeController.editStore));

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.get('/register', userController.registerForm);
router.post(
    '/register',
    userController.validateRegister,
    userController.register,
    authController.login
);

// Auth Routes
router.get(
    '/add',
    authController.isLoggedIn,
    storeController.addStore
);
router.post(
    '/add',
    authController.isLoggedIn,
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.createStore)
);
// Edit
router.post(
    '/add/:id',
    authController.isLoggedIn,
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.updateStore)
);

router.get('/account', authController.isLoggedIn, userController.account);
router.post(
    '/account',
    authController.isLoggedIn,
    catchErrors(userController.updateAccount)
);

router.post('/account/forgot', authController.forgotPassword);

router.get('/account/reset/:token', authController.resetPassword);
router.post(
    '/account/reset/:token',
    authController.confirmPasswords,
    catchErrors(authController.updatePassword)
);

module.exports = router;
