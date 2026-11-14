const express = require("express");
const router = express.Router();

const controller = require("./FrmAfterTransactionTMC.controller");
const auth = require("../../../middlewares/auth.middleware");

router.post("/paymentacknowledgement",auth(), controller.generatePaymentAcknowledgement);

module.exports = router;
