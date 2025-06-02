const express = require("express");
const UserController = require('../../app/http/Controller/UserController');
const user = require('../../app/http/Middleware/AppMiddleWare');
const auth = require('../../app/http/Middleware/AuthMiddleWare');
const DiffusionController = require("../../app/http/Controller/DiffusionController");
const route = express.Router();

//user routes
route.get('/user', UserController.getUsers);
route.post('/user', auth, UserController.crateUser);
route.get('/user/:id', [auth, user], UserController.getUser);
route.patch('/user/:id', [auth, user], UserController.updateUser);
route.delete('/user/:id', [auth, user], UserController.deleteUser);

// diffusion routes
route.get('/diffusion/join-room/:diffid', DiffusionController.joinRoom);
route.post('/diffusion/create', DiffusionController.createDiffusion);

module.exports = route