const express = require("express");
const router = express.Router();

const controller = require("./FrmAfterTransactionTMC.controller");
const auth = require("../../../middlewares/auth.middleware");

router.post("/paymentacknowledgement",controller.generatePaymentAcknowledgement);

module.exports = router;
