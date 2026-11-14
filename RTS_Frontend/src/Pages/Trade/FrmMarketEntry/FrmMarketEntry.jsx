import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Formik, Form } from "formik";
import { useAuth } from "@/context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Checkbox } from "@/components/ui/checkbox";
import getIPAddress from "@/utils/ipHelper";
import config from "@/utils/config";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const validateEmail = (email) => {
  const value = email?.trim() || "";

  if (!value) return true;

  return /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i.test(
    value,
  );
};
const initialValues = {
  oldLicenseNo: "",
  tradeBusinessType: "T",

  shopNameEnglish: "",
  shopNameMarathi: "",
  panCardNo: "",
  contactNo: "",
  email: "",
  shopAddress: "",

  wardNo: "",
  zoneNo: "",

  fromDate: "",
  toDate: "",
  financialFromYear: "",
  financialToYear: "",

  usedArea: "0",
  amount: "0",

  jalanShil: "",
  illegalType: "",
  propNo: "",

  tradeCategory: "",
  tradeType: "",
  rate: "",

  businessPlace: "",

  isManufactured: "Y",
  isOwnerDoingBusiness: "Y",

  rentAgreementWithWhom: "",
  corporationNoc: "Y",
  businessStartYear: "0",
  shopActRegistrationNo: "",
  otherAdministrationRegistrationNo: "",

  applicantName: "",
  applicantAddress: "",

  licenseType: "",
  businessNature: "",

  directorAadharNo: "",
  directorName: "",
  directorContactNo: "",
  directorVoterId: "",
  directorEmail: "",
  directorGender: "F",
  directorAddress: "",
  directorApplicantType: "",
  directorImage: null,

  declarationAccepted: false,
};

const FrmMarketEntry = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state || {};

  console.log("locationState", locationState);
  console.log("location", location);

  const ulbId = locationState.ulbId || user?.ulbId;
  const userId = locationState.userId || user?.userId;
  const zoneId = locationState.zoneId || user?.zoneId || "12";
  const corpId = locationState.corpId || user?.corpId;
  const serviceId = locationState.serviceId || user?.serviceId;
  const serviceName = locationState.serviceName;

  const searchParams = new URLSearchParams(window.location.search);

  // const mode = Number(
  //   searchParams.get("mode") ??
  //     searchParams.get("@") ??
  //     locationState.mode ??
  //     1,
  // );

  const explicitMode = Number(
    searchParams.get("mode") ?? searchParams.get("@") ?? locationState.mode ?? 0,
  );

  // const mode =
  //   explicitMode === 2
  //     ? 2 
  //     : explicitMode === 1
  //       ? 1 
  //       : 1;   

  const serviceCodeFromUrl = String(searchParams.get("@") ?? "").trim();

  const [licenseMode, setLicenseMode] = useState(
    serviceCodeFromUrl === "7" ? "N" : "R",
  );

  const [showModeRadio, setShowModeRadio] = useState(
    serviceCodeFromUrl === "",
  );

  useEffect(() => {
    if (serviceCodeFromUrl === "") return;
    setShowModeRadio(false);
  }, [serviceCodeFromUrl]);

  const showOldLicenseInput = licenseMode === "R";

  const mode = licenseMode === "R" ? 2 : 1;

  // const applicationId = locationState.applicationId ??
  //   locationState.appId ??
  //   searchParams.get("applicationId") ??
  //   searchParams.get("appid") ??
  //   sessionStorage.getItem("applicationId") ??
  //   sessionStorage.getItem("appid") ??
  //   "";

  const [activeTab, setActiveTab] = useState("primary");
  const [tradeCategoryOptions, setTradeCategoryOptions] = useState([]);
  const [tradeTypeOptions, setTradeTypeOptions] = useState([]);
  const [tradeTypeRateRows, setTradeTypeRateRows] = useState([]);
  const [documentRows, setDocumentRows] = useState([]);
  const [selfDeclareRows, setSelfDeclareRows] = useState([]);
  const [directorRows, setDirectorRows] = useState([]);

  const [wardOptions, setWardOptions] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [applicantTypeOptions, setApplicantTypeOptions] = useState([]);
  const [businessPlaceOptions, setBusinessPlaceOptions] = useState([]);
  const [jalanShilOptions, setJalanShilOptions] = useState([]);
  const [illegalTypeOptions, setIllegalTypeOptions] = useState([]);
  const [licenseTypeOptions, setLicenseTypeOptions] = useState([]);
  const [applicationId, setApplicationId] = useState("");
  const [applicationNo, setApplicationNo] = useState("");
  const [yearOptions, setYearOptions] = useState([]);
  const [tradeTypeByCategoryOptions, setTradeTypeByCategoryOptions] = useState([]);
  const [tradeCheckboxRows, setTradeCheckboxRows] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const authToken =
    token ||
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    "";

  const getBusinessPlace = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmMarketEntry/getbusinessplace`,
        {},
        { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
      );
      const data = response.data?.data || [];
      setBusinessPlaceOptions(
        data.map((item) => ({
          value: String(item.NUM_BUSIPLACE_ID),
          label: item.VAR_BUSIPLACE_NAME || "",
        })),
      );
    } catch (error) {
      console.error("Business Place Error:", error);
      setBusinessPlaceOptions([]);
    }
  };

  const getJalanShil = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmMarketEntry/getjalanshil`,
        {},
        { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
      );
      const data = response.data?.data || [];
      setJalanShilOptions(
        data.map((item) => ({
          value: String(item.VAR_JALANSHIL_CODE || ""),
          label: item.VAR_JALANSHIL_NAME || "",
        })),
      );
    } catch (error) {
      console.error("Jalan Shil Error:", error);
      setJalanShilOptions([]);
    }
  };

  const getIllegalType = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmMarketEntry/getillegaltype`,
        {},
        { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
      );
      const data = response.data?.data || [];
      setIllegalTypeOptions(
        data.map((item) => ({
          value: String(item.NUM_ILLEGAL_ID),
          label: item.VAR_ILLEGAL_NAME || "",
        })),
      );
    } catch (error) {
      console.error("Illegal Type Error:", error);
      setIllegalTypeOptions([]);
    }
  };

  const getLicenseType = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmMarketEntry/getlicensetype`,
        {},
        { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
      );
      const data = response.data?.data || [];
      setLicenseTypeOptions(
        data.map((item) => ({
          value: String(item.NUM_LICENSETYPE_ID),
          label: item.VAR_LICENSETYPE_NAME || "",
        })),
      );
    } catch (error) {
      console.error("License Type Error:", error);
      setLicenseTypeOptions([]);
    }
  };

  const getApplicantType = async () => {
    if (!ulbId) return;
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmMarketEntry/getapplicanttype`,
        { ulbId },
        { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
      );
      const data = response.data?.data || [];
      setApplicantTypeOptions(
        data.map((item) => ({
          value: String(item.NUM_APPLITYPE_ID),
          label: item.VAR_APPLITYPE_NAME || "",
        })),
      );
    } catch (error) {
      console.error("Applicant Type Error:", error);
      setApplicantTypeOptions([]);
    }
  };

  const getWard = async () => {
    if (!ulbId) return;
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmMarketEntry/getward`,
        { ulbId },
        { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
      );
      const data = response.data?.data || [];
      setWardOptions(
        data.map((item) => ({
          value: String(item.WARDID),
          label: item.WARDNAME || "",
        })),
      );
    } catch (error) {
      console.error("Ward Error:", error);
      setWardOptions([]);
    }
  };

  const getZoneByWard = async (wardId) => {
    if (!wardId || !ulbId) return;
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmMarketEntry/getzonebyward`,
        { wardId, ulbId },
        { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
      );
      const data = response.data?.data || [];
      setZoneOptions(
        data.map((item) => ({
          value: String(item.ZONEID),
          label: item.ZONENAME || "",
        })),
      );
    } catch (error) {
      console.error("Zone Error:", error);
      setZoneOptions([]);
    }
  };

  const loadTradeCategory = async (tradeBusinessType, jalanShil) => {
    const effectiveJalanShil = jalanShil || (mode === 1 ? "Y" : "");

    if (!tradeBusinessType || !effectiveJalanShil) {
      setTradeCategoryOptions([]);
      return [];
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmMarketEntry/gettradecatdropdown`,
        { ulbId },
        { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
      );

      const data = response.data?.data || [];
      setTradeCategoryOptions(
        data.map((item) => ({
          value: String(item.NUM_TRADECATEGORY_ID ?? item.num_tradecategory_id ?? ""),
          label: String(item.VAR_TRADECATEGORY_NAME ?? item.var_tradecategory_name ?? ""),
        })),
      );
      return data;
    } catch (error) {
      console.error("Trade Category Error:", error);
      setTradeCategoryOptions([]);
      return [];
    }
  };

  const getTradeDetails = async () => {
    if (!ulbId) return;
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmMarketEntry/gettradedetails`,
        { ulbId },
        { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
      );
      const data = response.data?.data || [];
      setTradeTypeOptions(
        data.map((item) => ({
          value: String(item.TRADEID),
          label: item.TRADENAME || "",
        })),
      );
      setTradeCheckboxRows(
        data.map((item) => ({
          tradeId: String(item.TRADEID),
          tradeName: item.TRADENAME || "",
          selected: false,
        })),
      );
    } catch (error) {
      console.error("Trade Details Error:", error);
      setTradeTypeOptions([]);
    }
  };

  // const getDocumentDetails = async () => {
  //   if (!ulbId || !serviceId) return;
  //   try {
  //     const response = await axios.post(
  //       `${BASE_URL}/api/FrmMarketEntry/getdocumentdetails`,
  //       { serviceId, ulbId },
  //       { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
  //     );
  //     const data = response.data?.data || [];
  //     setDocumentRows(
  //       data.map((item, index) => ({
  //         id: String(item.DOCID ?? ""),
  //         srNo: index + 1,
  //         docId: String(item.DOCID ?? ""),
  //         documentName: item.DOCTYPENAME ?? "",
  //         documentType: item.DOCTYPE ?? "",
  //         active: item.ACTIVE ?? "N",
  //         file: null,
  //         fileName: "",
  //         remark: "",
  //       })),
  //     );
  //   } catch (error) {
  //     console.error("Document Details Error:", error);
  //     setDocumentRows([]);
  //   }
  // };

  const getDocumentDetails = async () => {
    if (!ulbId) return; 
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmMarketEntry/getdocumentdetailsmarket`,
        { ulbId },
        { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
      );
      const data = response.data?.data || [];
      setDocumentRows(
        data.map((item, index) => ({
          id: String(item.DOCID ?? item.docid ?? ""),
          srNo: index + 1,
          docId: String(item.DOCID ?? item.docid ?? ""),
          documentName: item.DOCTYPENAME ?? item.doctypename ?? "",
          documentType: "",
          active: "Y", 
          file: null,
          fileName: "",
          remark: "",
        })),
      );
    } catch (error) {
      console.error("Document Details Error:", error);
      setDocumentRows([]);
    }
  };

  const getSelfDeclare = async () => {
    if (!serviceId) {
      setSelfDeclareRows([]);
      return;
    }
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmMarketEntry/getselfdeclaredata`,
        { serviceId: Number(serviceId) },
        { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
      );
      const data = response.data?.data || [];
      setSelfDeclareRows(
        data.map((item) => ({
          id: String(item.ID ?? ""),
          message: item.MESSAGE ?? "",
        })),
      );
    } catch (error) {
      console.error("Self Declare Error:", error);
      setSelfDeclareRows([]);
    }
  };

  const getApplicationDetails = async (appId) => {
    if (!appId || !ulbId) return null;
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmMarketEntry/getapplicationdetails`,
        { applicationId: Number(appId), ulbId },
        { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
      );
      return response.data?.data || null;
    } catch (error) {
      console.error("Application Details Error:", error);
      return null;
    }
  };

  const getExistingLicenseDetails = async (oldLicenseNo) => {
    if (!oldLicenseNo || !ulbId) return null;
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmMarketEntry/getexistinglicensedetails`,
        { oldLicencNo: oldLicenseNo, ulbId },
        { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
      );
      return response.data?.data || null;
    } catch (error) {
      console.error("Existing License Error:", error);
      return null;
    }
  };

  const checkLicenseCancelled = async (oldLicenseNo) => {
    if (!oldLicenseNo) return false;
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmMarketEntry/checklicensecancelled`,
        { oldLicencNo: oldLicenseNo },
        { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
      );
      return response.data?.cancelled || false;
    } catch (error) {
      console.error("Check License Cancelled Error:", error);
      return false;
    }
  };

  const getYears = async (setFieldValue) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmMarketEntry/getyears`,
        {},
        { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
      );
      const data = response.data?.data || [];
      const opts = data.map((item) => ({
        value: String(item.YRS ?? item.yrs ?? ""),
        label: String(item.YEARS ?? item.years ?? ""),
      }));
      setYearOptions(opts);

      if (opts.length > 0 && setFieldValue) {
        const currentYear = new Date().getFullYear();
        const currentFrmYear = opts.find(y => y.value === String(currentYear));
        if (currentFrmYear) setFieldValue("financialFromYear", currentFrmYear.value);
        
        const nextYear = opts.find(y => y.value === String(currentYear + 1));
        if (nextYear) setFieldValue("financialToYear", nextYear.value);
      }
    } catch (error) {
      console.error("Years Error:", error);
      setYearOptions([]);
    }
  };

  const getTradeTypeByCategory = async (tradeCategoryId) => {
    if (!tradeCategoryId || !ulbId) return;
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmMarketEntry/gettradetypebycategory`,
        { tradeCategoryId, ulbId },
        { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
      );
      const data = response.data?.data || [];
      setTradeTypeByCategoryOptions(
        data.map((item) => ({
          value: String(item.TRADETYPEID ?? item.tradetypeid ?? ""),
          label: String(item.TRADETYPE ?? item.tradetype ?? ""),
        })),
      );
    } catch (error) {
      console.error("Trade Type By Category Error:", error);
      setTradeTypeByCategoryOptions([]);
    }
  };

  const getRateByTradeType = async (tradeTypeId, tradeCategoryId) => {
    if (!tradeTypeId || !tradeCategoryId || !ulbId) return "";
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmMarketEntry/getratebytratype`,
        { tradeTypeId, tradeCategoryId, ulbId },
        { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
      );
      const rows = response.data?.data || [];
      return rows[0]?.NUM_RATE_RATE ?? rows[0]?.num_rate_rate ?? "";
    } catch (error) {
      console.error("Rate By Trade Type Error:", error);
      return "";
    }
  };

  useEffect(() => {
    if (!ulbId || !serviceId) {
      console.warn("Missing ULB or Service ID", { ulbId, serviceId });
      return;
    }

    const loadData = async () => {
      Swal.fire({
        title: "Loading...",
        text: "Loading Market Entry details",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        await Promise.allSettled([
          getBusinessPlace(),
          getJalanShil(),
          getIllegalType(),
          getLicenseType(),
          getApplicantType(),
          getWard(),
          getTradeDetails(),
          getDocumentDetails(),
          getSelfDeclare(),
          getYears(),
        ]);

        // if (mode === 1) {
          // await loadTradeCategory("62", "Y");
        // }

        await loadTradeCategory("T", "Y");

        // if (mode === 2 && applicationId) {
        //   const appData = await getApplicationDetails(applicationId);
        //   if (appData?.application) {
        //     const app = appData.application;
        //     setApplicationId(String(app.NUM_APPLI_ID || ""));
        //     setApplicationNo(String(app.VAR_APPLI_APPLINO || ""));
        //   }
        // }
      } finally {
        Swal.close();
      }
    };

    loadData();
  }, [ulbId, serviceId, mode]);

  const handleWardChange = async (wardId, setFieldValue) => {
    setFieldValue("wardNo", wardId);
    await getZoneByWard(wardId);
  };

  const handleJalanShilChange = async (value, setFieldValue, values) => {
    setFieldValue("jalanShil", value);
    setFieldValue("tradeCategory", "");
    setFieldValue("tradeType", "");
    await loadTradeCategory(values.tradeBusinessType || "T", value);
  };

  const handleTradeCategoryChange = async (value, setFieldValue) => {
    setFieldValue("tradeCategory", value);
    setFieldValue("tradeType", "");
    setFieldValue("rate", "");
    await getTradeTypeByCategory(value);
  };

  const handleTradeBusinessTypeChange = async (
    value,
    setFieldValue,
    values,
  ) => {
    setFieldValue("tradeBusinessType", value);
    setFieldValue("tradeCategory", "");
    setFieldValue("tradeType", "");

    const effectiveJalanShil = values.jalanShil || (mode === 1 ? "Y" : "");
    if (effectiveJalanShil) {
      await loadTradeCategory(value, effectiveJalanShil);
    }
  };

  const addTradeType = async (values, setFieldValue) => {
    if (!values.tradeCategory) {
      Swal.fire({ text: "Please select Trade Category" });
      return;
    }
    if (!values.tradeType) {
      Swal.fire({ text: "Please select Trade Type" });
      return;
    }

    const alreadyExists = tradeTypeRateRows.some(
      (item) => String(item.tradeTypeId) === String(values.tradeType),
    );

    if (alreadyExists) {
      Swal.fire({ text: "Trade Type already added." });
      return;
    }

    const category = tradeCategoryOptions.find(
      (item) => String(item.value) === String(values.tradeCategory),
    );

    const tradeType = tradeTypeByCategoryOptions.find(
      (item) => String(item.value) === String(values.tradeType),
    );

    const rate = values.rate || "0";

    const newRow = {
      id: Date.now(),
      tradeTypeId: values.tradeType,
      tradeType: tradeType?.label || "",
      tradeCategoryId: values.tradeCategory,
      tradeCategory: category?.label || "",
      rate,
    };

    const nextRows = [...tradeTypeRateRows, newRow];
    setTradeTypeRateRows(nextRows);

    const totalAmount = nextRows.reduce(
      (sum, item) => sum + Number(item.rate || 0),
      0,
    );
    setFieldValue("amount", String(totalAmount));

    setFieldValue("tradeType", "");
    setFieldValue("rate", "");
  };

  const removeTradeType = (id, setFieldValue) => {
    setTradeTypeRateRows((prev) => {
      const next = prev.filter((item) => item.id !== id);
      const totalAmount = next.reduce(
        (sum, item) => sum + Number(item.rate || 0),
        0,
      );
      setFieldValue("amount", String(totalAmount));
      return next;
    });
  };

  const addDirector = (values, setFieldValue) => {
    if (!values.directorName) {
      Swal.fire({ text: "Please enter Director Name." });
      return;
    }
    if (!values.directorContactNo) {
      Swal.fire({ text: "Please enter Mobile No." });
      return;
    }
    if (!values.directorAddress) {
      Swal.fire({ text: "Please enter Address." });
      return;
    }
    if (!values.directorApplicantType) {
      Swal.fire({ text: "Please select Applicant Type." });
      return;
    }

    const applicantType = applicantTypeOptions.find(
      (item) => String(item.value) === String(values.directorApplicantType),
    );

    const nextId = directorRows.length + 1;

    setDirectorRows((prev) => [
      ...prev,
      {
        id: nextId,
        aadharNo: values.directorAadharNo || "",
        directorName: values.directorName,
        mobileNo: values.directorContactNo,
        voterId: values.directorVoterId || "",
        email: values.directorEmail || "",
        gender: values.directorGender,
        address: values.directorAddress,
        applicantTypeId: values.directorApplicantType,
        applicantType: applicantType?.label || "",
        image: values.directorImage,
      },
    ]);

    setFieldValue("directorAadharNo", "");
    setFieldValue("directorName", "");
    setFieldValue("directorContactNo", "");
    setFieldValue("directorVoterId", "");
    setFieldValue("directorEmail", "");
    setFieldValue("directorAddress", "");
    setFieldValue("directorApplicantType", "");
    setFieldValue("directorImage", null);
  };

  const removeDirector = (id) => {
    setDirectorRows((prev) => prev.filter((item) => item.id !== id));
  };

  // const handleDocumentFile = (id, file) => {
  //   if (!file) return;
  //   setDocumentRows((prev) =>
  //     prev.map((item) =>
  //       String(item.id) === String(id)
  //         ? { ...item, file, fileName: file.name }
  //         : item,
  //     ),
  //   );
  // };

  const handleDocumentFile = (id, file) => {
    if (!file) return;
    const extension = file.name.includes(".")
      ? "." + file.name.split(".").pop().toLowerCase()
      : "";
    setDocumentRows((prev) =>
      prev.map((item) =>
        String(item.id) === String(id)
          ? { ...item, file, fileName: file.name, documentType: extension }
          : item,
      ),
    );
  };

  const buildDirectorString = () => {
    return directorRows
      .map((item) =>
        [
          item.id,
          item.directorName || "",
          item.voterId || "",
          item.address || "",
          item.mobileNo || "",
          item.email || "",
          item.gender || "",
          item.applicantTypeId || "",
          item.aadharNo || "",
        ].join("$"),
      )
      .join("#");
  };

  const buildTradeTypeString = () => {
    return tradeTypeRateRows
      .map((item) =>
        [item.tradeTypeId, item.rate || "0", item.tradeCategoryId || ""].join(
          "$",
        ),
      )
      .join("#");
  };

  let tradeTypeRows = [];

  const handleSearchLicense = async (values, setFieldValue) => {
    const oldLicenseNo = values.oldLicenseNo?.trim();

    if (!oldLicenseNo) {
      Swal.fire({
        icon: "warning",
        text: "Please enter License Number",
      });
      return;
    }

    setIsSearching(true); 
    try {
      Swal.fire({
        title: "Searching...",
        text: "Fetching license details",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const isCancelled = await checkLicenseCancelled(oldLicenseNo);
      if (isCancelled) {
        Swal.close();
        Swal.fire({
          icon: "error",
          text: "License is Cancelled",
        });
        return;
      }

      const result = await getExistingLicenseDetails(oldLicenseNo);
      Swal.close();

      if (!result || !result.found) {
        Swal.fire({
          icon: "error",
          text: "No Licence Found",
        });
        setFieldValue("oldLicenseNo", "");
        return;
      }

      const application = result.application;
      const tradeTypeDetails = result.tradeTypeDetails || [];
      const directorDetails = result.directorDetails || [];
      const documentDetails = result.documentDetails || [];

      const appId = application.NUM_APPLI_ID;
      const appNo = application.VAR_APPLI_APPLINO;

      setApplicationId(String(appId));
      setApplicationNo(String(appNo));

      setFieldValue("shopNameEnglish", application.VAR_APPLI_SHOPNAME || "");
      setFieldValue("shopNameMarathi", application.VAR_APPLI_SHOPNAMEMAR || "");
      setFieldValue("panCardNo", application.VAR_APPLI_PANNO || "");
      setFieldValue(
        "contactNo",
        application.NUM_APPLI_CONTACTNO?.toString() || "",
      );
      setFieldValue("email", application.VAR_APPLI_EMAIL || "");
      setFieldValue("shopAddress", application.VAR_APPLI_ADDRESS || "");
      // setFieldValue("wardNo", application.NUM_APPLI_WARDID?.toString() || "");
      // setFieldValue("zoneNo", application.NUM_APPLI_ZONEID?.toString() || "");
      const wardId = application.NUM_APPLI_WARDID?.toString() || "";
      const zoneId = application.NUM_APPLI_ZONEID?.toString() || "";

      setZoneOptions([]);
      setFieldValue("zoneNo", "");
      setFieldValue("wardNo", wardId);

      if (wardId) {
        await getZoneByWard(wardId);
        await new Promise((r) => setTimeout(r, 0));
        setFieldValue("zoneNo", zoneId);
      }

      if (application.DAT_APPLI_FROMDT) {
        const fromDate = new Date(application.DAT_APPLI_FROMDT);
        setFieldValue("fromDate", formatDateForFormik(fromDate));
        setFieldValue("financialFromYear", String(fromDate.getFullYear()));
      }
      if (application.DAT_APPLI_TODT) {
        const toDate = new Date(application.DAT_APPLI_TODT);
        setFieldValue("toDate", formatDateForFormik(toDate));
        setFieldValue("financialToYear", String(toDate.getFullYear()));
      }

      setFieldValue("usedArea", application.NUM_APPLI_AREA?.toString() || "0");
      setFieldValue(
        "applicantName",
        application.VAR_APPLI_PLACEOWNERNAME || "",
      );
      setFieldValue(
        "applicantAddress",
        application.VAR_APPLI_PLACEOWNERADDRESS || "",
      );
      setFieldValue(
        "licenseType",
        application.NUM_APPLI_LICENSETYPEID?.toString() || "",
      );

      setFieldValue("isManufactured", application.VAR_APPLI_ISPROD || "Y");
      setFieldValue(
        "isOwnerDoingBusiness",
        application.VAR_APPLI_OWNSPACE || "Y",
      );
      setFieldValue(
        "rentAgreementWithWhom",
        application.VAR_APPLI_AGRMENTWITH || "",
      );
      setFieldValue("corporationNoc", application.VAR_APPLI_ISCORPNOC || "Y");
      setFieldValue(
        "businessStartYear",
        application.NUM_APPLI_BUSSTARTYR?.toString() || "0",
      );
      setFieldValue(
        "shopActRegistrationNo",
        application.VAR_APPLI_SHOPACTNO || "",
      );
      setFieldValue(
        "otherAdministrationRegistrationNo",
        application.VAR_APPLI_FOODLICNO || "",
      );

      const totalAmount = result.application.AMOUNT || 0;
      setFieldValue("amount", String(totalAmount));

      if (tradeTypeDetails.length > 0) {
        tradeTypeRows = tradeTypeDetails.map((item, index) => {
          const catId =
            String(
              item.NUM_APPLITRADETYPE_CATGRYID ??
              item.NUM_CATEGORY_CATGRYID ??
              item.CATEGORYID ??
              ""
            );
          return {
            id: Date.now() + index,
            tradeTypeId: String(item.TRADETYPEID || item.NUM_APPLITRADETYPE_TRDTYPID || ""),
            tradeType: item.TRADETYPE || "",
            rate: String(item.RATE || 0),
            tradeCategoryId: catId || String(values.tradeCategory || ""),
            tradeCategory: item.TRADECATEGORY || "",
          };
        });
        setTradeTypeRateRows(tradeTypeRows);
      }

      if (tradeTypeRows.length > 0 && tradeTypeRows[0].tradeCategoryId) {
        await getTradeTypeByCategory(tradeTypeRows[0].tradeCategoryId);
      }

      if (Array.isArray(result.tradeDetails) && result.tradeDetails.length > 0) {
        const selectedIds = result.tradeDetails
          .map((t) => String(t.NUM_APPLITRADE_TRADEID ?? "").trim())
          .filter(Boolean);

        setTradeCheckboxRows((prev) => {
          const prevIds = new Set(prev.map((r) => String(r.tradeId)));
          const merged = prev.map((r) => ({
            ...r,
            selected: selectedIds.includes(String(r.tradeId)),
          }));

          const missing = selectedIds
            .filter((id) => !prevIds.has(id))
            .map((id) => ({ tradeId: id, tradeName: id, selected: true }));

          if (missing.length > 0) {
            setTimeout(() => {
              document
                .querySelector("[data-trade-checkbox-table] tbody tr:last-child")
                ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }, 100);
          }

          return [...merged, ...missing];
        });
      }

      if (directorDetails.length > 0) {
        const directorRowsData = directorDetails.map((item, index) => ({
          id: index + 1,
          aadharNo: item.ADHARNO?.toString() || "",
          directorName: item.DIRCTORNAME || "",
          mobileNo: item.MOBILENO?.toString() || "",
          voterId: item.VOTERID?.toString() || "",
          email: item.EMAIL || "",
          gender: item.GENDER || "F",
          address: item.ADDRESS || "",
          applicantTypeId: item.APPLITYPEID?.toString() || "",
          applicantType: item.APPLITYPENAME || "",
          image: item.imgDirectorImage || null,
        }));
        setDirectorRows(directorRowsData);
      }

      if (documentDetails.length > 0) {
        setDocumentRows((prev) => {
          const byPrimary = new Map(
            documentDetails.map((d) => [String(d.PRIMARYDOCID), d]),
          );
          const byDocId = new Map(
            documentDetails.map((d) => [String(d.DOCID), d]),
          );

          const used = new Set();

          const updated = prev.map((item, index) => {
            const key = String(index + 1);
            const byPos = byPrimary.get(key);
            const byId = byDocId.get(String(item.docId));
            const existing = byPos || byId;
            if (!existing) return item;

            used.add(String(existing.PRIMARYDOCID));
            used.add(String(existing.DOCID));

            const fileType = existing.FILETYPE || existing.FileType || "";
            return {
              ...item,
              fileName: fileType,
              filebyte: existing.filebyte || item.filebyte,
              remark: existing.REMARK ?? existing.remark ?? item.remark,
              documentType: fileType || item.documentType,
            };
          });

          const extras = documentDetails
            .filter(
              (d) =>
                !used.has(String(d.PRIMARYDOCID)) && !used.has(String(d.DOCID)),
            )
            .map((d, i) => {
              const fileType = d.FILETYPE || d.FileType || "";
              return {
                id: `existing-${d.PRIMARYDOCID ?? d.DOCID}-${i}`,
                srNo: updated.length + i + 1,
                docId: String(d.DOCID ?? ""),
                primaryDocId: String(d.PRIMARYDOCID ?? ""),
                documentName: d.DOCTYPENAME ?? "",
                documentType: fileType,
                active: "N", 
                file: null,
                fileName: fileType,
                filebyte: d.filebyte || null,
                remark: d.REMARK ?? "",
              };
            });

          return [...updated, ...extras];
        });

        console.log(
          "doc binding result:",
          documentRows.map((d, i) => ({
            pos: i + 1,
            docId: d.docId,
            name: d.documentName,
            fileName: d.fileName,
            hasFile: Boolean(d.filebyte),
          })),
        );
      }

      Swal.fire({
        icon: "success",
        title: "License Found",
        text: "Application details loaded successfully.",
      });

      setActiveTab("primary");
    } catch (error) {
      Swal.close();
      console.error("Search License Error:", error);
      Swal.fire({
        icon: "error",
        text: "Error fetching license details. Please try again.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const submitApplication = async (values, { setSubmitting, resetForm, setFieldValue }) => {
    try {
      if (values.email && !validateEmail(values.email)) {
        Swal.fire({
          icon: "warning",
          text: "Please enter a valid email address.",
        });

        setActiveTab("primary");
        return;
      }

      if (!values.financialFromYear) {
        Swal.fire({ text: "Please select Financial From Year" });
        setActiveTab("primary");
        return;
      }
      if (!values.financialToYear) {
        Swal.fire({ text: "Please select To Year" });
        setActiveTab("primary");
        return;
      }
      if (Number(values.financialFromYear) > Number(values.financialToYear)) {
        Swal.fire({ text: "From Year must be less than or equal to To Year" });
        setActiveTab("primary");
        return;
      }

      const frmYear = Number(values.financialFromYear);
      const toYear = Number(values.financialToYear);
      const computedFromDate = `${frmYear}-04-01`;
      const computedToDate   = `${toYear}-03-31`;

      if (!values.shopNameEnglish?.trim()) {
        Swal.fire({ text: "Please Enter Shop Name English" });
        setActiveTab("primary");
        return;
      }

      if (!values.shopNameMarathi?.trim()) {
        Swal.fire({ text: "Please Enter Shop Name Marathi" });
        setActiveTab("primary");
        return;
      }

      if (!values.contactNo?.trim()) {
        Swal.fire({ text: "Please Enter Mobile No" });
        setActiveTab("primary");
        return;
      }

      if (!values.shopAddress?.trim()) {
        Swal.fire({ text: "Please Enter Address" });
        setActiveTab("primary");
        return;
      }

      if (!values.wardNo) {
        Swal.fire({ text: "Please Select Ward" });
        setActiveTab("primary");
        return;
      }

      if (tradeTypeRateRows.length === 0) {
        Swal.fire({ text: "Please Add At Least One Trade Type" });
        setActiveTab("primary");
        return;
      }

      if (!values.applicantName?.trim()) {
        Swal.fire({ text: "Please Enter Place Owner Name" });
        setActiveTab("primary");
        return;
      }

      if (!values.applicantAddress?.trim()) {
        Swal.fire({ text: "Please Enter Place Owner Address" });
        setActiveTab("primary");
        return;
      }

      if (mode === 2) {
        if (documentRows.length > 0) {
          const missingDocuments = documentRows.filter(
            (item) =>
              item.active === "Y" &&
              !item.file && 
              !item.filebyte,
          );

          if (missingDocuments.length > 0) {
            setActiveTab("documents");

            await Swal.fire({
              icon: "warning",
              title: "Documents Required",
              html: `
              <div style="text-align: left;">
                <p>Please upload all required documents.</p>
              </div>
            `,
            });

            return;
          }
        }
      }

      if (directorRows.length === 0) {
        Swal.fire({ text: "Please Add At Least One Director" });
        setActiveTab("director");
        return;
      }

      if (selfDeclareRows.length > 0 && !values.declarationAccepted) {
        Swal.fire({
          icon: "warning",
          text: "Please accept the self declaration before submitting.",
        });
        setActiveTab("documents");
        return;
      }

      if (tradeCheckboxRows.filter((r) => r.selected).length === 0) {
        Swal.fire({ text: "Please select at least one Trade" });
        setActiveTab("primary");
        return;
      }

      const directorString = buildDirectorString();
      const tradeTypeString = buildTradeTypeString();

      const buildTradeString = () => {
        return tradeCheckboxRows
          .filter((r) => r.selected)
          .map((r) => r.tradeId)
          .join("#");
      };

      const totalAmount = tradeTypeRateRows.reduce(
        (total, item) => total + Number(item.rate || 0),
        0,
      );

      if (String(totalAmount) !== String(values.amount || "0")) {
        setFieldValue("amount", String(totalAmount));
      }

      const ipAddress = await getIPAddress();

      const payload = {
        userId: String(userId || ""),
        ulbId: Number(ulbId),
        corpId: Number(corpId || 0),
        serviceId: Number(serviceId),

        appid: Number(applicationId || 0),
        appliNo: applicationNo || "0",
        // mode: Number(mode),
        mode: 1,

        oldLicencNo: mode === 2 ? values.oldLicenseNo?.trim() || null : null,

        shopName: values.shopNameEnglish?.trim() || "",
        shopNameMar: values.shopNameMarathi?.trim() || "",
        panNo: values.panCardNo?.trim() || "",
        contactNo: values.contactNo ? Number(values.contactNo) : null,
        email: values.email?.trim() || "",
        address: values.shopAddress?.trim() || "",

        zoneId: values.zoneNo ? Number(values.zoneNo) : Number(zoneId || 0),
        wardId: values.wardNo ? Number(values.wardNo) : 0,

        isProd: values.isManufactured === "Y" ? "Y" : "N",
        ownSpace: values.isOwnerDoingBusiness === "Y" ? "Y" : "N",
        agrmentWith: values.rentAgreementWithWhom || "",
        area: values.usedArea ? Number(values.usedArea) : 0,
        isCorpNOC: values.corporationNoc === "Y" ? "Y" : "N",
        busStartYr: values.businessStartYear
          ? Number(values.businessStartYear)
          : 0,
        shopActNo: values.shopActRegistrationNo || "",
        foodlicno: values.otherAdministrationRegistrationNo || "",
        licDays: null,

        placeOwnerName: values.applicantName?.trim() || "",
        placeOwnerAddress: values.applicantAddress?.trim() || "",

        // fromDate: values.fromDate || null,
        // toDate: values.toDate || null,
        fromDate: computedFromDate,
        toDate:   computedToDate,

        amount: Number(totalAmount || 0),
        applitradeStr: buildTradeString(),
        applitradetypeStr: tradeTypeString,
        applidirectorStr: directorString,

        licType: String(mode === 2 ? "R" : "N"),
        licenseTypeId: values.licenseType ? Number(values.licenseType) : 0,
        // propNo: values.propNo || "",
        // marketPropNo: "",
        propNo: values.propNo && String(values.propNo).trim() !== "" ? values.propNo.trim() : null,
        marketPropNo: null,

        source: config.source || "WEB",
        ipAddress: ipAddress || "127.0.0.1",
        cfcRecno: "",

        jwalan: values.jalanShil || (mode === 1 ? "N" : ""),
        illegal: values.illegalType ? Number(values.illegalType) : 0,
        category: values.tradeBusinessType || "T",
        trdBusinessType: values.businessNature || "",
        businessPlace: values.businessPlace ? Number(values.businessPlace) : 0,
        arrearsAmount: 0,
      };

      console.log("========== APPLICATION ENTRY PAYLOAD ==========");
      console.log(JSON.stringify(payload, null, 2));
      console.log("================================================");

      Swal.fire({
        title: "Saving...",
        text: "Submitting application",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await axios.post(
        `${BASE_URL}/api/FrmMarketEntry/applicationentry`,
        payload,
        { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
      );

      Swal.close();

      console.log("APPLICATION ENTRY RESPONSE:", response.data);

      const responseData = response.data?.data || {};
      const backendMessage =
        response.data?.message || "Application entry failed.";
      const errorCode = Number(responseData?.errorCode ?? 0);
      // const newAppId = responseData?.appId ?? responseData?.appid ?? 0;
      const newAppId =
        responseData?.appId ??
        responseData?.appid ??
        responseData?.applicationId ??
        0;

      console.log("Parsed newAppId from applicationentry:", newAppId);

      if (!Number(newAppId)) {
        await Swal.fire({
          icon: "error",
          title: "Application Entry Failed",
          text: "Application ID was not returned by the server. Document upload cannot proceed.",
        });
        return;
      }
      const appNo = responseData?.appliNo || responseData?.appNo || "";

      const isSuccess =
        response.data?.ok === true &&
        String(response.data?.status || "").toUpperCase() === "SUCCESS";

      if (!isSuccess) {
        await Swal.fire({
          icon: "error",
          title: "Application Entry Failed",
          text: `${backendMessage}${errorCode ? ` (Error Code: ${errorCode})` : ""}`,
        });
        return;
      }

      if (!appNo || appNo === "MK0" || appNo === "0") {
        throw new Error(backendMessage || "Invalid Application No returned.");
      }

      // const selectedDocuments = documentRows.filter(
      //   (item) => item?.file && item.active === "Y",
      // );

      // if (selectedDocuments.length > 0) {
      //   Swal.fire({
      //     title: "Uploading...",
      //     text: "Uploading documents",
      //     allowOutsideClick: false,
      //     allowEscapeKey: false,
      //     showConfirmButton: false,
      //     didOpen: () => Swal.showLoading(),
      //   });

      //   for (const doc of selectedDocuments) {
      //     const formData = new FormData();
      //     formData.append("corpId", String(corpId || 10001));
      //     formData.append("serviceId", String(serviceId));
      //     formData.append("appno", String(appNo));
      //     formData.append("doctype", String(doc.documentType || ""));
      //     formData.append("documentid", String(doc.docId || ""));
      //     formData.append("document", doc.file);

      //     await axios.post(
      //       `${BASE_URL}/api/FrmMarketEntry/documentinsert`,
      //       formData,
      //       {
      //         headers: {
      //           Authorization: authToken ? `Bearer ${authToken}` : "",
      //           "Content-Type": "multipart/form-data",
      //         },
      //       },
      //     );
      //   }
      // }

      const directorsWithImages = directorRows.filter((item) => item?.image);

      if (directorsWithImages.length > 0) {
        Swal.fire({
          title: "Uploading...",
          text: "Uploading director images",
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => Swal.showLoading(),
        });

        const formData = new FormData();
        formData.append("appid", String(newAppId));

        directorsWithImages.forEach((director, index) => {
          formData.append("directorIds", String(director.id || index + 1));
          formData.append("directorImages", director.image);
        });

        await axios.post(
          `${BASE_URL}/api/FrmMarketEntry/updatedirectorimages`,
          formData,
          {
            headers: {
              Authorization: authToken ? `Bearer ${authToken}` : "",
              "Content-Type": "multipart/form-data",
            },
          },
        );
      }

      const selectedDocuments = documentRows.filter(
        (item) => item?.file && item.active === "Y",
      );

      if (selectedDocuments.length > 0) {
        const hadExistingDocs = documentRows.some(
          (d) => !d.file && d.fileName && d.fileName !== "",
        );

        if (mode === 2 && applicationId && hadExistingDocs) {
          Swal.fire({
            title: "Preparing...",
            text: "Removing old documents",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
          });

          await axios.post(
            `${BASE_URL}/api/FrmMarketEntry/deleteexistingdocs`,
            { appid: Number(applicationId), appno: String(appNo) },
            { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } },
          );
        }

        Swal.fire({
          title: "Uploading...",
          text: "Uploading documents",
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => Swal.showLoading(),
        });

        for (const doc of selectedDocuments) {
          const rowIndex = documentRows.findIndex((d) => d.id === doc.id);
          const primaryDocId = rowIndex + 1;

          const formData = new FormData();
          formData.append("corpId", String(corpId || 10001));
          formData.append("serviceId", String(serviceId));
          formData.append("appno", String(appNo));
          formData.append("appid", String(newAppId));
          formData.append("primaryDocId", String(primaryDocId));

          formData.append("docType", "S");

          formData.append("fileType", String(doc.documentType || ""));

          formData.append("documentid", String(doc.docId || ""));
          formData.append("document", doc.file);

          try {
            await axios.post(
              `${BASE_URL}/api/FrmMarketEntry/documentinsert`,
              formData,
              {
                headers: {
                  Authorization: authToken ? `Bearer ${authToken}` : "",
                  "Content-Type": "multipart/form-data",
                },
              },
            );
          } catch (err) {
            const msg =
              err?.response?.data?.message ||
              err?.message ||
              "Document upload failed.";
            await Swal.fire({
              icon: "error",
              title: "Document Upload Failed",
              text: `${doc.documentName || "Document"}: ${msg}`,
            });
            return;
          }
        }
      }

      Swal.close();

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: backendMessage || "Application submitted successfully.",
      });

      // resetForm();
      // setTradeTypeRateRows([]);
      // setDirectorRows([]);
      // setTradeCheckboxRows((prev) => prev.map((r) => ({ ...r, selected: false })));
      // setFieldValue("amount", "0");
      // setLicenseMode(serviceCodeFromUrl === "7" ? "N" : "R");
      // setShowModeRadio(serviceCodeFromUrl === "");
      // setApplicationId("");
      // setApplicationNo("");
      // setActiveTab("primary");
      
      navigate("/app/FrmTrackApplication", {
        state: { applicationNo: appNo },
      });
    } catch (error) {
      Swal.close();
      console.error("Application Entry Error:", error);

      const errorResponse = error?.response?.data || {};
      const errorMessage =
        errorResponse?.message || error?.message || "Application entry failed.";

      await Swal.fire({
        icon: "error",
        title: "Application Entry Failed",
        text: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const parseDateForPicker = (value) => {
    if (!value) return undefined;
    if (value instanceof Date)
      return Number.isNaN(value.getTime()) ? undefined : value;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? undefined : date;
  };

  const formatDateForFormik = (date) => {
    if (!date || Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={submitApplication}
      enableReinitialize
    >
      {({ values, setFieldValue, resetForm, isSubmitting }) => (
        <Form className="w-full">
          <Card className="w-full rounded-lg border border-gray-300 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-200 px-5 py-4">
              <CardTitle className="text-lg font-semibold text-gray-700">
                {serviceName}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="border-b border-gray-200 px-2 pt-2">
                  <TabsList className="h-auto w-full justify-start gap-6 overflow-x-auto rounded-none bg-transparent p-0">
                    <TabsTrigger
                      value="primary"
                      className="
        rounded-none
        border-0
        border-b-2
        border-transparent
        bg-transparent
        px-2
        pb-3
        pt-1
        text-sm
        font-medium
        text-gray-600
        shadow-none
        outline-none
        ring-0
        transition-colors
        hover:bg-transparent
        hover:text-primary
        focus-visible:outline-none
        focus-visible:ring-0
        data-[state=active]:border-primary
        data-[state=active]:bg-transparent
        data-[state=active]:text-primary
        data-[state=active]:shadow-none
      "
                    >
                      प्राथमिक माहिती
                    </TabsTrigger>

                    <TabsTrigger
                      value="director"
                      className="
        rounded-none
        border-0
        border-b-2
        border-transparent
        bg-transparent
        px-2
        pb-3
        pt-1
        text-sm
        font-medium
        text-gray-600
        shadow-none
        outline-none
        ring-0
        transition-colors
        hover:bg-transparent
        hover:text-primary
        focus-visible:outline-none
        focus-visible:ring-0
        data-[state=active]:border-primary
        data-[state=active]:bg-transparent
        data-[state=active]:text-primary
        data-[state=active]:shadow-none
      "
                    >
                      संचालक माहिती
                    </TabsTrigger>

                    <TabsTrigger
                      value="documents"
                      className="
        rounded-none
        border-0
        border-b-2
        border-transparent
        bg-transparent
        px-2
        pb-3
        pt-1
        text-sm
        font-medium
        text-gray-600
        shadow-none
        outline-none
        ring-0
        transition-colors
        hover:bg-transparent
        hover:text-primary
        focus-visible:outline-none
        focus-visible:ring-0
        data-[state=active]:border-primary
        data-[state=active]:bg-transparent
        data-[state=active]:text-primary
        data-[state=active]:shadow-none
      "
                    >
                      कागदपत्र जोडणे
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="primary" className="m-0 px-5 py-6">
                  <div className="space-y-7">
                    {showModeRadio && (
                      <section className="pb-4">
                        <div className="grid grid-cols-1 xl:grid-cols-2">
                          <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2 xl:col-span-1">
                            <Label text="Type" required className="!w-full text-sm font-medium" />
                            <span>:</span>
                            <div className="flex items-center gap-6">
                              <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <Input
                                  type="radio"
                                  checked={licenseMode === "N"}
                                  onChange={() => {
                                    setLicenseMode("N");
                                    // RdbSectionType_SelectedIndexChanged: DivSearch.Visible = false
                                    setFieldValue("oldLicenseNo", "");
                                    setApplicationId("");
                                    setApplicationNo("");
                                    // RdbSectionType.Visible = false
                                    setShowModeRadio(false);
                                  }}
                                  className="h-4 w-4"
                                />
                                New
                              </label>
                              <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <Input
                                  type="radio"
                                  checked={licenseMode === "R"}
                                  onChange={() => {
                                    setLicenseMode("R");
                                    setShowModeRadio(false);
                                  }}
                                  className="h-4 w-4"
                                />
                                Renewal
                              </label>
                            </div>
                          </div>
                        </div>
                      </section>
                    )}

                    {showOldLicenseInput && (
                      <section className="pb-4">
                        <div className="grid grid-cols-1 xl:grid-cols-2">
                          <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2 xl:col-span-1">
                            <Label
                              text="Old License No"
                              className="!w-full text-sm font-medium"
                            />
                            <span>:</span>
                            <div className="flex w-full gap-2">
                              <Input
                                value={values.oldLicenseNo}
                                maxLength={100}
                                onChange={(e) =>
                                  setFieldValue("oldLicenseNo", e.target.value)
                                }
                                className="h-10 flex-1"
                                placeholder="Enter Old License Number"
                              />
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => handleSearchLicense(values, setFieldValue)}
                                disabled={isSearching}
                                className="h-10 whitespace-nowrap"
                              >
                                {isSearching ? "Searching..." : "Search"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </section>
                    )}

                    {/* {mode === 2 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 xl:grid-cols-3">
                          <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2 xl:col-span-1">
                            <Label
                              text="Type"
                              required
                              className="!w-full text-sm font-medium"
                            />
                            <span>:</span>
                            <div className="flex items-center gap-6">
                              <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <Input
                                  type="radio"
                                  checked={values.tradeBusinessType === "T"}
                                  onChange={async () => {
                                    await handleTradeBusinessTypeChange(
                                      "T",
                                      setFieldValue,
                                      values,
                                    );
                                  }}
                                  className="h-4 w-4"
                                />
                                Trade
                              </label>
                              <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <Input
                                  type="radio"
                                  checked={values.tradeBusinessType === "S"}
                                  onChange={async () => {
                                    await handleTradeBusinessTypeChange(
                                      "S",
                                      setFieldValue,
                                      values,
                                    );
                                  }}
                                  className="h-4 w-4"
                                />
                                Storage
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3">
                          <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2 xl:col-span-1">
                            <Label
                              text="परवाना क्रमांक"
                              required
                              className="!w-full text-sm font-medium"
                            />
                            <span>:</span>
                            <div className="flex w-full gap-2">
                              <Input
                                value={values.oldLicenseNo}
                                onChange={(e) =>
                                  setFieldValue("oldLicenseNo", e.target.value)
                                }
                                className="h-10 flex-1"
                                placeholder="Enter License Number"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  handleSearchLicense(values, setFieldValue)
                                }
                                className="h-10 whitespace-nowrap"
                              >
                                शोधा
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )} */}

                    <section
                      className={
                        mode === 2 ? "border-t border-gray-200 pt-6" : ""
                      }
                    >
                      <div className="grid grid-cols-1 gap-x-8 gap-y-5 xl:grid-cols-2">
                        <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2">
                          <Label
                            text="दुकानाचे नाव इंग्रजी"
                            required
                            className="!w-full text-sm font-medium"
                          />
                          <span>:</span>
                          <Input
                            value={values.shopNameEnglish}
                            onChange={(e) =>
                              setFieldValue("shopNameEnglish", e.target.value)
                            }
                            className="h-10 w-full"
                            maxLength={100}
                          />
                        </div>

                        <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2">
                          <Label
                            text="दुकानाचे नाव मराठी"
                            required
                            className="!w-full text-sm font-medium"
                          />
                          <span>:</span>
                          <Input
                            value={values.shopNameMarathi}
                            onChange={(e) =>
                              setFieldValue("shopNameMarathi", e.target.value)
                            }
                            className="h-10 w-full"
                            maxLength={100}
                          />
                        </div>

                        <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2">
                          <Label
                            text="पॅन कार्ड नं."
                            className="!w-full text-sm font-medium"
                          />
                          <span>:</span>
                          <Input
                            maxLength={10}
                            value={values.panCardNo}
                            onChange={(e) =>
                              setFieldValue(
                                "panCardNo",
                                e.target.value.toUpperCase(),
                              )
                            }
                            className="h-10 w-full"
                          />
                        </div>

                        <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2">
                          <Label
                            text="संपर्क क्र."
                            required
                            className="!w-full text-sm font-medium"
                          />
                          <span>:</span>
                          <Input
                            type="tel"
                            maxLength={10}
                            value={values.contactNo}
                            onChange={(e) =>
                              setFieldValue(
                                "contactNo",
                                e.target.value.replace(/\D/g, ""),
                              )
                            }
                            className="h-10 w-full"
                          />
                        </div>

                        <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2">
                          <Label
                            text="ई-मेल"
                            className="!w-full text-sm font-medium"
                          />
                          <span>:</span>
                          <Input
                            type="email"
                            value={values.email}
                            onChange={(e) =>
                              setFieldValue("email", e.target.value)
                            }
                            onBlur={(e) => {
                              if (!validateEmail(e.target.value)) {
                                Swal.fire({
                                  icon: "warning",
                                  text: "Please enter a valid email address.",
                                });
                              }
                            }}
                            className="h-10 w-full"
                            maxLength={50}
                          />
                        </div>

                        <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2 xl:col-span-2">
                          <Label
                            text="दुकानाचा पत्ता"
                            required
                            className="!w-full text-sm font-medium"
                          />
                          <span>:</span>
                          <Input
                            value={values.shopAddress}
                            onChange={(e) =>
                              setFieldValue("shopAddress", e.target.value)
                            }
                            className="h-10 w-full"
                          />
                        </div>
                      </div>
                    </section>

                    <section className="border-t border-gray-200 pt-6">
                      <div className="grid grid-cols-1 gap-x-10 gap-y-4 lg:grid-cols-2">
                        <div className="grid min-w-0 grid-cols-[210px_16px_minmax(0,1fr)] items-start gap-2">
                          <Label
                            text ="वार्ड क्र."
                            required
                            className="!w-full pt-2 text-sm font-medium"
                          />
                          <span className="pt-2 text-center">:</span>
                          <Select
                            value={values.wardNo}
                            onValueChange={(value) =>
                              handleWardChange(value, setFieldValue)
                            }
                          >
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="-- Select Option --" />
                            </SelectTrigger>
                            <SelectContent>
                              {wardOptions.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid min-w-0 grid-cols-[210px_16px_minmax(0,1fr)] items-start gap-2">
                            <Label
                              text="झोन क्र."
                              required
                              className="!w-full pt-2 text-sm font-medium"
                            />
                            <span className="pt-2 text-center">:</span>
                            <Select
                              value={values.zoneNo}
                              onValueChange={(value) =>
                                setFieldValue("zoneNo", value)
                              }
                            >
                              <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="-- Select Option --" />
                              </SelectTrigger>
                              <SelectContent>
                                {zoneOptions.map((item) => (
                                  <SelectItem
                                    key={item.value}
                                    value={item.value}
                                  >
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                        </div>

                        <div className="grid min-w-0 grid-cols-[210px_16px_minmax(0,1fr)] items-start gap-2">
                          <Label text="Financial From Year" required className="!w-full pt-2 text-sm font-medium" />
                          <span className="pt-2 text-center">:</span>
                          <Select
                            value={values.financialFromYear}
                            onValueChange={(v) => setFieldValue("financialFromYear", v)}
                          >
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="-- Select Year --" />
                            </SelectTrigger>
                            <SelectContent>
                              {yearOptions.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid min-w-0 grid-cols-[210px_16px_minmax(0,1fr)] items-start gap-2">
                          <Label text="To Year" required className="!w-full pt-2 text-sm font-medium" />
                          <span className="pt-2 text-center">:</span>
                          <Select
                            value={values.financialToYear}
                            onValueChange={(v) => setFieldValue("financialToYear", v)}
                          >
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="-- Select Year --" />
                            </SelectTrigger>
                            <SelectContent>
                              {yearOptions.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid min-w-0 grid-cols-[210px_16px_minmax(0,1fr)] items-start gap-2">
                          <Label
                            text="रक्कम"
                            required
                            className="!w-full pt-2 text-sm font-medium"
                          />
                          <span className="pt-2 text-center">:</span>
                          <Input
                            type="text"
                            value={values.amount}
                            readOnly
                            disabled
                            className="h-10 w-full bg-gray-100 cursor-not-allowed"
                            placeholder="Auto-calculated"
                          />
                        </div>

                        {/* {mode === 2 && (
                          <div className="grid min-w-0 grid-cols-[210px_16px_minmax(0,1fr)] items-start gap-2">
                            <Label
                              text="ज्वलनशील पदार्थांचा / इंधनाचा वापर व साठवणूक करीत आहे?"
                              required
                              className="!w-full pt-1 text-sm font-medium leading-5"
                            />
                            <span className="pt-2 text-center">:</span>
                            <Select
                              value={values.jalanShil}
                              onValueChange={async (value) => {
                                await handleJalanShilChange(
                                  value,
                                  setFieldValue,
                                  values,
                                );
                              }}
                            >
                              <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="-- Select Option --" />
                              </SelectTrigger>
                              <SelectContent>
                                {jalanShilOptions.map((item) => (
                                  <SelectItem
                                    key={item.value}
                                    value={item.value}
                                  >
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {mode === 2 && (
                          <div className="grid min-w-0 grid-cols-[210px_16px_minmax(0,1fr)] items-start gap-2">
                            <Label
                              text="Illegal Property"
                              required
                              className="!w-full pt-2 text-sm font-medium"
                            />
                            <span className="pt-2 text-center">:</span>
                            <Select
                              value={values.illegalType}
                              onValueChange={(value) =>
                                setFieldValue("illegalType", value)
                              }
                            >
                              <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="-- Select Option --" />
                              </SelectTrigger>
                              <SelectContent>
                                {illegalTypeOptions.map((item) => (
                                  <SelectItem
                                    key={item.value}
                                    value={item.value}
                                  >
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {mode === 2 && (
                          <div className="grid min-w-0 grid-cols-[210px_16px_minmax(0,1fr)] items-start gap-2">
                            <Label
                              text="Property No"
                              required
                              className="!w-full pt-2 text-sm font-medium"
                            />
                            <span className="pt-2 text-center">:</span>
                            <Input
                              value={values.propNo}
                              onChange={(e) =>
                                setFieldValue("propNo", e.target.value)
                              }
                              className="h-10 w-full"
                            />
                          </div>
                        )} */}

                        <div className="grid min-w-0 grid-cols-[210px_16px_minmax(0,1fr)] items-start gap-2">
                          <Label
                            text="Trade Category"
                            required
                            className="!w-full pt-2 text-sm font-medium"
                          />
                          <span className="pt-2 text-center">:</span>
                          <Select
                            value={values.tradeCategory}
                            disabled={
                              !values.tradeBusinessType ||
                              (mode === 2 && !values.jalanShil)
                            }
                            onValueChange={(value) =>
                              handleTradeCategoryChange(value, setFieldValue)
                            }
                          >
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="-- Select Option --" />
                            </SelectTrigger>
                            <SelectContent>
                              {tradeCategoryOptions.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid min-w-0 grid-cols-[210px_16px_minmax(0,1fr)] items-start gap-2">
                          <Label
                            text="Trade Type"
                            required
                            className="!w-full pt-2 text-sm font-medium"
                          />
                          <span className="pt-2 text-center">:</span>
                          <Select
                            value={values.tradeType}
                            disabled={!values.tradeCategory}
                            onValueChange={async (value) => {
                              setFieldValue("tradeType", value);
                              const rate = await getRateByTradeType(value, values.tradeCategory);
                              setFieldValue("rate", String(rate || ""));
                            }}
                          >
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="-- Select Option --" />
                            </SelectTrigger>
                            <SelectContent>
                              {tradeTypeByCategoryOptions.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <section className="border-t border-gray-200 pt-6">
                          <h4 className="mb-3 text-sm font-semibold text-gray-700">व्यवसाय</h4>
                          <div className="max-h-[350px] overflow-y-auto border rounded-md">
                            <Table className="w-full border-collapse">
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[80px] bg-[#184aa6] text-white">
                                    Select
                                  </TableHead>
                                  <TableHead className="bg-[#184aa6] text-white">
                                    Trade
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {tradeCheckboxRows.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={2} className="py-4 text-center text-sm text-gray-500">
                                      No trades found.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  tradeCheckboxRows.map((row) => (
                                    <TableRow key={row.tradeId}>
                                      <TableCell className="text-center">
                                        <Checkbox
                                          checked={row.selected}
                                          onCheckedChange={(checked) =>
                                            setTradeCheckboxRows((prev) =>
                                              prev.map((r) =>
                                                r.tradeId === row.tradeId
                                                  ? { ...r, selected: checked === true }
                                                  : r,
                                              ),
                                            )
                                          }
                                        />
                                      </TableCell>
                                      <TableCell>{row.tradeName}</TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </section>

                        {/* <div className="grid min-w-0 grid-cols-[210px_16px_minmax(0,1fr)] items-start gap-2">
                          <Label
                            text="व्यवसाय ची जागा"
                            required
                            className="!w-full pt-2 text-sm font-medium"
                          />
                          <span className="pt-2 text-center">:</span>
                          <Select
                            value={values.businessPlace}
                            onValueChange={(value) =>
                              setFieldValue("businessPlace", value)
                            }
                          >
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="-- Select Option --" />
                            </SelectTrigger>
                            <SelectContent>
                              {businessPlaceOptions.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div> */}

                        <div>
                          <div className="grid min-w-0 grid-cols-[210px_16px_minmax(0,1fr)] items-start gap-2">
                            <Label
                              text="Rate"
                              className="!w-full pt-2 text-sm font-medium"
                            />
                            <span className="pt-2 text-center">:</span>
                            <Input
                              value={values.rate}
                              onChange={(e) =>
                                setFieldValue("rate", e.target.value)
                              }
                              className="h-10 w-full"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-5">
                        <Button
                          type="button"
                          onClick={() => addTradeType(values, setFieldValue)}
                        >
                          Add To List
                        </Button>
                      </div>
                    </section>

                    {tradeTypeRateRows.length > 0 && (
                      <div className="w-full overflow-x-auto">
                        <Table className="w-full table-fixed border">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[110px] bg-[#184aa6] text-white">
                                Delete
                              </TableHead>
                              <TableHead className="bg-[#184aa6] text-white">
                                Trade Type
                              </TableHead>
                              <TableHead className="w-[140px] bg-[#184aa6] text-white">
                                Rate
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tradeTypeRateRows.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeTradeType(item.id, setFieldValue)}
                                  >
                                    Remove
                                  </Button>
                                </TableCell>
                                <TableCell className="break-words">
                                  {item.tradeType}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {item.rate}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {serviceId &&
                      ["304", "501"].includes(String(serviceId)) && (
                        <section className="border-t border-gray-200 pt-6">
                          <div className="grid grid-cols-1 gap-x-8 gap-y-5 xl:grid-cols-3">
                            <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2">
                              <Label
                                text="व्यवसायाचे स्वरूप"
                                required
                                className="!w-full text-sm font-medium"
                              />
                              <span>:</span>
                              <Input
                                value={values.businessNature}
                                onChange={(e) =>
                                  setFieldValue(
                                    "businessNature",
                                    e.target.value,
                                  )
                                }
                                className="h-10 w-full"
                              />
                            </div>
                          </div>
                        </section>
                      )}

                    <div>
                      <section className="border-t border-gray-200 pt-6">
                        <div className="grid grid-cols-1 gap-x-8 gap-y-5 xl:grid-cols-2">
                          <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2">
                            <Label
                              text="वस्तू निर्मित आहे का"
                              required
                              className="!w-full text-sm font-medium"
                            />
                            <span>:</span>
                            <div className="flex items-center gap-6">
                              <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <Input
                                  type="radio"
                                  checked={values.isManufactured === "Y"}
                                  onChange={() =>
                                    setFieldValue("isManufactured", "Y")
                                  }
                                  className="h-4 w-4"
                                />
                                होय
                              </label>
                              <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <Input
                                  type="radio"
                                  checked={values.isManufactured === "N"}
                                  onChange={() =>
                                    setFieldValue("isManufactured", "N")
                                  }
                                  className="h-4 w-4"
                                />
                                नाही
                              </label>
                            </div>
                          </div>

                          <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2">
                            <Label
                              text="स्वत:च्या मालकीच्या जागेत व्यवसाय करीत आहे का"
                              required
                              className="!w-full text-sm font-medium"
                            />
                            <span>:</span>
                            <div className="flex items-center gap-6">
                              <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <Input
                                  type="radio"
                                  checked={values.isOwnerDoingBusiness === "Y"}
                                  onChange={() =>
                                    setFieldValue("isOwnerDoingBusiness", "Y")
                                  }
                                  className="h-4 w-4"
                                />
                                होय
                              </label>
                              <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <Input
                                  type="radio"
                                  checked={values.isOwnerDoingBusiness === "N"}
                                  onChange={() =>
                                    setFieldValue("isOwnerDoingBusiness", "N")
                                  }
                                  className="h-4 w-4"
                                />
                                नाही
                              </label>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>

                    <section className="border-t border-gray-200 pt-6">
                      <div className="grid grid-cols-1 gap-x-8 gap-y-5 xl:grid-cols-2">
                        <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2">
                          <Label
                            text="जागा मालकीचे नाव"
                            required
                            className="!w-full text-sm font-medium"
                          />
                          <span>:</span>
                          <Input
                            value={values.applicantName}
                            onChange={(e) =>
                              setFieldValue("applicantName", e.target.value)
                            }
                            className="h-10 w-full"
                          />
                        </div>

                        <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-start gap-2">
                          <Label
                            text="जागा मालकाचा पत्ता"
                            required
                            className="!w-full pt-2 text-sm font-medium"
                          />
                          <span className="pt-2">:</span>
                          <Input
                            value={values.applicantAddress}
                            onChange={(e) =>
                              setFieldValue("applicantAddress", e.target.value)
                            }
                            className="h-10 w-full"
                          />
                        </div>
                      </div>
                    </section>

                    <div>
                      <section className="border-t border-gray-200 pt-6">
                        <div className="grid grid-cols-1 gap-x-8 gap-y-5 xl:grid-cols-2">
                          <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2">
                            <Label
                              text="भाडे करार कोणासोबत केलेला आहे"
                              required
                              className="!w-full text-sm font-medium"
                            />
                            <span>:</span>
                            <Input
                              value={values.rentAgreementWithWhom}
                              onChange={(e) =>
                                setFieldValue(
                                  "rentAgreementWithWhom",
                                  e.target.value,
                                )
                              }
                              className="h-10 w-full"
                            />
                          </div>

                          <div className="grid min-w-0 grid-cols-[210px_16px_minmax(0,1fr)] items-start gap-2">
                            <Label
                              text="वापरात आलेले जागेचे क्षेत्र चौ. फु. मध्ये"
                              required
                              className="!w-full pt-2 text-sm font-medium"
                            />
                            <span className="pt-2 text-center">:</span>
                            <Input
                              type="number"
                              value={values.usedArea}
                              onChange={(e) =>
                                setFieldValue("usedArea", e.target.value)
                              }
                              className="h-10 w-full"
                            />
                          </div>


                          <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2">
                            <Label
                              text="व्यवसायासाठी म. न. पा. चे नाहरकत प्रमाणपत्र घेतले आहे का"
                              required
                              className="!w-full text-sm font-medium"
                            />
                            <span>:</span>
                            <div className="flex items-center gap-6">
                              <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <Input
                                  type="radio"
                                  checked={values.corporationNoc === "Y"}
                                  onChange={() =>
                                    setFieldValue("corporationNoc", "Y")
                                  }
                                  className="h-4 w-4"
                                />
                                होय
                              </label>
                              <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <Input
                                  type="radio"
                                  checked={values.corporationNoc === "N"}
                                  onChange={() =>
                                    setFieldValue("corporationNoc", "N")
                                  }
                                  className="h-4 w-4"
                                />
                                नाही
                              </label>
                            </div>
                          </div>

                          <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2">
                            <Label
                              text="License Type"
                              required
                              className="!w-full text-sm font-medium"
                            />
                            <span>:</span>
                            <Select
                              value={values.licenseType}
                              onValueChange={(value) =>
                                setFieldValue("licenseType", value)
                              }
                            >
                              <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="-- Select Option --" />
                              </SelectTrigger>
                              <SelectContent>
                                {licenseTypeOptions.map((item) => (
                                  <SelectItem
                                    key={item.value}
                                    value={item.value}
                                  >
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2">
                            <Label
                              text="व्यवसाय सुरु केल्याचे वर्ष"
                              required
                              className="!w-full text-sm font-medium"
                            />
                            <span>:</span>
                            <Input
                              type="number"
                              maxLength={4}
                              value={values.businessStartYear}
                              onChange={(e) =>
                                setFieldValue(
                                  "businessStartYear",
                                  e.target.value,
                                )
                              }
                              className="h-10 w-full"
                            />
                          </div>

                          <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2">
                            <Label
                              text="शॉप ऍक्ट नोंदणी क्र."
                              className="!w-full text-sm font-medium"
                            />
                            <span>:</span>
                            <Input
                              maxLength={18}
                              value={values.shopActRegistrationNo}
                              onChange={(e) =>
                                setFieldValue(
                                  "shopActRegistrationNo",
                                  e.target.value,
                                )
                              }
                              className="h-10 w-full"
                            />
                          </div>

                          <div className="grid grid-cols-[210px_18px_minmax(0,1fr)] items-center gap-2">
                            <Label
                              text="अन्न व औषध प्रशासन कायद्यान्वये नोंदणी क्र."
                              className="!w-full text-sm font-medium"
                            />
                            <span>:</span>
                            <Input
                              value={values.otherAdministrationRegistrationNo}
                              onChange={(e) =>
                                setFieldValue(
                                  "otherAdministrationRegistrationNo",
                                  e.target.value,
                                )
                              }
                              className="h-10 w-full"
                            />
                          </div>
                        </div>
                      </section>
                    </div>

                    <div className="flex justify-center gap-3 border-t border-gray-200 pt-6">
                      <Button
                        type="button"
                        onClick={() => setActiveTab("director")}
                      >
                        पुढे जा
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          resetForm();
                          setTradeTypeRateRows([]);
                          setDirectorRows([]);
                          setTradeCheckboxRows((prev) => prev.map((r) => ({ ...r, selected: false })));
                          setFieldValue("amount", "0");
                          setLicenseMode(serviceCodeFromUrl === "7" ? "N" : "R");
                          setShowModeRadio(serviceCodeFromUrl === "");
                          setApplicationId("");
                          setApplicationNo("");
                          setActiveTab("primary");
                        }}
                      >
                        रिसेट करा
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="director" className="m-0 px-5 py-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-5 xl:grid-cols-2">
                      {/* Director Aadhar */}
                      <div className="grid grid-cols-[220px_18px_minmax(0,1fr)] items-center gap-2">
                        <Label
                          text="संचालकाचा आधार क्रमांक"
                          className="!w-full text-sm font-medium"
                        />
                        <span>:</span>
                        <Input
                          maxLength={12}
                          value={values.directorAadharNo}
                          onChange={(e) =>
                            setFieldValue(
                              "directorAadharNo",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          className="h-10 w-full"
                        />
                      </div>

                      {/* Director Name */}
                      <div className="grid grid-cols-[220px_18px_minmax(0,1fr)] items-center gap-2">
                        <Label
                          text="संचालकाचे नाव"
                          required
                          className="!w-full text-sm font-medium"
                        />
                        <span>:</span>
                        <Input
                          value={values.directorName}
                          onChange={(e) =>
                            setFieldValue("directorName", e.target.value)
                          }
                          className="h-10 w-full"
                        />
                      </div>

                      {/* Voter ID */}
                      {/* <div className="grid grid-cols-[220px_18px_minmax(0,1fr)] items-center gap-2">
                        <Label
                          text="Voter ID Card No / License No"
                          className="!w-full text-sm font-medium"
                        />
                        <span>:</span>
                        <Input
                          maxLength={20}
                          value={values.directorVoterId}
                          onChange={(e) =>
                            setFieldValue("directorVoterId", e.target.value)
                          }
                          className="h-10 w-full"
                        />
                      </div> */}

                      {/* Director Mobile */}
                      <div className="grid grid-cols-[220px_18px_minmax(0,1fr)] items-center gap-2">
                        <Label
                          text="संपर्क क्र."
                          required
                          className="!w-full text-sm font-medium"
                        />
                        <span>:</span>
                        <Input
                          maxLength={10}
                          value={values.directorContactNo}
                          onChange={(e) =>
                            setFieldValue(
                              "directorContactNo",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          className="h-10 w-full"
                        />
                      </div>

                      {/* Director Email */}
                      <div className="grid grid-cols-[220px_18px_minmax(0,1fr)] items-center gap-2">
                        <Label
                          text="ई-मेल"
                          className="!w-full text-sm font-medium"
                        />
                        <span>:</span>
                        <Input
                          type="email"
                          value={values.directorEmail}
                          onChange={(e) =>
                            setFieldValue("directorEmail", e.target.value)
                          }
                          className="h-10 w-full"
                        />
                      </div>

                      {/* Gender */}
                      <div className="grid grid-cols-[220px_18px_minmax(0,1fr)] items-center gap-2">
                        <Label
                          text="लिंग"
                          required
                          className="!w-full text-sm font-medium"
                        />
                        <span>:</span>
                        <div className="flex flex-wrap items-center gap-5">
                          <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <Input
                              type="radio"
                              checked={values.directorGender === "F"}
                              onChange={() =>
                                setFieldValue("directorGender", "F")
                              }
                              className="h-4 w-4"
                            />
                            स्त्री
                          </label>
                          <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <Input
                              type="radio"
                              checked={values.directorGender === "M"}
                              onChange={() =>
                                setFieldValue("directorGender", "M")
                              }
                              className="h-4 w-4"
                            />
                            पुरुष
                          </label>
                          <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <Input
                              type="radio"
                              checked={values.directorGender === "O"}
                              onChange={() =>
                                setFieldValue("directorGender", "O")
                              }
                              className="h-4 w-4"
                            />
                            इतर
                          </label>
                        </div>
                      </div>

                      {/* Director Address */}
                      <div className="grid grid-cols-[220px_18px_minmax(0,1fr)] items-start gap-2 xl:col-span-2">
                        <Label
                          text="पत्ता"
                          required
                          className="!w-full pt-2 text-sm font-medium"
                        />
                        <span className="pt-2">:</span>
                        <textarea
                          value={values.directorAddress}
                          onChange={(e) =>
                            setFieldValue("directorAddress", e.target.value)
                          }
                          className="min-h-[90px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      {/* Applicant Type */}
                      <div className="grid grid-cols-[220px_18px_minmax(0,1fr)] items-center gap-2">
                        <Label
                          text="अर्जदार प्रकार"
                          required
                          className="!w-full text-sm font-medium"
                        />
                        <span>:</span>
                        <Select
                          value={values.directorApplicantType}
                          onValueChange={(value) =>
                            setFieldValue("directorApplicantType", value)
                          }
                        >
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="-- Select Option --" />
                          </SelectTrigger>
                          <SelectContent>
                            {applicantTypeOptions.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Director Photo */}
                      <div className="grid grid-cols-[220px_18px_minmax(0,1fr)] items-center gap-2">
                        <Label
                          text="संचालकांचा फोटो"
                          className="!w-full text-sm font-medium"
                        />
                        <span>:</span>
                        <Input
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) =>
                            setFieldValue(
                              "directorImage",
                              e.currentTarget.files?.[0] || null,
                            )
                          }
                          className="h-10 w-full"
                        />
                      </div>
                    </div>

                    {/* Add Director Button */}
                    <div className="border-t border-gray-200 pt-5">
                      <Button
                        type="button"
                        onClick={() => addDirector(values, setFieldValue)}
                      >
                        Add Director
                      </Button>
                    </div>

                    {/* Director Grid */}
                    <div className="w-full overflow-x-auto">
                      <Table className="w-full table-fixed border">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[90px] whitespace-nowrap bg-[#184aa6] text-white">
                              आधार क्र.
                            </TableHead>

                            <TableHead className="w-[150px] whitespace-nowrap bg-[#184aa6] text-white">
                              संचालकांचे नाव
                            </TableHead>

                            {/* <TableHead className="w-[180px] whitespace-normal bg-[#184aa6] text-white">
                              Voter ID Card No / License No
                            </TableHead> */}

                            <TableHead className="w-[130px] whitespace-nowrap bg-[#184aa6] text-white">
                              मोबाईल क्र.
                            </TableHead>

                            <TableHead className="w-[170px] whitespace-nowrap bg-[#184aa6] text-white">
                              ई-मेल
                            </TableHead>

                            <TableHead className="w-[80px] whitespace-nowrap bg-[#184aa6] text-white">
                              लिंग
                            </TableHead>

                            <TableHead className="w-[220px] whitespace-nowrap bg-[#184aa6] text-white">
                              पत्ता
                            </TableHead>

                            <TableHead className="w-[150px] whitespace-nowrap bg-[#184aa6] text-white">
                              अर्जदाराचा प्रकार
                            </TableHead>

                            <TableHead className="w-[180px] whitespace-nowrap bg-[#184aa6] text-white">
                              संचालकांचे छायाचित्र
                            </TableHead>

                            <TableHead className="w-[110px] whitespace-nowrap bg-[#184aa6] text-white">
                              काढा
                            </TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {directorRows.length > 0 ? (
                            directorRows.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="break-words">
                                  {item.aadharNo}
                                </TableCell>

                                <TableCell className="break-words">
                                  {item.directorName}
                                </TableCell>

                                {/* <TableCell className="break-words">
                                  {item.voterId}
                                </TableCell> */}

                                <TableCell className="whitespace-nowrap">
                                  {item.mobileNo}
                                </TableCell>

                                <TableCell className="break-words">
                                  {item.email}
                                </TableCell>

                                <TableCell className="whitespace-nowrap">
                                  {item.gender}
                                </TableCell>

                                <TableCell className="break-words">
                                  {item.address}
                                </TableCell>

                                <TableCell className="break-words">
                                  {item.applicantType}
                                </TableCell>

                                <TableCell className="break-words">
                                  {item.image?.name || ""}
                                </TableCell>

                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeDirector(item.id)}
                                  >
                                    Remove
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={10}
                                className="py-5 text-center"
                              >
                                No records found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-center gap-3 border-t border-gray-200 pt-6">
                      <Button
                        type="button"
                        onClick={() => setActiveTab("documents")}
                      >
                        पुढे जा
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("primary")}
                      >
                        मागे
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="m-0 px-5 py-6">
                  <div className="w-full overflow-x-auto">
                    <Table className="w-full table-fixed border">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[30%] bg-[#184aa6] text-white">
                            दस्तऐवजाचे नांव
                          </TableHead>
                          <TableHead className="w-[20%] bg-[#184aa6] text-white">
                            शेरा
                          </TableHead>
                          <TableHead className="w-[30%] bg-[#184aa6] text-white">
                            फाईल निवडा
                          </TableHead>
                          <TableHead className="w-[20%] bg-[#184aa6] text-white">
                            Download
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documentRows.length > 0 ? (
                          documentRows.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="break-words align-middle">
                                {item.documentName}
                              </TableCell>

                              <TableCell className="align-middle">
                                <Input
                                  value={item.remark || ""}
                                  onChange={(e) =>
                                    setDocumentRows((prev) =>
                                      prev.map((row) =>
                                        String(row.id) === String(item.id)
                                          ? {
                                              ...row,
                                              remark: e.target.value,
                                            }
                                          : row,
                                      ),
                                    )
                                  }
                                  className="h-9 w-full"
                                />
                              </TableCell>

                              <TableCell className="align-middle">
                                <Input
                                  type="file"
                                  disabled={item.active !== "Y"}
                                  accept=".jpg,.jpeg,.png,.pdf,.docx,.xlsx,.xls"
                                  onChange={(e) =>
                                    handleDocumentFile(
                                      item.id,
                                      e.currentTarget.files?.[0],
                                    )
                                  }
                                  className="h-9 w-full"
                                />
                              </TableCell>

                              <TableCell className="align-middle text-center">
                                {item.fileName && item.fileName !== "" && item.filebyte ? (
                                  <a
                                    href={`data:application/octet-stream;base64,${item.filebyte}`}
                                    download={`${item.documentName}${item.fileName}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    Download ({item.fileName})
                                  </a>
                                ) : (
                                  ""
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="py-8 text-center">
                              No Document Details Found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Self Declaration */}
                  {selfDeclareRows.length > 0 && (
                    <div className="mt-6 border-t border-gray-200 pt-5 text-sm leading-6 text-gray-700">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={values.declarationAccepted}
                          onCheckedChange={(checked) =>
                            setFieldValue(
                              "declarationAccepted",
                              checked === true,
                            )
                          }
                        />
                        <span>
                          {selfDeclareRows
                            .map((item) => item.message)
                            .filter(Boolean)
                            .join(" ")}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="mt-6 flex justify-center gap-3 border-t border-gray-200 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("director")}
                    >
                      मागे
                    </Button>

                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "अर्ज जतन करा"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetForm();
                        setTradeTypeRateRows([]);
                        setDirectorRows([]);
                        setTradeCheckboxRows((prev) => prev.map((r) => ({ ...r, selected: false })));
                        setFieldValue("amount", "0");
                        setActiveTab("primary");
                      }}
                    >
                      रिसेट करा
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default FrmMarketEntry;
