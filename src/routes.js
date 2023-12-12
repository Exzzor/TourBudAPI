const express = require('express');
const { requireAuthMember } = require('./middlewares');

const {
    getAllMember,
    signupPost,
    login,
    logout,
} = require('./handler');

const routes = express.Router();

routes.get('/getmembers',  getAllMember);
routes.post('/singup', signupPost);

routes.post('/login', login);

routes.post('/logout', logout);

module.exports = routes;
