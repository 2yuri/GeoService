const express = require("express");
const { LocationController, BathController } = require("./controllers");

const routes = express.Router();

routes.post("/address", LocationController.captureLocation);
routes.post("/bath", BathController.captureBath);

module.exports = routes;
