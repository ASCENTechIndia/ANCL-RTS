const express = require("express");
const router = express.Router();

const controller = require("./FrmBombayNursing.controller");

router.post("/get-service-list", controller.getServiceListController);

router.post("/get-ward-list", controller.getWardListController);

router.post("/insert-nursing-application", controller.insertNursingController);

module.exports = router;
