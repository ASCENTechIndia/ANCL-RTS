// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { NODE_ENV } = require("./config/env");
const errorMiddleware = require("./middlewares/error.middleware");
const { rateLimitMiddleware } = require("./middlewares/rateLimit.middleware");
const requestLogger = require("./middlewares/requestLogger.middleware");
const authRoutes = require("./modules/auth/auth.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const healthRoutes = require("./routes/health.routes");
const path = require("path");
const { paymentResponseController } = require("./modules/TrackApplication/FrmAfterTransactionTMC/FrmAfterTransactionTMC.controller");

const app = express();

// trust proxy (important for rate-limit & IP)
app.set("trust proxy", 1);

// security & parsing
// app.use(cors({ origin: NODE_ENV === "production" ? ["https://yourdomain.com"] : "*", credentials: true }));
const allowedOrigins = [
  "https://karjatrts.nagarkaryavalinewuat.com", 

  "http://localhost:5173"];

app.post(
    "/api/payment-response",
    express.urlencoded({extended: true}),
    paymentResponseController
);


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);
app.use(cookieParser());
app.use(helmet({ contentSecurityPolicy: false }));

// logging
if (NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use("/pdf", express.static(path.join(__dirname, "../public/pdf")));

// health first (no rate limit)
app.use("/api", healthRoutes);

// global limiter
app.use(rateLimitMiddleware());

// root
app.get("/", (req, res) => res.send("API Running ✅"));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

//Dashboard
app.use("/api/Dashboard", require("./modules/Dashboard/Dashboard.route"));

// Property
app.use("/api/FrmAssessmentCerti", require("./modules/Property/FrmAssessmentCerti/FrmAssessmentCerti.routes"));
app.use("/api/FrmPropertyTransfer", require("./modules/Property/FrmPropertyTransfer/FrmPropertyTransfer.routes"));
app.use("/api/FrmRebateTax", require("./modules/Property/FrmRebateTax/FrmRebateTax.routes"));
app.use("/api/FrmNoDuesCerti", require("./modules/Property/FrmNoDuesCerti/FrmNoDuesCerti.routes"));
app.use("/api/FrmNewTaxAssesment", require("./modules/Property/FrmNewTaxAssesment/FrmNewTaxAssesment.route"));
app.use("/api/FrmPropertyAppel", require("./modules/Property/FrmPropertyAppel/FrmPropertyAppel.route"));
app.use("/api/FrmAfterTransactionTMC", require("./modules/Property/FrmAfterTransactionTMC/FrmAfterTransactionTMC.routes"))

//Water module 
app.use("/api/watermodule", require("./modules/WaterModule/WaterBillCopy/Stepnew.route"))
app.use("/api/FrmWaterRegister", require("./modules/WaterModule/FrmWaterRegister/FrmWaterRegister.route"))
app.use("/api/FrmPlumberLicense", require("./modules/WaterModule/FrmPlumberLicense/FrmPlumberLicense.route"))
app.use("/api/FrmWaterAppliEntry", require("./modules/WaterModule/FrmWaterAppliEntry/FrmWaterAppliEntry.routes"));
app.use("/api/FrmWaterAppliDetails", require("./modules/WaterModule/FrmWaterAppliDetails/FrmWaterAppliDetails.route"))

//Trade
app.use("/api/FrmMarketEntry", require("./modules/Trade/FrmMarketEntry/FrmMarketEntry.routes"));
app.use("/api/FrmMarketLicenseupdt", require("./modules/Trade/FrmMarketLicenseupdt/FrmMarketLicenseupdt.route"));

//TrackApplication
app.use("/api/FrmTrackApplication", require("./modules/TrackApplication/FrmTrackApplication/FrmTrackApplication.routes"));
app.use("/api/FrmAppeal", require("./modules/TrackApplication/FrmAppeal/FrmAppeal.route"));
app.use("/api/FrmAppliFee", require("./modules/TrackApplication/FrmAppliFee/FrmAppliFee.route"));
app.use("/api/FrmAppFrmAfterTransactionTMCliFee", require("./modules/TrackApplication/FrmAfterTransactionTMC/FrmAfterTransactionTMC.route"));
app.use("/api/FrmFirstAppealDocUpload", require("./modules/FrmFirstAppealDocUpload/FrmFirstAppealDocUpload.route"));

//Solid Health

app.use("/api/FrmServiceApplicationMst", require("./modules/SolidHealth/FrmServiceApplicationMst/FrmServiceApplicationMst.routes"))

// Marriage
app.use("/api/FrmMarriageRgstn", require("./modules/Marriage/FrmMarriageRgstn/FrmMarriageRgstn.routes"));
app.use("/api/FrmAppoints", require("./modules/Marriage/FrmAppoints/FrmAppoints.route"));


// PWD
app.use("/api/FrmRoadCutting", require("./modules/PWD/FrmRoadCutting.route"));



//AdminDepartmet
app.use("/api/FrmMappingConfig", require("./modules/AdminDepartment/FrmMappingConfig/FrmMappingConfig.route"));
app.use("/api/FrmDeptMappingConfig", require("./modules/AdminDepartment/FrmDeptMappingConfig/FrmDeptMappingConfig.route"));
app.use("/api/Doclist",require("./modules/AdminDepartment/FrmDocList/frmDocList.routes"));
app.use("/api/Tradetypeconfig", require("./modules/AdminDepartment/FrmTradeCtgryTypeCnfgList/frmTradeCtgryTypeCnfgList.routes"))
app.use("/api/Holiday", require("./modules/AdminDepartment/FrmHolidayMst/FrmHolidayMst.route"));
app.use("/api/FrmTradeCategoryConfig", require("./modules/AdminDepartment/FrmTradeCategoryConfigList/frmTradeCategoryConfig.routes"));
app.use("/api/frmAppAuth", require("./modules/AdminDepartment/FrmAppAuth/frmAppAuth.routes"));
app.use("/api/Doclist",require("./modules/AdminDepartment/FrmDocList/frmDocList.routes"))
app.use("/api/FrmRTSOnlineColl", require("./modules/AdminDepartment/FrmRTSOnlineColl/FrmRTSOnlineColl.route"));
app.use("/api/FrmDashboardAll", require("./modules/AdminDepartment/FrmDashboardAll/FrmDashboardAll.routes"))
app.use("/api/FrmTradeCtgrytypListMst", require("./modules/AdminDepartment/FrmTradeCtgrytypListMst/FrmTradeCtgrytypListMst.route"));
app.use("/api/FrmFirstAppealAuthoRpt", require("./modules/AdminDepartment/FrmFirstAppealAuthoRpt/FrmFirstAppealAuthoRpt.route"));
app.use("/api/FrmSecondAppealAutoRpt", require("./modules/AdminDepartment/FrmSecondAppealAutoRpt/FrmSecondAppealAutoRpt.route"));
app.use("/api/FrmChallanGenReport", require("./modules/AdminDepartment/FrmChallanGenReport/FrmChallanGenReport.routes"));
app.use("/api/FrmTownPlanningSectorMapping", require("./modules/AdminDepartment/FrmTownPlanningSectorMapping/frmTownPlanningSectorMapping.routes"));
app.use("/api/FrmAppliReportEMst", require("./modules/AdminDepartment/FrmAppliReportEMst/frmAppliReportEMst.routes"));
app.use("/api/FrmHearingProccess", require("./modules/AdminDepartment/FrmHearingProccess/FrmHearingProccess.routes"));
app.use("/api/FrmHearingDateAssign", require("./modules/AdminDepartment/FrmHearingDateAssign/FrmHearingDateAssign.routes"))
app.use("/api/FrmNOCHordingType", require("./modules/AdminDepartment/FrmNOCHordingType/FrmNOCHordingType.routes"))

// NOC
app.use("/api/FrmToursTravels", require("./modules/NOC/FrmToursTravels/FrmToursTravels.routes"));
app.use("/api/FrmMandapStall", require("./modules/NOC/FrmNOMNoc/FrmMandapStall.route"));
app.use("/api/FrmElectrical", require("./modules/NOC/FrmElectrical/FrmElectrical.route"));
app.use("/api/FrmMeatShopNOC", require("./modules/NOC/FrmMeatShopNOC/FrmMeatShopNOC.route"));
app.use("/api/FrmHospitalParvana", require("./modules/AdminDepartment/FrmHospitalParvana/frmHospitalParvana.routes"));
app.use("/api/FrmHospitalNOC", require("./modules/NOC/NOCPdf/frmHospitalNOC.route"));
app.use("/api/FrmBusinessTypeListMst", require("./modules/AdminDepartment/FrmBusinessTypeListMst/FrmBusinessTypeListMst.routes"))
app.use("/api/FrmNOCHordingType", require("./modules/AdminDepartment/FrmNOCHordingType/FrmNOCHordingType.routes"))
app.use("/api/FrmNOCHordingSubType", require("./modules/AdminDepartment/FrmNOCHordingSubType/FrmNOCHordingSubType.routes"));
app.use("/api/FrmLicenseType", require("./modules/AdminDepartment/FrmLicenseTypeList/FrmLicenseTypeList.route"));
app.use("/api/FrmNocRoadType",    require("./modules/AdminDepartment/FrmRoadType/frmNocRoadType.routes"));

app.use(errorMiddleware);

module.exports = app;