import "./App.css";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Login from "./Pages/Login/UserID.Login";
import OTPLogin from "./Pages/Login/OTP.Login";
import Registration from "./Pages/Login/Registration";
import ForgotPassword from "./Pages/Login/ForgotPassword";
import LandingPage from "./Pages/LandingPage";
import Layout from "./layout/main-layout";
import PageLayout from "./layout/page-layout";
import Watermodule from "./Pages/WaterModule/WaterbillCopy/Step0New";
import FrmPropertyAppel from "./Pages/Property/FrmPropertyAppel";
import FrmRebateTax from "./Pages/Property/FrmRebateTax";
import FrmNoDuesCerti from "./Pages/Property/FrmNoDuesCerti";
import FrmAssessmentCerti from "./Pages/Property/FrmAssessmentCerti";
import FrmPropertyTransfer from "./Pages/Property/FrmPropertyTransfer";
import FrmNewTaxAssesment from "./Pages/Property/FrmNewTaxAssesment";
import FrmMarketEntry from "./Pages/Trade/FrmMarketEntry/FrmMarketEntry";
import FrmWaterRegister from "./Pages/WaterModule/FrmWaterRegister";
import FrmPlumberLicense from "./Pages/WaterModule/FrmPlumberLicense";
import FrmTrackApplication from "./Pages/FrmTrackApplication/FrmTrackApplication";
import FrmAppeal from "./Pages/FrmTrackApplication/FrmAppeal";
import FrmAppliFee from "./Pages/FrmTrackApplication/FrmAppliFee";
import FrmMarketLicenseupdt from "./Pages/Trade/FrmMarketLicenseupdt";
import FrmServiceApplicationMst from "./Pages/SolidHealth/FrmServiceApplicationMst";
import FrmAfterTransactionTMC from "./Pages/FrmTrackApplication/FrmAfterTransactionTMC";
import FrmFirstAppeal from "./Pages/FrmFirstAppeal";
import FrmFirstAppealDocUpload from "./Pages/FrmFirstAppealDocUpload";
import FrmMarketLicenseUpdt from "./Pages/Trade/FrmMarketLicenseupdt";
import FrmMarriageRgstn from "./Pages/Marriage/FrmMarriageRgstn";
import FrmServiceApplicationMstNew from "./Pages/PWD/FrmServiceApplicationMstNew";
import FrmAppoints from "./Pages/Marriage/FrmAppoints";
import FrmRoadCutting from "./Pages/PWD/FrmRoadCutting";
import Step0 from "./Pages/TownPlanning/Step0";
import FrmWaterAppliEntry from "./Pages/WaterModule/FrmWaterAppliEntry";
import FrmWaterAppliDetails from "./Pages/WaterModule/FrmWaterAppliDetails";
import FrmEmpLogin from "./Pages/Login/FrmEmpLogin";
import AdminLayout from "./layout/admin-layout";
import FrmAppAuthorisationList from "./Pages/Admin/FrmAppAuthorisationList";
import FrmAppAuthorisationMst from "./Pages/Admin/FrmAppAuthorisationMst";
import FrmDocList from "./Pages/Admin/FrmDocList";
import FrmDocMst from "./Pages/Admin/FrmDocMst";
import FrmServiceDocConfig from "./Pages/Admin/FrmServiceDocConfig";
import FrmRTSOnlineColl from "./Pages/Admin/FrmRTSOnlineColl";
import FrmRTSOnlineCollDetails from "./Pages/Admin/FrmRTSOnlineCollDetails";
import FrmTradeCtgryTypeCnfgList from "./Pages/Admin/FrmTradeCtgryTypeCnfgList";
import FrmTradeCtgryTypeCnfgMst from "./Pages/Admin/FrmTradeCtgryTypeCnfgMst";
import FrmHolidayMst from "./Pages/Admin/FrmHolidayMst";
import FrmTownPlanningSectorMapping from "./Pages/Admin/FrmTownPlanningSectorMapping";
import FrmTradeCategoryConfigMst from "./Pages/Admin/FrmTradeCategoryConfigMst";
import FrmTradeCategoryConfigList from "./Pages/Admin/FrmTradeCategoryConfigList";
import FrmMappingConfig from "./Pages/Admin/FrmMappingConfig/FrmMappingConfig";
import FrmDeptMappingConfig from "./Pages/Admin/FrmDeptMappingConfig/FrmDeptMappingConfig";
import FrmTradeCtgMst from "./Pages/Admin/FrmTradeCtgList/FrmTradeCtgMst";
import FrmTradeCtgryList from "./Pages/Admin/FrmTradeCtgList/FrmTradeCtgList";
import FrmDashboardAll from "./Pages/Admin/FrmDashboardAll";
import FrmTradeCtgrytypList from "./Pages/Admin/FrmTradeCtgrytypList";
import FrmTradeCtgryTypMst from "./Pages/Admin/FrmTradeCtgryTypMst";
import FrmFirstAppealAuthoRpt from "./Pages/Admin/FrmFirstAppealAuthoRpt";
import FrmSecondAppealAutoRpt from "./Pages/Admin/FrmSecondAppealAutoRpt";
import FrmChallanGenReport from "./Pages/Admin/FrmChallanGenReport";
import FrmAppliReportEMst from "./Pages/Admin/FrmAppliReportEMst";
import FrmHearingProccess from "./Pages/Admin/FrmHearingProccess";
import FrmAppealHearing_New from "./Pages/Admin/FrmAppealHearing_New";
import FrmHearingDateAssign from "./Pages/Admin/FrmHearingDateAssign";
import FrmMeatShopNOC from "./Pages/NOC/FrmMeatShopNOC";
import FrmNOCService from "././Pages/NOC/FrmNOCService";
import FrmNOMNoc from "./Pages/NOC/FrmNOMNoc";
import FrmNOCHordingType from "./Pages/Admin/FrmNOCHordingTypeList";
import FrmBusinessTypeList from "./Pages/Admin/FrmBusinessTypeList";
import FrmBusinessTypeMst from "./Pages/Admin/FrmBusinessTypeMst";
import FrmNOCHordingTypeList from "./Pages/Admin/FrmNOCHordingTypeList";
import FrmNOCHordingTypeMst from "./Pages/Admin/FrmNOCHordingTypeMst";
import FrmNOCHordingSubTypeList from "./Pages/Admin/FrmNOCHordingSubTypeList";
import FrmNOCHordingSubTypeMst from "./Pages/Admin/FrmNOCHordingSubTypeMst";
import FrmLicenseTypeList from "./Pages/Admin/FrmLicenseTypeList";
import FrmLicenseTypeMst from "./Pages/Admin/FrmLicenseTypeMst";      
import FrmNocRoadType from "./Pages/Admin/FrmNocRoadType";
import FrmNocRoadTypeMst from "./Pages/Admin/FrmNocRoadTypeMst";


function HomePage() {
  return <div>Welcome to Employee Portal</div>;
}

const router = createBrowserRouter([
  {
    path: "app/frmEmpLogin",
    element: <FrmEmpLogin />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
    ],
  },
  {
    path: "/",
    element: <PageLayout allowPublic={true} />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/otp-login",
        element: <OTPLogin />,
      },
      {
        path: "/registration",
        element: <Registration />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/App/FrmAfterTransactionTMC",
        element: <FrmAfterTransactionTMC />,
      },
    ],
  },
  {
    path: "/",
    element: <PageLayout />,
    children: [
      {
        path: "app/FrmTrackApplication",
        element: <FrmTrackApplication />,
      },
      {
        path: "/FrmAppeal",
        element: <FrmAppeal />,
      },
      {
        path: "/FrmAppliFee",
        element: <FrmAppliFee />,
      },

      {
        path: "/Step0New",
        element: <Watermodule />,
      },
      {
        path: "/FrmWaterRegister",
        element: <FrmWaterRegister />,
      },
      {
        path: "/FrmPlumberLicense",
        element: <FrmPlumberLicense />,
      },
      {
        path: "/FrmAssessmentCerti",
        element: <FrmAssessmentCerti />,
      },
      {
        path: "/FrmPropertyTransfer",
        element: <FrmPropertyTransfer />,
      },
      {
        path: "/FrmNewTaxAssesment",
        element: <FrmNewTaxAssesment />,
      },
      {
        path: "/FrmNoDuesCerti",
        element: <FrmNoDuesCerti />,
      },
      {
        path: "/FrmRebateTax",
        element: <FrmRebateTax />,
      },
      {
        path: "/FrmPropertyAppel",
        element: <FrmPropertyAppel />,
      },
      {
        path: "/FrmMarketEntry",
        element: <FrmMarketEntry />,
      },
      {
        path: "/FrmMarketLicenseupdt",
        element: <FrmMarketLicenseUpdt />,
      },
      {
        path: "/FrmFirstAppealDocUpload",
        element: <FrmFirstAppealDocUpload />,
      },
      {
        path: "/FrmFirstAppeal",
        element: <FrmFirstAppeal />,
      },
      // {
      //   path: "/FrmSecondAppeal",
      //   element: <FrmSecondAppeal />,
      // },
      {
        path: "/FrmMarriageRgstn",
        element: <FrmMarriageRgstn />,
      },
      {
        path: "/FrmServiceApplicationMst",
        element: <FrmServiceApplicationMst />,
      },
      {
        path: "/FrmServiceApplicationMstNew",
        element: <FrmServiceApplicationMstNew />,
      },
      {
        path: "/FrmAppoints",
        element: <FrmAppoints />,
      },
      {
        path: "/FrmRoadCutting",
        element: <FrmRoadCutting />,
      },
      {
        path: "/Step0",
        element: <Step0 />,
      },
      {
        path: "/FrmWaterAppliEntry",
        element: <FrmWaterAppliEntry />,
      },
      {
        path: "/FrmWaterAppliDetails",
        element: <FrmWaterAppliDetails />,
      },
      // {
      //   path: "/App/FrmToursTravel",
      //   element: <FrmToursTravels />,
      // },
      {
        path: "/FrmMeatShopNOC",
        element: <FrmMeatShopNOC />
      },
      {
        path: "/FrmNOCService",
        element: <FrmNOCService />
      }
    ],
  },
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      {
        path: "/home",
        element: <HomePage />,
      },
      {
        path: "/FrmAppAuthorisationList",
        element: <FrmAppAuthorisationList />,
      },
      {
        path: "/FrmAppAuthorisationMst",
        element: <FrmAppAuthorisationMst />,
      },
      {
        path: "/MASTER/FrmDocList",
        element: <FrmDocList />
      },
      {
        path: "/MASTER/FrmDocMst",
        element: <FrmDocMst />
      },
      {
        path: "/FrmServiceDocConfig",
        element: <FrmServiceDocConfig />
      },
      {
        path: "/Reports/FrmRTSOnlineColl",
        element: <FrmRTSOnlineColl />,
      },
      {
        path: "/Reports/FrmRTSOnlineCollDetails",
        element: <FrmRTSOnlineCollDetails />,
      },
      {
        path: "/FrmTradeCtgryTypeCnfgList",
        element: <FrmTradeCtgryTypeCnfgList />,
      },
      {
        path: "/FrmTradeCtgryTypeCnfgMst",
        element: <FrmTradeCtgryTypeCnfgMst />,
      },
      {
        path: "/FrmHolidayMst",
        element: <FrmHolidayMst />,
      },
      {
        path: "/FrmPwdSectorMapingConfg",
        element: <FrmTownPlanningSectorMapping />,
      },
      {
        path: "/FrmTradeCtgryCnfgList",
        element: <FrmTradeCategoryConfigList />,
      },
      {
        path: "/FrmTradeCategoryConfigMst",
        element: <FrmTradeCategoryConfigMst />,
      },
      {
        path: "/FrmMappingConfig",
        element: <FrmMappingConfig />,
      },

      {
        path: "/FrmDeptMappingConfig",
        element: <FrmDeptMappingConfig />,
      },
      {
        path: "/FrmTradeCtgryList",
        element: <FrmTradeCtgryList />,
      },
      {
        path: "/Masters/FrmTradeCtgMst",
        element: <FrmTradeCtgMst />,
      },
      {
        path: "/FrmDashboardAll",
        element: <FrmDashboardAll />,
      },
      {
        path: "/FrmTradeCtgrytypList",
        element: <FrmTradeCtgrytypList />,
      },
      {
        path: "/FrmTradeCtgryTypMst",
        element: <FrmTradeCtgryTypMst />,
      },
      {
        path: "/FrmFirstAppealAuthoRpt",
        element: <FrmFirstAppealAuthoRpt />,
      },
      {
        path: "/FrmSecondAppealAutoRpt",
        element: <FrmSecondAppealAutoRpt />,
      },
      {
        path: "/Reports/FrmChallanGenReport",
        element: <FrmChallanGenReport />
      },
      {
        path: "/Reports/FrmAppliReportEMst",
        element: <FrmAppliReportEMst />
      },
      {
        path: "/FrmHearingProccess",
        element: <FrmHearingProccess />
      },
      {
        path: "/FrmAppealHearing_New",
        element: <FrmAppealHearing_New />
      },
      {
        path: "/FrmHearingDateAssign",
        element: <FrmHearingDateAssign />
      },
      {
        path: "/FrmNOCService",
        element: <FrmNOMNoc />
      },
      {
        path: "/FrmNOCHordingType",
        element: <FrmNOCHordingType />
      },
      {
        path: "/FrmNocRoadType",
        element: <FrmNocRoadType />,
      },
      {
        path: "/FrmNocRoadTypeMst",
        element: <FrmNocRoadTypeMst />,
      },
      {
        path:"/FrmBusinessTypeList",
        element:<FrmBusinessTypeList />
      },
         {
        path:"/FrmBusinessTypeMst",
        element:<FrmBusinessTypeMst />
      },
      {
        path:"/FrmNOCHordingTypeList",
        element:<FrmNOCHordingTypeList />
      },
      {
        path:"/FrmNOCHordingTypeMst",
        element:<FrmNOCHordingTypeMst />
      },
      {
        path:"/FrmNOCHordingSubTypeList",
        element:<FrmNOCHordingSubTypeList />
      },
      {
        path:"/FrmNOCHordingSubTypeMst",
        element:<FrmNOCHordingSubTypeMst />
      },     
      {
        path: "/FrmLicenseTypeList",
        element: <FrmLicenseTypeList />
      },
      {
        path: "/FrmLicenseTypeMst",
        element: <FrmLicenseTypeMst />
      },
      {
        path: "/FrmNocRoadType",
        element: <FrmNocRoadType />,
      },
      {
        path: "/FrmNocRoadTypeMst",
        element: <FrmNocRoadTypeMst />,
      },
    ]
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
