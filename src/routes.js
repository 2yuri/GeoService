const express = require("express");
const { LocationController } = require("./controllers");

const routes = express.Router();

routes.post("/address", LocationController.captureLocation);

module.exports = routes;
