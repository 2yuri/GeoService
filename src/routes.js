const express = require("express");
const { LocationController, BatchController } = require("./controllers");

const routes = express.Router();

routes.post("/address", LocationController.captureLocation);
routes.post("/bath", BatchController.captureBatch);

module.exports = routes;
