import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/calendar";
import ShadCNTable from "@/components/ui/table";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const aadharRegex = /^\d{12}$/;
const mobileRegex = /^\d{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FrmMarketLicenseUpdt = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const locationState = location.state || {};

  const [wards, setWards] = useState([]);
  const [tradeCategory, setTradeCategory] = useState([]);
  const [tradeType, setTradeType] = useState([]);
  const [cancelGender, setCancelGender] = useState([]);
  const [cancelRelation, setCancelRelation] = useState([]);
  const [cancelLicType, setCancelLicType] = useState([]);
  const [cancelJwalan, setCancelJwalan] = useState([]);
  const [cancelAdhikrutta, setCancelAdhikrutta] = useState([]);
  const [cancelTrade, setCancelTrade] = useState([]);
  const [buisiGender, setBuisiGender] = useState([]);
  const [buisiJwalan, setBuisiJwalan] = useState([]);
  const [busiNameGender, setBusiNameGender] = useState([]);
  const [applicantType, setApplicantType] = useState([]);
  const [cpApplicant, setCpApplicant] = useState([]);
  const [transRel, setTransRel] = useState([]);
  const [transStat, setTransStat] = useState([]);
  const [nAppliCat, setNAppliCat] = useState([]);
  const [declarations, setDeclarations] = useState([]);
  const [documentDefs, setDocumentDefs] = useState([]);
  const [instructionText, setInstructionText] = useState("");
  const [tradeTypeGrid, setTradeTypeGrid] = useState([]);
  const [removeBusiGrid, setRemoveBusiGrid] = useState([]);
  const [directorGrid, setDirectorGrid] = useState([]);
  const [partnerCorrGrid, setPartnerCorrGrid] = useState([]);
  const [transferGrid, setTransferGrid] = useState([]);
  const [tradeAddrGrid, setTradeAddrGrid] = useState([]);
  const [fileUploadsGrid, setFileUploadsGrid] = useState([]);
  const [uploadDocGrid, setUploadDocGrid] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [tradeCategoryLoading, setTradeCategoryLoading] = useState(false);
  const [tradeTypeLoading, setTradeTypeLoading] = useState(false);
  const ulbId = locationState.ulbId || user?.ulbId;
  const userId = locationState.userId || user?.userId;
  const zoneId = locationState.zoneId || user?.zoneId;
  // const serviceid = 302;
  const serviceid = locationState.serviceId || user?.serviceId;
  const servicename = locationState.serviceName || "";
  const serviceMap = { 306: "TSC", 310: "TLC", 302: "TRBC", 500: "TRBC", 307: "TRNC", 309: "ARPS", 308: "CP", 508: "TTRF", 311: "TEN" };
  const serviceName = serviceMap[String(serviceid)] || "";
  const showTypePanel = ["306", "310", "302", "307", "309", "308", "508", "311"].includes(String(serviceid));
  const showLicensCancelPanel = ["310", "311"].includes(String(serviceid));
  const showLicePanel = String(serviceid) === "310";
  const showExpirePanel = String(serviceid) === "311";
  const showBuisiChangePanel = ["302", "500"].includes(String(serviceid));
  const showBusiNamePanel = String(serviceid) === "307";
  const showAddOwnerPanel = String(serviceid) === "309";
  const showPartnernamecorrPanel = String(serviceid) === "308";
  const showTransferPanel = String(serviceid) === "508";
  const showTradeAddrPanel = String(serviceid) === "ADRC";
  const showBusinessRemPanel = String(serviceid) === "RB";
  const showDocumentPanel = ["306", "310", "302", "307", "309", "308", "311", "508"].includes(String(serviceid));
  const showSelfPanel = ["310", "302", "307", "309", "308", "311"].includes(String(serviceid));

  const initialValues = {
    licenseType: "T",
    licno: locationState.licenseNo || "",
    prabhag: "",
    appliFname: "",
    appliMname: "",
    appliLname: "",
    mobile: "",
    email: "",
    aadhar: "",
    propNo: "",
    residentno: "",
    businessname: "",
    busitype: "",
    tradeAddr: "",
    arrearsAnt: "0",
    cancelGender: "",
    cancelRelation: "",
    cancelLicType: "",
    cancelJwalan: "",
    cancelAdhikrutta: "",
    cancelTrade: "",
    closeDt: "",
    expRel: "",
    reason: "",
    buisiGender: "",
    buisiJwalan: "",
    tradeCategory: "",
    tradeType: "",
    rate: "0",
    remReason: "",
    busiNameGender: "",
    busiNameChange: "",
    directorAdharno: "",
    directorName: "",
    directorMob: "",
    directorEmail: "",
    directorGender: "F",
    directorAddress: "",
    applicantType: "",
    directorImage: null,
    exeName: "",
    newName: "",
    cpAadhar: "",
    rbdCPGender: "F",
    cpAddr: "",
    cpApplicant: "",
    trOPartner: "",
    newPartName: "",
    trAadhar: "",
    transRel: "",
    transStat: "",
    nMob: "",
    nEmail: "",
    rbtnNDirectorGender: "F",
    nResAdd: "",
    nAppliCat: "",
    nDirectorImage: null,
  };

  useEffect(() => {
    if (!ulbId || !serviceid) {
      setPageLoading(false);
      return;
    }

    loadMasters();
  }, [ulbId, serviceid]);

  useEffect(() => {
    if (locationState.licenseNo && ulbId) {
      fetchLicenseDetails(locationState.licenseNo);
      if (showTradeAddrPanel) {
        fetchTradeAddrGrid();
      }
    }
  }, [locationState.licenseNo, ulbId]);

  const loadMasters = async () => {
    setPageLoading(true);

    try {
      const results = await Promise.allSettled([
        fetchWards(),
        fetchCancelGender(),
        fetchCancelRelation(),
        fetchCancelLicType(),
        fetchCancelJwalan(),
        fetchCancelAdhikrutta(),
        fetchCancelTrade(),
        fetchApplicantType(),
        fetchDeclarations(),
        fetchDocumentDefinitions(),
        fetchInstructions(),
      ]);

      const failed = results.filter((item) => item.status === "rejected");

      if (failed.length === results.length) {
        await Swal.fire({
          icon: "error",
          text: "Unable to load application details.",
        });
      }
    } finally {
      setPageLoading(false);
    }
  };

  const fetchWards = async () => {
    const response = await axios.post(
      `${BASE_URL}/api/FrmMarketLicenseupdt/zones`,
      { ulbId },
      {
        headers: { Authorization: `Bearer ${token}` },
      });

    const data = response.data?.data?.rows || response.data?.data || [];
    setWards(data);
    return data;
  };

  const fetchTradeCategory = async (jwalanshilstat, categoryType) => {
    setTradeCategoryLoading(true);

    try {
      if (!jwalanshilstat || !categoryType) {
        setTradeCategory([]);
        return [];
      }

      const response = await axios.post(`${BASE_URL}/api/FrmMarketLicenseupdt/trade-categories`,
        { jwalanshilstat, categoryType },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data?.data?.rows || response.data?.data || [];
      setTradeCategory(Array.isArray(data) ? data : []);

      return data;
    } catch (error) {
      console.error("Trade category fetch error:", error);
      setTradeCategory([]);
      return [];
    } finally {
      setTradeCategoryLoading(false);
    }
  };

  const fetchTradeTypes = async (categoryId, categoryType, jwalanshilstat) => {
    setTradeTypeLoading(true);

    try {
      if (!categoryId || !categoryType) {
        setTradeType([]);
        return [];
      }

      const payload = {
        categoryId: Number(categoryId),
        categoryType: String(categoryType),
      };

      if (Number(serviceid) === 302 || Number(serviceid) === 310) {
        if (jwalanshilstat) {
          payload.jwalanshilstat = String(jwalanshilstat);
        }
      }

      const response = await axios.post(`${BASE_URL}/api/FrmMarketLicenseupdt/trade-types-by-category`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data?.data?.rows || response.data?.data || [];
      setTradeType(Array.isArray(data) ? data : []);

      return data;
    } catch (error) {
      console.error("Trade Types fetch error:", error);
      setTradeType([]);
      return [];
    } finally {
      setTradeTypeLoading(false);
    }
  };

  const fetchCancelGender = async () => {
    const response = await axios.get(`${BASE_URL}/api/FrmMarketLicenseupdt/genders`,
      {
        headers: { Authorization: `Bearer ${token}` },
      });

    const data = response.data?.data?.rows || response.data?.data || [];
    setCancelGender(data);
    setBuisiGender(data);
    setBusiNameGender(data);
    return data;
  };

  const fetchCancelRelation = async () => {
    const response = await axios.get(`${BASE_URL}/api/FrmMarketLicenseupdt/relations`,
      {
        headers: { Authorization: `Bearer ${token}` },
      });

    const data = response.data?.data?.rows || response.data?.data || [];
    setCancelRelation(data);
    setTransRel(data);
    return data;
  };

  const fetchCancelLicType = async () => {
    const response = await axios.get(`${BASE_URL}/api/FrmMarketLicenseupdt/license-types`,
      {
        headers: { Authorization: `Bearer ${token}` },
      });

    const data = response.data?.data?.rows || response.data?.data || [];
    setCancelLicType(data);
    return data;
  };

  const fetchCancelJwalan = async () => {
    const response = await axios.get(`${BASE_URL}/api/FrmMarketLicenseupdt/jalanshil`,
      {
        headers: { Authorization: `Bearer ${token}` },
      });

    const data = response.data?.data?.rows || response.data?.data || [];
    setCancelJwalan(data);
    setBuisiJwalan(data);
    return data;
  };

  const fetchCancelAdhikrutta = async () => {
    const response = await axios.get(`${BASE_URL}/api/FrmMarketLicenseupdt/adhikrtutta`,
      {
        headers: { Authorization: `Bearer ${token}` },
      });

    const data = response.data?.data?.rows || response.data?.data || [];
    setCancelAdhikrutta(data);
    return data;
  };

  const fetchCancelTrade = async () => {
    const response = await axios.get(`${BASE_URL}/api/FrmMarketLicenseupdt/application-status`,
      {
        headers: { Authorization: `Bearer ${token}` },
      });

    const data = response.data?.data?.rows || response.data?.data || [];
    setCancelTrade(data);
    setTransStat(data);
    return data;
  };

  const fetchApplicantType = async () => {
    const response = await axios.post(
      `${BASE_URL}/api/FrmMarketLicenseupdt/application-types`,
      { ulbId },
      {
        headers: { Authorization: `Bearer ${token}` },
      });
    const data = response.data?.data?.rows || response.data?.data || [];
    setApplicantType(data);
    setCpApplicant(data);
    setNAppliCat(data);
    return data;
  };

  const fetchDeclarations = async () => {
    const response = await axios.post(
      `${BASE_URL}/api/FrmMarketLicenseupdt/self-declaration`,
      { serviceId: Number(serviceid) },
      {
        headers: { Authorization: `Bearer ${token}` },
      });

    const data = response.data?.data?.rows || response.data?.data || [];
    setDeclarations(data);
    return data;
  };

  const fetchDocumentDefinitions = async () => {
    const response = await axios.post(
      `${BASE_URL}/api/FrmMarketLicenseupdt/documentsMarket`,
      {
        serviceId: Number(serviceid),
        ulbId,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      });

    const data = response.data?.data?.rows || response.data?.data || [];
    setDocumentDefs(data);
    const rows = data.map((doc, index) => ({
      id: doc.DOCID || doc.DocId || index + 1,
      DocId: doc.DOCID || index + 1,
      docid: doc.DOCID || index + 1,
      DocName: doc.DOCTYPENAME || doc.ENGDOCDESC || "",
      doctypename: doc.DOCTYPENAME || doc.ENGDOCDESC || "",
      remark: doc.REMARK || "",
      file: null,
      fileName: "",
      imageUrl: doc.IMAGEURL || doc.imageUrl || "",
      selected: false,
    }));
    setFileUploadsGrid(rows);
    setUploadDocGrid(rows);
    return data;
  };

  const fetchTradeAddrGrid = async () => {
    const response = await axios.post(
      `${BASE_URL}/api/FrmMarketLicenseupdt/market-application-address`,
      {
        licenseNo: locationState.licenseNo || "",
        ulbId,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      });

    const data = response.data?.data?.rows || response.data?.data || [];
    setTradeAddrGrid(data);
    return data;
  };

  const fetchInstructions = async () => {
    const response = await axios.post(
      `${BASE_URL}/api/FrmMarketLicenseupdt/service-instructions`,
      { serviceId: Number(serviceid) },
      {
        headers: { Authorization: `Bearer ${token}` },
      });

    const data = response.data?.data?.rows || response.data?.data || [];

    if (Array.isArray(data)) {
      setInstructionText(
        data
          .map((item) => item.INST_MARDOCDESC || item.inst_mardocdesc || "")
          .filter(Boolean)
          .join("\n")
      );
    } else {
      setInstructionText(
        data?.INST_MARDOCDESC || data?.inst_mardocdesc || ""
      );
    }

    return data;
  };

  const fetchLicenseDetails = async (licenseNo) => {
    if (!licenseNo || !ulbId) return;

    try {
      Swal.fire({
        title: "Loading...",
        text: "Fetching license details",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await axios.post(
        `${BASE_URL}/api/FrmMarketLicenseupdt/market-license-details`,
        {
          licenseNo,
          ulbId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        });

      const data = response.data?.data;

      if (!data || (Array.isArray(data) && data.length === 0)) {
        Swal.close();
        await Swal.fire({
          icon: "warning",
          text: "License details not found.",
        });
        return;
      }

      const details = Array.isArray(data) ? data[0] : data;

      if (locationState.setFormValues) {
        locationState.setFormValues(details);
      }

      Swal.close();
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to fetch license details.",
      });
    }
  };

  const handleTradeCategoryChange = async (categoryId, categoryType, jwalanshilstat, setFieldValue) => {
    setFieldValue("tradeCategory", categoryId);
    setFieldValue("tradeType", "");
    setFieldValue("rate", "0");
    setTradeType([]);

    if (!categoryId || !categoryType) {
      return;
    }

    await fetchTradeTypes(categoryId, categoryType, jwalanshilstat);
  };

  const handleFileUploadChange = (id, event) => {
    const file = event.currentTarget.files?.[0];

    if (!file) return;

    setFileUploadsGrid((prev) =>
      prev.map((row) =>
        String(row.id) === String(id)
          ? { ...row, file, fileName: file.name }
          : row
      )
    );
  };

  const handleUploadDocFileChange = (id, event) => {
    const file = event.currentTarget.files?.[0];

    if (!file) return;

    setUploadDocGrid((prev) =>
      prev.map((row) =>
        String(row.id) === String(id)
          ? { ...row, file, fileName: file.name }
          : row
      )
    );
  };

  const handleDirectorFileChange = (event, setFieldValue) => {
    const file = event.currentTarget.files?.[0];

    if (file) {
      setFieldValue("directorImage", file);
    }
  };

  const handleTransferFileChange = (event, setFieldValue) => {
    const file = event.currentTarget.files?.[0];

    if (file) {
      setFieldValue("nDirectorImage", file);
    }
  };

  const handleAddToList = (values, setFieldValue) => {
    if (!values.tradeCategory || !values.tradeType) {
      Swal.fire({
        icon: "warning",
        text: "Please select Business Category and Type",
      });
      return;
    }

    const category = tradeCategory.find((item) => String(item.CATEGORY_CATGRYID || item.categoryId || item.id) === String(values.tradeCategory));

    const type = tradeType.find((item) => String(item.CATEGORYTYPE_CATGTYPID || item.tradeTypeId || item.id) === String(values.tradeType));

    const exists = tradeTypeGrid.some((item) => String(item.tradetypeid) === String(values.tradeType));

    if (exists) {
      Swal.fire({
        icon: "warning",
        text: "Trade Type already added.",
      });
      return;
    }

    const newEntry = {
      tradetypeid: values.tradeType,
      tradecategory_id: values.tradeCategory,
      tradecategory: category?.TRADECATEGORY_NAME || category?.name || "",
      tradetype: type?.TRADETYPE_NAME || type?.CATEGORYTYPE_NAME || type?.name || "",
      rate: values.rate || "0",
    };

    const updated = [...tradeTypeGrid, newEntry];
    setTradeTypeGrid(updated);
    setFieldValue("rate", "0");
    setFieldValue("tradeType", "");
  };

  const handleRemoveFromGrid = (gridSetter, index) => {
    gridSetter((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  const handleAddDirector = (values, setFieldValue) => {
    if (
      !values.directorAdharno ||
      !values.directorName ||
      !values.directorMob ||
      !values.directorAddress
    ) {
      Swal.fire({
        icon: "warning",
        text: "Please fill all required director fields",
      });
      return;
    }

    setDirectorGrid((previous) => [
      ...previous,
      {
        id: Date.now(),
        adharno: values.directorAdharno,
        dirctorname: values.directorName,
        mobileno: values.directorMob,
        email: values.directorEmail || "",
        gender:
          values.directorGender === "F"
            ? "स्त्री"
            : values.directorGender === "M"
              ? "पुरुष"
              : "इतर",
        address: values.directorAddress,
        applitypeid: values.applicantType,
        applitypename:
          applicantType.find(
            (item) =>
              String(item.APPLITYPE_ID || item.id) ===
              String(values.applicantType)
          )?.APPLITYPE_NAME ||
          applicantType.find(
            (item) =>
              String(item.APPLITYPE_ID || item.id) ===
              String(values.applicantType)
          )?.name ||
          "",
        image: values.directorImage,
      },
    ]);

    setFieldValue("directorAdharno", "");
    setFieldValue("directorName", "");
    setFieldValue("directorMob", "");
    setFieldValue("directorEmail", "");
    setFieldValue("directorAddress", "");
    setFieldValue("applicantType", "");
    setFieldValue("directorImage", null);
  };

  const handleAddCP = (values, setFieldValue) => {
    if (!values.newName || !values.cpAadhar || !values.cpAddr || !values.cpApplicant) {
      Swal.fire({
        icon: "warning",
        text: "Please fill all required fields",
      });
      return;
    }

    setPartnerCorrGrid((previous) => [
      ...previous,
      {
        id: Date.now(),
        existname: values.exeName || "",
        aadharno: values.cpAadhar,
        gender: values.rbdCPGender === "F" ? "स्त्री" : values.rbdCPGender === "M" ? "पुरुष" : "इतर",
        address: values.cpAddr,
        applitypeid: values.cpApplicant,
        applitypename: cpApplicant.find((item) => String(item.APPLITYPE_ID || item.id) === String(values.cpApplicant))?.APPLITYPE_NAME || cpApplicant.find((item) => String(item.APPLITYPE_ID || item.id) === String(values.cpApplicant))?.name || "",
        newname: values.newName,
      },
    ]);

    setFieldValue("newName", "");
    setFieldValue("cpAadhar", "");
    setFieldValue("cpAddr", "");
    setFieldValue("cpApplicant", "");
  };

  const handleTransferAdd = (values, setFieldValue) => {
    if (!values.newPartName || !values.trAadhar || !values.transRel || !values.transStat) {
      Swal.fire({
        icon: "warning",
        text: "Please fill all required fields",
      });
      return;
    }

    setTransferGrid((previous) => [
      ...previous,
      {
        id: Date.now(),
        dirctorname: values.trOPartner || "",
        adharno: values.trAadhar,
        newname: values.newPartName,
        mobileno: values.nMob || "",
        email: values.nEmail || "",
        gender: values.rbtnNDirectorGender === "F" ? "स्त्री" : values.rbtnNDirectorGender === "M" ? "पुरुष" : "इतर",
        address: values.nResAdd || "",
        applitypeid: values.nAppliCat,
        applitypename: nAppliCat.find((item) => String(item.APPLITYPE_ID || item.id) === String(values.nAppliCat))?.APPLITYPE_NAME || nAppliCat.find((item) => String(item.APPLITYPE_ID || item.id) === String(values.nAppliCat))?.name || "",
        relationid: values.transRel,
        relation: transRel.find((item) => String(item.RELATION_ID || item.id) === String(values.transRel))?.RELATION_NAME || transRel.find((item) => String(item.RELATION_ID || item.id) === String(values.transRel))?.name || "",
        applistatid: values.transStat,
        applistat: transStat.find((item) => String(item.STATUS_ID || item.id) === String(values.transStat))?.STATUS_NAME || transStat.find((item) => String(item.STATUS_ID || item.id) === String(values.transStat))?.name || "",
        image: values.nDirectorImage,
      },
    ]);

    setFieldValue("newPartName", "");
    setFieldValue("trAadhar", "");
    setFieldValue("transRel", "");
    setFieldValue("transStat", "");
    setFieldValue("nMob", "");
    setFieldValue("nEmail", "");
    setFieldValue("nResAdd", "");
    setFieldValue("nAppliCat", "");
    setFieldValue("nDirectorImage", null);
  };

  const handleSelectAllFiles = (checked) => {
    setFileUploadsGrid((previous) =>
      previous.map((row) => ({
        ...row,
        selected: checked,
      }))
    );
  };

  // const handleViewDocument = (docId) => {
  //   const document = fileUploadsGrid.find(
  //     (item) => String(item.id) === String(docId)
  //   );

  //   if (document?.imageUrl) {
  //     window.open(document.imageUrl, "_blank");
  //     return;
  //   }

  //   Swal.fire({
  //     icon: "info",
  //     text: `Document ID: ${docId}`,
  //   });
  // };

  const handleSubmit = async (values, { resetForm }) => {
    if (!values.licno) {
      return Swal.fire({ text: "Please enter License No" });
    }
    if (!values.prabhag) {
      return Swal.fire({ text: "Please select Prabhag" });
    }
    if (!values.appliFname) {
      return Swal.fire({ text: "Please enter Applicant First Name" });
    }
    if (!values.appliMname) {
      return Swal.fire({ text: "Please enter Applicant Middle Name" });
    }
    if (!values.appliLname) {
      return Swal.fire({ text: "Please enter Applicant Last Name" });
    }
    if (!values.mobile || String(values.mobile).length !== 10) {
      return Swal.fire({ text: "Please enter valid 10-digit Mobile Number" });
    }
    if (!values.email) {
      return Swal.fire({ text: "Please enter Email" });
    }
    if (!values.residentno) {
      return Swal.fire({ text: "Please enter Residential Address" });
    }

    if (showLicensCancelPanel) {
      if (showLicePanel) {
        if (!values.cancelGender) {
          return Swal.fire({ text: "Please select लिंग" });
        }
        if (!values.cancelRelation) {
          return Swal.fire({ text: "Please select Relation" });
        }
        if (!values.cancelLicType) {
          return Swal.fire({ text: "Please select License Type" });
        }
        if (!values.cancelJwalan) {
          return Swal.fire({ text: "Please select ज्वलनशील पदार्थांचा / इंधनाचा वापर व साठवणूक करीत आहे?" });
        }
        if (!values.cancelAdhikrutta) {
          return Swal.fire({ text: "Please select Authorized Property" });
        }
        if (!values.cancelTrade) {
          return Swal.fire({ text: "Please select Business Type" });
        }
        if (!values.closeDt) {
          return Swal.fire({ text: "Please select Establishment / Business Closure Date" });
        }
      }
      if (showExpirePanel) {
        if (!values.expRel) {
          return Swal.fire({ text: "Please select Relation" });
        }
      }
      if (!values.reason) {
        return Swal.fire({ text: "Please enter Reason" });
      }
    }

    if (showBuisiChangePanel) {
      if (!values.buisiGender) {
        return Swal.fire({ text: "Please select लिंग" });
      }
      if (!values.buisiJwalan) {
        return Swal.fire({ text: "Please select ज्वलनशील पदार्थांचा / इंधनाचा वापर व साठवणूक करीत आहे?" });
      }
      if (!values.tradeCategory) {
        return Swal.fire({ text: "Please select Business Category" });
      }
      if (!values.tradeType) {
        return Swal.fire({ text: "Please select Business Type" });
      }
      if (!tradeTypeGrid.length) {
        return Swal.fire({ text: "Please add at least one Business Type" });
      }
    }

    if (showBusinessRemPanel) {
      if (!tradeTypeGrid.length) {
        return Swal.fire({ text: "No business types available" });
      }
      if (!values.remReason) {
        return Swal.fire({ text: "Please enter Reason" });
      }
    }

    if (showBusiNamePanel) {
      if (!values.busiNameGender) {
        return Swal.fire({ text: "Please select लिंग" });
      }
      if (!values.busiNameChange) {
        return Swal.fire({ text: "Please enter New Business Name" });
      }
    }

    if (showAddOwnerPanel) {
      if (!values.directorAdharno) {
        return Swal.fire({ text: "Please enter Director Aadhar Number" });
      }
      if (!aadharRegex.test(values.directorAdharno)) {
        return Swal.fire({ text: "Director Aadhar Number must be 12 digits" });
      }
      if (!values.directorName) {
        return Swal.fire({ text: "Please enter Director Name" });
      }
      if (!values.directorMob) {
        return Swal.fire({ text: "Please enter Contact Number" });
      }
      if (!mobileRegex.test(values.directorMob)) {
        return Swal.fire({ text: "Contact Number must be 10 digits" });
      }
      if (values.directorEmail && !emailRegex.test(values.directorEmail)) {
        return Swal.fire({ text: "Please enter a valid Email" });
      }
      if (!values.directorGender) {
        return Swal.fire({ text: "Please select लिंग" });
      }
      if (!values.directorAddress) {
        return Swal.fire({ text: "Please enter Address" });
      }
      if (!values.applicantType) {
        return Swal.fire({ text: "Please select Applicant Type" });
      }
      if (!values.directorImage) {
        return Swal.fire({ text: "Please upload Director Photo" });
      }
      if (!directorGrid.length) {
        return Swal.fire({ text: "Please add at least one Director" });
      }
    }

    if (showPartnernamecorrPanel) {
      if (!values.exeName) {
        return Swal.fire({ text: "Please enter Existing License Holder / Partner Name" });
      }
      if (!values.newName) {
        return Swal.fire({ text: "Please enter New License Holder / Partner Name" });
      }
      if (!values.cpAadhar) {
        return Swal.fire({ text: "Please enter Aadhar Number" });
      }
      if (!aadharRegex.test(values.cpAadhar)) {
        return Swal.fire({ text: "Aadhar Number must be 12 digits" });
      }
      if (!values.rbdCPGender) {
        return Swal.fire({ text: "Please select लिंग" });
      }
      if (!values.cpAddr) {
        return Swal.fire({ text: "Please enter Address" });
      }
      if (!values.cpApplicant) {
        return Swal.fire({ text: "Please select Applicant Type" });
      }
      if (!partnerCorrGrid.length) {
        return Swal.fire({ text: "Please add at least one record" });
      }
    }

    if (showTransferPanel) {
      if (!values.trOPartner) {
        return Swal.fire({ text: "Please enter Existing License Holder / Partner Name" });
      }
      if (!values.newPartName) {
        return Swal.fire({ text: "Please enter New License Holder / Partner Name" });
      }
      if (!values.trAadhar) {
        return Swal.fire({ text: "Please enter Aadhar Number" });
      }
      if (!aadharRegex.test(values.trAadhar)) {
        return Swal.fire({ text: "Aadhar Number must be 12 digits" });
      }
      if (!values.transRel) {
        return Swal.fire({ text: "Please select Relation" });
      }
      if (!values.transStat) {
        return Swal.fire({ text: "Please select Applicant / Business Owner Current Status" });
      }
      if (!values.nMob) {
        return Swal.fire({ text: "Please enter Mobile Number" });
      }
      if (!mobileRegex.test(values.nMob)) {
        return Swal.fire({ text: "Mobile Number must be 10 digits" });
      }
      if (!values.nEmail) {
        return Swal.fire({ text: "Please enter Email" });
      }
      if (!emailRegex.test(values.nEmail)) {
        return Swal.fire({ text: "Please enter a valid Email" });
      }
      if (!values.rbtnNDirectorGender) {
        return Swal.fire({ text: "Please select लिंग" });
      }
      if (!values.nResAdd) {
        return Swal.fire({ text: "Please enter Address" });
      }
      if (!values.nAppliCat) {
        return Swal.fire({ text: "Please select Applicant Type" });
      }
      if (!transferGrid.length) {
        return Swal.fire({ text: "Please add at least one record" });
      }
    }

    setLoading(true);
    try {
      Swal.fire({
        title: "Processing...",
        text: "Submitting application",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const tradechkstr = tradeTypeGrid.map((item) => `${item.tradetypeid || ""}$${item.tradecategory_id || ""}$${item.rate || ""}`).join("#");
      const directorstr = directorGrid.map((item) => `${item.adharno || ""}$${item.dirctorname || ""}$${item.mobileno || ""}$${item.email || ""}$${item.gender || ""}$${item.address || ""}$${item.applitypeid || ""}`).join("#");
      const partnerstr = partnerCorrGrid.map((item) => `${item.applitypeid || ""}$${item.newname || ""}$${item.aadharno || ""}$${item.address || ""}$${item.mobileno || ""}$${item.email || ""}$NEW$${item.gender || ""}`).join("#");
      const corrpartnerstr = partnerCorrGrid.map((item) => `${item.existname || ""}$${item.newname || ""}$${item.aadharno || ""}$${item.gender || ""}$${item.address || ""}$${item.applitypeid || ""}`).join("#");
      const tradeaddrstr = tradeAddrGrid.map((item) => `${item.TRADEADDR_ID || item.tradeaddrid || ""}$${item.TRADEADDR || item.tradeaddr || ""}`).join("#");
      const businesstr = tradeTypeGrid.map((item) => `${item.tradetypeid || ""}$${item.rate || "0"}$${item.tradecategory_id || ""}`).join("#");
      const payload = {
        userId,
        licenseno: values.licno || "",
        appfname: values.appliFname || "",
        appmname: values.appliMname || "",
        applname: values.appliLname || "",
        mobile: values.mobile ? Number(values.mobile) : null,
        email: values.email || "",
        aadhar: values.aadhar ? Number(values.aadhar) : null,
        propno: values.propNo || "",
        address: values.residentno || "",
        remark: values.reason || "",
        newbusiname: values.busiNameChange || values.businessname || "",
        newownfname: values.newName || values.appliFname || "",
        newownmname: values.appliMname || "",
        newownlname: values.appliLname || "",
        newcofname: "",
        newcomname: "",
        newcolname: "",
        ulbid: Number(ulbId),
        servicename: Number(serviceid),
        businesstr,
        partnerstr,
        corrpartnerstr,
        appid: values.appid ? Number(values.appid) : 0,
        tradeaddrstr,
        tradechkstr,
        directorstr,
        rate: 0,
        wardid: values.prabhag ? Number(values.prabhag) : 0,
        zoneid: zoneId ? Number(zoneId) : 0,
        Servid: Number(serviceid),
        Source: "RTS",
        amount: values.amount ? Number(values.amount) : 0,
        Gender: values.buisiGender || values.cancelGender || "",
        Jwalan: values.buisiJwalan || values.cancelJwalan || "",
        Relation: values.transRel ? Number(values.transRel) : values.cancelRelation ? Number(values.cancelRelation) : 0,
        Adhikrutta: values.cancelAdhikrutta ? Number(values.cancelAdhikrutta) : 0,
        LicencType: values.cancelLicType ? Number(values.cancelLicType) : values.licenseType ? Number(values.licenseType) : 0,
        TradeType: values.tradeType ? Number(values.tradeType) : 0,
        CloseDt: values.closeDt || null,
        LicOwner: values.licOwner || "",
        LicType: values.licType || "",
        LicFrmDt: values.licFrmDt || null,
        LicToDt: values.licToDt || null,
        BusiName: values.businessname || "",
        BusiSwarup: values.busitype || "",
        BusiAddr: values.tradeAddr || "",
        type: "ONLINE",
      };

      const response = await axios.post(`${BASE_URL}/api/FrmMarketLicenseupdt/submit`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const submitData = response.data?.data?.data || response.data?.data || response.data;

      if (response.data?.ok === false || submitData?.success === false) {
        throw new Error(response.data?.data.error || submitData?.error || "Application submission failed.");
      }

      let applicationId = Number(submitData?.appid || submitData?.applicationId || submitData?.APPLI_ID || values.appid || locationState.appId || 0);

      if (!applicationId) {
        const licenseResponse = await axios.post(`${BASE_URL}/api/FrmMarketLicenseupdt/market-license-details`,
          { licenseNo: values.licno, ulbId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const licenseData = licenseResponse.data?.data?.rows || licenseResponse.data?.data || [];
        const licenseDetails = Array.isArray(licenseData) ? licenseData[0] : licenseData;
        applicationId = Number(licenseDetails?.APPLI_ID || licenseDetails?.APPLICATION_ID || 0);
      }

      const imageRows = [...directorGrid, ...transferGrid].filter((row) => row.image instanceof File);

      if (imageRows.length) {
        if (!applicationId) {
          throw new Error("Application ID was not returned after submission. Director image cannot be uploaded.");
        }

        const directorResponse = await axios.post(`${BASE_URL}/api/FrmMarketLicenseupdt/trade-director-id`,
          { applicationId },
          { headers: { Authorization: `Bearer ${token}` }, }
        );

        const directorIds = directorResponse.data?.data?.rows || directorResponse.data?.data || [];
        if (!Array.isArray(directorIds) || !directorIds.length) {
          throw new Error("Trade director ID not found after submission.");
        }

        const imageResults = await Promise.allSettled(imageRows.map((row, index) => {
          const directorId = row.directorId || row.DIRECTOR_ID || directorIds[index]?.DIRECTOR_ID || directorIds[index]?.directorId;
          if (!directorId) {
            return Promise.reject(new Error(`Director ID not found for ${row.dirctorname || "director"}.`));
          }
          const formData = new FormData();
          formData.append("directorId", String(directorId));
          formData.append("applicationId", String(applicationId));
          formData.append("document", row.image);
          return axios.post(`${BASE_URL}/api/FrmMarketLicenseupdt/trade-director-image`,
            formData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        })
        );
        const imageFailures = imageResults.map((result, index) => ({ result, name: imageRows[index]?.dirctorname || `Director ${index + 1}` })).filter(({ result }) => result.status === "rejected");
        if (imageFailures.length) {
          throw new Error(
            imageFailures.map(({ name, result }) => `${name}: ${result.reason?.response?.data?.message || result.reason?.message || "Director image upload failed."}`).join("\n"));
        }
      }
      Swal.close();
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: response.data?.message || submitData?.message || "Application submitted successfully.",
        confirmButtonText: "OK",
      });

      resetForm();
      setTradeCategory([]);
      setTradeType([]);
      setTradeTypeGrid([]);
      setRemoveBusiGrid([]);
      setDirectorGrid([]);
      setPartnerCorrGrid([]);
      setTransferGrid([]);
      setTradeAddrGrid([]);
      setFileUploadsGrid([]);
      setUploadDocGrid([]);
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        text: error?.response?.data?.message || error?.response?.data?.error || error?.message || "Unable to submit application.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (resetForm) => {
    resetForm({
      values: initialValues,
    });

    setTradeTypeGrid([]);
    setRemoveBusiGrid([]);
    setDirectorGrid([]);
    setPartnerCorrGrid([]);
    setTransferGrid([]);
    setTradeAddrGrid([]);
    setFileUploadsGrid([]);
    setUploadDocGrid([]);
  };

  const tradeTypeHeaders = [
    "काढा",
    // "tradetype id",
    // "Business CategoryId",
    "Business Category",
    "Business Type",
    // "Rate",
  ];

  const tradeTypeKeyMapping = {
    "काढा": "remove",
    // "tradetype id": "tradetypeid",
    // "Business CategoryId": "tradecategory_id",
    "Business Category": "tradecategory",
    "Business Type": "tradetype",
    // Rate: "rate",
  };

  const directorHeaders = [
    "आधार क्र.",
    "संचालकांचे नांव",
    "मोबाईल क्र.",
    "ईमेल",
    "लिंग",
    "पत्ता",
    "ApplicantTypeId",
    "अर्जदाराचा प्रकार",
    "संचालकांचे छायाचित्र",
    "काढा",
  ];

  const directorKeyMapping = {
    "आधार क्र.": "adharno",
    "संचालकांचे नांव": "dirctorname",
    "मोबाईल क्र.": "mobileno",
    ईमेल: "email",
    लिंग: "gender",
    पत्ता: "address",
    ApplicantTypeId: "applitypeid",
    "अर्जदाराचा प्रकार": "applitypename",
    "संचालकांचे छायाचित्र": "image",
    "काढा": "delete",
  };

  const partnerCorrHeaders = [
    "Sr. No.",
    "परवानाधारक / भागिदाराचे नाव",
    "आधार क्रमांक",
    "लिंग",
    "पत्ता",
    "ApplicantTypeId",
    "अर्जदार प्रकार",
    "नवीन परवानाधारक / भागिदाराचे नाव",
  ];

  const partnerCorrKeyMapping = {
    "Sr. No.": "srNo",
    "परवानाधारक / भागिदाराचे नाव": "existname",
    "आधार क्रमांक": "aadharno",
    लिंग: "gender",
    पत्ता: "address",
    ApplicantTypeId: "applitypeid",
    "अर्जदार प्रकार": "applitypename",
    "नवीन परवानाधारक / भागिदाराचे नाव": "newname",
  };

  const transferHeaders = [
    "परवानाधारक / भागिदाराचे नाव",
    "आधार क्रमांक",
    "नवीन परवानाधारक / भागिदाराचे नाव",
    "मोबाईल क्र.",
    "ई-मेल",
    "लिंग",
    "पत्ता",
    "ApplicantTypeId",
    "अर्जदाराचा प्रकार",
    "RealationId",
    "नाते",
    "ApplicantStatId",
    "अर्जदार / व्यवसाय मालकाची सद्यस्थिती",
    "संचालकांचे छायाचित्र",
    "काढा",
  ];

  const transferKeyMapping = {
    "परवानाधारक / भागिदाराचे नाव": "dirctorname",
    "आधार क्रमांक": "adharno",
    "नवीन परवानाधारक / भागिदाराचे नाव": "newname",
    "मोबाईल क्र.": "mobileno",
    "ई-मेल": "email",
    लिंग: "gender",
    पत्ता: "address",
    ApplicantTypeId: "applitypeid",
    "अर्जदाराचा प्रकार": "applitypename",
    RealationId: "relationid",
    नाते: "relation",
    ApplicantStatId: "applistatid",
    "अर्जदार / व्यवसाय मालकाची सद्यस्थिती": "applistat",
    "संचालकांचे छायाचित्र": "image",
    "काढा": "delete",
  };

  const fileUploadHeaders = [
    // "Doc Id",
    "Select",
    "Document Name",
    // "Image",
    "Document Upload",
    // "View",
  ];

  const fileUploadKeyMapping = {
    // "Doc Id": "DocId",
    Select: "select",
    "Document Name": "DocName",
    Image: "image",
    "Document Upload": "upload",
    // View: "view",
  };

  // const uploadDocHeaders = [
  //   "docid",
  //   "दस्तऐवजाचे नांव",
  //   "शेरा",
  //   "Image",
  //   "फाईल निवडा",
  //   "View",
  // ];

  // const uploadDocKeyMapping = {
  //   docid: "docid",
  //   "दस्तऐवजाचे नांव": "DocName",
  //   शेरा: "remark",
  //   Image: "image",
  //   "फाईल निवडा": "upload",
  //   View: "view",
  // };

  const transformedTradeTypeGrid = tradeTypeGrid.map((item, index) => ({
    ...item,
    remove: (
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => handleRemoveFromGrid(setTradeTypeGrid, index)}
      >
        Remove
      </Button>
    ),
  }));

  const transformedDirectorGrid = directorGrid.map((item, index) => ({
    ...item,
    delete: (
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => handleRemoveFromGrid(setDirectorGrid, index)}
      >
        Delete
      </Button>
    ),
    image: item.image ? (<span>{item.image.name}</span>) : (<span>No Image</span>),
  }));

  const transformedPartnerCorrGrid = partnerCorrGrid.map((item, index) => ({ ...item, srNo: index + 1 }));

  const transformedTransferGrid = transferGrid.map((item, index) => ({
    ...item,
    delete: (
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => handleRemoveFromGrid(setTransferGrid, index)}
      >
        Delete
      </Button>
    ),
    image: item.image ? (<span>{item.image.name}</span>) : (<span>No Image</span>),
  }));

  const transformedFileUploadsGrid = fileUploadsGrid.map((item) => ({
    ...item,
    select: (
      <Checkbox
        checked={item.selected || false}
        onCheckedChange={(checked) => {
          setFileUploadsGrid((previous) => previous.map((row) => row.id === item.id ? { ...row, selected: checked } : row));
        }}
      />
    ),
    // image: item.imageUrl ? (
    //   <img
    //     src={item.imageUrl}
    //     alt="Doc"
    //     className="h-8 w-12 object-contain"
    //   />
    // ) : (<span>No Image</span>),
    upload: (
      <Input
        type="file"
        accept=".png,.jpg,.jpeg,.pdf"
        onChange={(event) =>
          handleFileUploadChange(item.id, event)
        }
        className="h-9 p-1 text-sm"
      />
    ),
    // view: (
    //   <Button
    //     type="button"
    //     variant="outline"
    //     size="sm"
    //     onClick={() => handleViewDocument(item.id)}
    //   >
    //     View
    //   </Button>
    // ),
  }));

  // const transformedUploadDocGrid = uploadDocGrid.map((item) => ({
  //   ...item,
  //   remark: (
  //     <Input
  //       name={`remark_${item.docid}`}
  //       placeholder="शेरा"
  //       className="h-9 w-full"
  //     />
  //   ),
  //   image: item.imageUrl ? (
  //     <img
  //       src={item.imageUrl}
  //       alt="Doc"
  //       className="h-8 w-12 object-contain"
  //     />
  //   ) : (
  //     <span>No Image</span>
  //   ),
  //   upload: (
  //     <Input
  //       type="file"
  //       accept=".png,.jpg,.jpeg,.pdf"
  //       onChange={(event) =>
  //         handleUploadDocFileChange(item.docid, event)
  //       }
  //       className="h-9 p-1 text-sm"
  //     />
  //   ),
  //   view: (
  //     <Button
  //       type="button"
  //       variant="outline"
  //       size="sm"
  //       onClick={() => handleViewDocument(item.docid)}
  //     >
  //       View
  //     </Button>
  //   ),
  // }));


  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
      {({ values, handleChange, setFieldValue, resetForm }) => (
        <Form className="w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full px-2 py-3 "
          >
            <Card className="w-full border shadow-sm">
              <CardHeader className="border-b px-3 py-3 sm:px-5 sm:py-4 md:px-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">{servicename}</CardTitle>
              </CardHeader>

              <CardContent className="p-3 ">
                {instructionText && (
                  <div className="mb-5 rounded-md border border-blue-200 bg-blue-50 p-4">
                    <div className="whitespace-pre-line text-sm text-gray-700">{instructionText}</div>
                  </div>
                )}

                {showTypePanel && (
                  <>
                    <div className="form-group row mb-4">
                      <div className="col-md-12 flex flex-wrap items-center">
                        <Label
                          className="w-32 shrink-0 pr-4 text-right md:w-40"
                          text="Type"
                          required
                        />
                        <div className="flex gap-6">
                          <Input
                            type="radio"
                            name="licenseType"
                            value="T"
                            checked={values.licenseType === "T"}
                            onChange={async (e) => {
                              const categoryType = e.target.value;
                              setFieldValue("licenseType", categoryType);
                              setFieldValue("tradeCategory", "");
                              setFieldValue("tradeType", "");
                              setFieldValue("rate", "0");
                              setTradeCategory([]);
                              setTradeType([]);
                              if (values.buisiJwalan) {
                                await fetchTradeCategory(values.buisiJwalan, categoryType);
                              }
                            }}
                            className="h-4 w-4"
                          />
                          <Label text="Trade" className="flex cursor-pointer items-center gap-2" />

                          <Input
                            type="radio"
                            name="licenseType"
                            value="S"
                            checked={values.licenseType === "S"}
                            onChange={async (e) => {
                              const categoryType = e.target.value;
                              setFieldValue("licenseType", categoryType);
                              setFieldValue("tradeCategory", "");
                              setFieldValue("tradeType", "");
                              setFieldValue("rate", "0");
                              setTradeCategory([]);
                              setTradeType([]);
                              if (values.buisiJwalan) {
                                await fetchTradeCategory(values.buisiJwalan, categoryType);
                              }
                            }}
                            className="h-4 w-4"
                          />
                          <Label text="Storage" className="flex cursor-pointer items-center gap-2" />
                        </div>
                      </div>
                    </div>

                    {/* <hr className="my-4" /> */}
                  </>
                )}

                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <Label
                      className="w-32 shrink-0 md:w-40"
                      text="License No"
                      required
                    />
                    <Input
                      maxLength={15}
                      name="licno"
                      value={values.licno}
                      onChange={handleChange}
                      className="h-9 w-full sm:h-10"
                    />
                  </div>

                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <Label
                      className="w-32 shrink-0 md:w-40"
                      text="प्रभाग समिती"
                      required
                    />
                    <Select
                      value={values.prabhag}
                      onValueChange={(value) =>
                        setFieldValue("prabhag", value)
                      }
                    >
                      <SelectTrigger className="h-9 w-full sm:h-10">
                        <SelectValue placeholder="-- Select --" />
                      </SelectTrigger>
                      <SelectContent>
                        {wards.map((ward, index) => (
                          <SelectItem
                            key={ward.ZONEID || index}
                            value={String(ward.ZONEID)}
                          >
                            {ward.ZONENAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <Label
                      className="w-32 shrink-0 md:w-40"
                      text="Applicant Name"
                      required
                    />
                    <Input
                      name="appliFname"
                      value={values.appliFname}
                      onChange={handleChange}
                      placeholder="Applicant First Name"
                      className="h-9 w-full sm:h-10"
                    />
                  </div>

                  <Input
                    name="appliMname"
                    value={values.appliMname}
                    onChange={handleChange}
                    placeholder="Applicant Middle Name"
                    className="h-9 w-full sm:h-10"
                  />

                  <Input
                    name="appliLname"
                    value={values.appliLname}
                    onChange={handleChange}
                    placeholder="Applicant Last Name"
                    className="h-9 w-full sm:h-10"
                  />
                </div>

                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <Label
                      className="w-32 shrink-0 md:w-40"
                      text="Mobile Number"
                      required
                    />
                    <Input
                      name="mobile"
                      value={values.mobile}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setFieldValue("mobile", value);
                      }}
                      maxLength="10"
                      className="h-9 w-full sm:h-10"
                    />
                  </div>

                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <Label
                      className="w-32 shrink-0 md:w-40"
                      text="Email"
                      required
                    />
                    <Input
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      type="email"
                      className="h-9 w-full sm:h-10"
                      maxLength={30}
                    />
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <Label
                      className="w-32 shrink-0 md:w-40"
                      text="Aadhar Number"
                    />
                    <Input
                      name="aadhar"
                      value={values.aadhar}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setFieldValue("aadhar", value);
                      }}
                      maxLength="12"
                      className="h-9 w-full sm:h-10"
                    />
                  </div>

                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <Label
                      className="w-32 shrink-0 md:w-40"
                      text="Property Number"
                    />
                    <Input
                      name="propNo"
                      value={values.propNo}
                      onChange={handleChange}
                      className="h-9 w-full sm:h-10"
                    />
                  </div>
                </div>

                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:gap-3">
                  <Label
                    className="mt-2 w-32 shrink-0 md:w-40"
                    text="Residential Address"
                    required
                  />
                  <Textarea
                    name="residentno"
                    value={values.residentno}
                    onChange={handleChange}
                    className="min-h-15 w-full"
                  />
                </div>

                {/* <hr className="my-4" /> */}

                {/* <hr className="my-4" /> */}

                {showLicensCancelPanel && (
                  <div className="mb-4">
                    {showLicePanel && (
                      <div>
                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                            <Label
                              className="w-32 shrink-0 md:w-40"
                              text="लिंग"
                              required
                            />
                            <Select
                              value={values.cancelGender || ""}
                              onValueChange={(value) => {
                                console.log("Selected Gender:", value);
                                setFieldValue("cancelGender", value);
                              }}
                            >
                              <SelectTrigger className="h-9 w-full sm:h-10">
                                <SelectValue placeholder="-- Select --" />
                              </SelectTrigger>

                              <SelectContent >
                                {cancelGender.map((item) => (
                                  <SelectItem
                                    key={String(item.GENDER_ID)}
                                    value={String(item.GENDER_ID)}
                                  >
                                    {item.GENDER_NAME}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                            <Label
                              className="w-32 shrink-0 md:w-40"
                              text="नाते"
                              required
                            />
                            <Select
                              value={values.cancelRelation}
                              onValueChange={(value) =>
                                setFieldValue("cancelRelation", value)
                              }
                            >
                              <SelectTrigger className="h-9 w-full sm:h-10">
                                <SelectValue placeholder="-- Select --" />
                              </SelectTrigger>
                              <SelectContent>
                                {cancelRelation.map((item, index) => (
                                  <SelectItem
                                    key={item.id || index}
                                    value={String(item.id)}
                                  >
                                    {item.name ||
                                      item.RELATION_NAME ||
                                      item.RELATION}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                            <Label
                              className="w-32 shrink-0 md:w-40"
                              text="परवानाचा प्रकार"
                              required
                            />
                            <Select
                              value={values.cancelLicType}
                              onValueChange={(value) =>
                                setFieldValue("cancelLicType", value)
                              }
                            >
                              <SelectTrigger className="h-9 w-full sm:h-10">
                                <SelectValue placeholder="-- Select --" />
                              </SelectTrigger>
                              <SelectContent>
                                {cancelLicType.map((item, index) => (
                                  <SelectItem
                                    key={item.id || index}
                                    value={String(item.id)}
                                  >
                                    {item.name ||
                                      item.LICENSE_TYPE_NAME ||
                                      item.LICENSETYPE_NAME}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                            <Label
                              className="w-32 shrink-0 md:w-40"
                              text="ज्वलनशील पदार्थांचा / इंधनाचा वापर व साठवणूक करीत आहे?"
                              required
                            />
                            <Select
                              value={values.cancelJwalan}
                              onValueChange={async (value) => {
                                setFieldValue("buisiJwalan", value);
                                setFieldValue("tradeCategory", "");
                                setFieldValue("tradeType", "");
                                setFieldValue("rate", "0");
                                setTradeCategory([]);
                                setTradeType([]);
                                if (values.licenseType) {
                                  await fetchTradeCategory(value, values.licenseType);
                                }
                              }}
                            >
                              <SelectTrigger className="h-9 w-full sm:h-10">
                                <SelectValue placeholder="-- Select --" />
                              </SelectTrigger>
                              <SelectContent>
                                {cancelJwalan.map((item, index) => (
                                  <SelectItem
                                    key={item.JALANSHIL_CODE || index}
                                    value={String(item.JALANSHIL_CODE)}
                                  >
                                    {item.JALANSHIL_NAME}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                            <Label
                              className="w-32 shrink-0 md:w-40"
                              text="अधिकृत मालमत्ता"
                              required
                            />
                            <Select
                              value={values.cancelAdhikrutta}
                              onValueChange={(value) =>
                                setFieldValue("cancelAdhikrutta", value)
                              }
                            >
                              <SelectTrigger className="h-9 w-full sm:h-10">
                                <SelectValue placeholder="-- Select --" />
                              </SelectTrigger>
                              <SelectContent>
                                {cancelAdhikrutta.map((item, index) => (
                                  <SelectItem
                                    key={item.id || index}
                                    value={String(item.id)}
                                  >
                                    {item.name ||
                                      item.ADHIKRTUTTA_NAME ||
                                      item.ADHIKRUTTA_NAME}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                            <Label
                              className="w-32 shrink-0 md:w-40"
                              text="व्यवसायाचा प्रकार"
                              required
                            />
                            <Select
                              value={values.cancelTrade}
                              onValueChange={(value) =>
                                setFieldValue("cancelTrade", value)
                              }
                            >
                              <SelectTrigger className="h-9 w-full sm:h-10">
                                <SelectValue placeholder="-- Select --" />
                              </SelectTrigger>
                              <SelectContent>
                                {cancelTrade.map((item, index) => (
                                  <SelectItem
                                    key={item.APPLISTAT_ID || index}
                                    value={String(item.APPLISTAT_ID)}
                                  >
                                    {item.APPLISTAT_NAME}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                          <Label
                            className="w-32 shrink-0 md:w-40"
                            text="आस्थापना / व्यवसाय बंद केल्याचा दिनांक"
                            required
                          />
                          <DatePicker
                            value={values.closeDt}
                            onChange={(date) =>
                              setFieldValue("closeDt", date)
                            }
                            className="h-9 w-full md:w-auto sm:h-10"
                          />
                        </div>
                      </div>
                    )}

                    {showExpirePanel && (
                      <div className="mb-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                          <Label
                            className="w-32 shrink-0 md:w-40"
                            text="नाते"
                            required
                          />
                          <Select
                            value={values.expRel}
                            onValueChange={(value) =>
                              setFieldValue("expRel", value)
                            }
                          >
                            <SelectTrigger className="h-9 w-full md:w-64 sm:h-10">
                              <SelectValue placeholder="-- Select --" />
                            </SelectTrigger>
                            <SelectContent>
                              {cancelRelation.map((item, index) => (
                                <SelectItem
                                  key={item.id || index}
                                  value={String(item.id)}
                                >
                                  {item.name ||
                                    item.RELATION_NAME ||
                                    item.RELATION}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:gap-3">
                      <Label
                        className="mt-2 w-32 shrink-0 md:w-40"
                        text="Reason"
                        required
                      />
                      <Input
                        name="reason"
                        value={values.reason}
                        onChange={handleChange}
                        className="h-9 w-full sm:h-10"
                      />
                    </div>
                  </div>
                )}

                {/* <hr className="my-4" /> */}

                {showBuisiChangePanel && (
                  <div className="mb-4">
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="लिंग"
                          required
                        />
                        <Select
                          value={values.buisiGender || ""}
                          onValueChange={(value) => {
                            console.log("Selected Business Gender:", value);
                            setFieldValue("buisiGender", value);
                          }}
                        >
                          <SelectTrigger className="h-9 w-full sm:h-10">
                            <SelectValue placeholder="-- Select --" />
                          </SelectTrigger>

                          <SelectContent >
                            {buisiGender.map((item) => (
                              <SelectItem
                                key={String(item.GENDER_ID)}
                                value={String(item.GENDER_ID)}
                              >
                                {item.GENDER_NAME}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="ज्वलनशील पदार्थांचा / इंधनाचा वापर व साठवणूक करीत आहे?"
                          required
                        />
                        <Select
                          value={values.buisiJwalan || ""}
                          onValueChange={async (value) => {
                            setFieldValue("buisiJwalan", value);

                            setFieldValue("tradeCategory", "");
                            setFieldValue("tradeType", "");
                            setFieldValue("rate", "0");

                            setTradeCategory([]);
                            setTradeType([]);

                            if (values.licenseType) {
                              await fetchTradeCategory(
                                value,
                                values.licenseType
                              );
                            }
                          }}
                        >
                          <SelectTrigger className="h-9 w-full sm:h-10">
                            <SelectValue placeholder="-- Select --" />
                          </SelectTrigger>

                          <SelectContent>
                            {buisiJwalan.map((item, index) => (
                              <SelectItem
                                key={item.JALANSHIL_CODE || index}
                                value={String(item.JALANSHIL_CODE)}
                              >
                                {item.JALANSHIL_NAME}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="Business Category"
                          required
                        />

                        <Select
                          value={values.tradeCategory || ""}
                          onValueChange={(value) =>
                            handleTradeCategoryChange(
                              value,
                              values.licenseType,
                              values.buisiJwalan,
                              setFieldValue
                            )
                          }
                          disabled={
                            !values.buisiJwalan ||
                            !values.licenseType ||
                            tradeTypeLoading
                          }
                        >
                          <SelectTrigger className="h-9 w-full sm:h-10">
                            {tradeTypeLoading ? (
                              <div className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                                <span>Loading...</span>
                              </div>
                            ) : (
                              <SelectValue placeholder="-- Select --" />
                            )}
                          </SelectTrigger>

                          <SelectContent>
                            {tradeCategory?.map((item, index) => {
                              const categoryId =
                                item.CATEGORY_CATGRYID ?? item.id;

                              return (
                                <SelectItem
                                  key={String(categoryId ?? index)}
                                  value={String(categoryId)}
                                >
                                  {item.TRADECATEGORY_NAME ||
                                    item.name ||
                                    item.TRADECATEGORY}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="Business Type"
                          required
                        />
                        <Select
                          value={values.tradeType}
                          onValueChange={(value) => {
                            setFieldValue("tradeType", value);
                            const selected = tradeType.find((item) => String(item.CATEGORYTYPE_CATGTYPID || item.tradeTypeId || item.id) === String(value));

                            setFieldValue("rate", selected?.RATE || selected?.rate || "0");
                          }}
                          disabled={!values.tradeCategory || !values.licenseType}
                        >
                          <SelectTrigger className="h-9 w-full sm:h-10">
                            <SelectValue placeholder="-- Select --" />
                          </SelectTrigger>
                          <SelectContent>
                            {tradeType.map((item, index) => (
                              <SelectItem
                                key={item.CATEGORYTYPE_CATGTYPID || item.tradeTypeId || item.id || index}
                                value={String(item.CATEGORYTYPE_CATGTYPID || item.tradeTypeId || item.id)}
                              >
                                {item.TRADETYPE_NAME || item.CATEGORYTYPE_NAME || item.name || item.TRADETYPE}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>


                    <div className="mb-4 flex justify-center">
                      <Button
                        type="button"
                        onClick={() =>
                          handleAddToList(values, setFieldValue)
                        }
                      >
                        Add to List
                      </Button>
                    </div>

                    <div className="mb-4 overflow-auto">
                      {transformedTradeTypeGrid.length > 0 && (
                        <ShadCNTable
                          headers={tradeTypeHeaders}
                          data={transformedTradeTypeGrid}
                          keyMapping={tradeTypeKeyMapping}
                          pagination={false}
                        />)}
                    </div>
                  </div>
                )}

                {/* <hr className="my-4" /> */}

                {showBusinessRemPanel && (
                  <div className="mb-4">
                    <div className="mb-4 overflow-auto">
                      <ShadCNTable
                        headers={tradeTypeHeaders}
                        data={transformedTradeTypeGrid}
                        keyMapping={tradeTypeKeyMapping}
                        pagination={false}
                      />
                    </div>

                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:gap-3">
                      <Label
                        className="mt-2 w-32 shrink-0 md:w-40"
                        text="Reason"
                        required
                      />
                      <Input
                        name="remReason"
                        value={values.remReason}
                        onChange={handleChange}
                        className="h-9 w-full sm:h-10"
                      />
                    </div>
                  </div>
                )}

                {/* <hr className="my-4" /> */}

                {showBusiNamePanel && (
                  <div className="mb-4">
                    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                      <Label
                        className="w-32 shrink-0 md:w-40"
                        text="लिंग"
                        required
                      />
                      <Select
                        value={values.busiNameGender || ""}
                        onValueChange={(value) =>
                          setFieldValue("busiNameGender", value)
                        }
                      >
                        <SelectTrigger className="h-9 w-full md:w-64 sm:h-10">
                          <SelectValue placeholder="-- Select --" />
                        </SelectTrigger>

                        <SelectContent >
                          {busiNameGender.map((item) => (
                            <SelectItem
                              key={String(item.GENDER_ID)}
                              value={String(item.GENDER_ID)}
                            >
                              {item.GENDER_NAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                      <Label
                        className="w-32 shrink-0 md:w-40"
                        text="New Business Name"
                        required
                      />
                      <Input
                        name="busiNameChange"
                        value={values.busiNameChange}
                        onChange={handleChange}
                        className="h-9 w-full sm:h-10"
                      />
                    </div>
                  </div>
                )}

                {/* <hr className="my-4" /> */}

                {showAddOwnerPanel && (
                  <div className="mb-4">
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="संचालकाचा आधार क्रमांक"
                          required
                        />
                        <Input
                          name="directorAdharno"
                          value={values.directorAdharno}
                          onChange={handleChange}
                          maxLength="12"
                          className="h-9 w-full sm:h-10"
                        />
                      </div>

                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="संचालकाचे नाव"
                          required
                        />
                        <Input
                          name="directorName"
                          value={values.directorName}
                          onChange={handleChange}
                          className="h-9 w-full sm:h-10"
                        />
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="संपर्क क्र."
                          required
                        />
                        <Input
                          name="directorMob"
                          value={values.directorMob}
                          onChange={handleChange}
                          maxLength="10"
                          className="h-9 w-full sm:h-10"
                        />
                      </div>

                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="ई-मेल"
                        />
                        <Input
                          name="directorEmail"
                          value={values.directorEmail}
                          onChange={handleChange}
                          type="email"
                          className="h-9 w-full sm:h-10"
                        />
                      </div>
                    </div>

                    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                      <Label
                        className="w-32 shrink-0 md:w-40"
                        text="लिंग"
                        required
                      />
                      <div className="flex gap-6">
                        {[["F", "स्त्री"], ["M", "पुरुष"], ["O", "इतर"],].map(([value, label]) => (
                          <label
                            key={value}
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <Input
                              type="radio"
                              name="directorGender"
                              value={value}
                              checked={
                                values.directorGender === value
                              }
                              onChange={handleChange}
                              className="h-4 w-4"
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:gap-3">
                      <Label
                        className="mt-2 w-32 shrink-0 md:w-40"
                        text="पत्ता"
                        required
                      />
                      <Textarea
                        name="directorAddress"
                        value={values.directorAddress}
                        onChange={handleChange}
                        className="min-h-15 w-full"
                      />
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="अर्जदार प्रकार"
                          required
                        />
                        <Select
                          value={values.applicantType}
                          onValueChange={(value) =>
                            setFieldValue("applicantType", value)
                          }
                        >
                          <SelectTrigger className="h-9 w-full sm:h-10">
                            <SelectValue placeholder="-- Select --" />
                          </SelectTrigger>
                          <SelectContent>
                            {applicantType.map((item, index) => (
                              <SelectItem
                                key={item.APPLITYPE_ID || index}
                                value={String(item.APPLITYPE_ID || item.id)}
                              >
                                {item.APPLITYPE_NAME || item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="संचालकाचा फोटो"
                          required
                        />
                        <Input
                          type="file"
                          accept=".png,.jpg,.jpeg"
                          onChange={(event) =>
                            handleDirectorFileChange(
                              event,
                              setFieldValue
                            )
                          }
                          className="h-9 w-full sm:h-10"
                        />
                      </div>
                    </div>

                    <div className="mb-4 flex justify-center">
                      <Button
                        type="button"
                        onClick={() =>
                          handleAddDirector(values, setFieldValue)
                        }
                      >
                        Add Director
                      </Button>
                    </div>
                    {transformedDirectorGrid.length > 0 &&
                      <ShadCNTable
                        headers={directorHeaders}
                        data={transformedDirectorGrid}
                        keyMapping={directorKeyMapping}
                        pagination={false}
                      />
                    }

                  </div>
                )}

                {/* <hr className="my-4" /> */}

                {showPartnernamecorrPanel && (
                  <div className="mb-4">
                    <h3 className="mb-3 font-semibold">
                      <u>Existing Details</u>
                    </h3>

                    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                      <Label
                        className="w-32 shrink-0 md:w-40"
                        text="परवानाधारक / भागिदाराचे नाव"
                        required
                      />
                      <Input
                        name="exeName"
                        value={values.exeName}
                        onChange={handleChange}
                        className="h-9 w-full sm:h-10"
                      />
                    </div>

                    {/* <hr className="my-4" /> */}

                    <h3 className="mb-3 font-semibold">
                      <u>New Details</u>
                    </h3>

                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="नवीन परवानाधारक / भागिदाराचे नाव"
                          required
                        />
                        <Input
                          name="newName"
                          value={values.newName}
                          onChange={handleChange}
                          className="h-9 w-full sm:h-10"
                        />
                      </div>

                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="आधार क्रमांक"
                          required
                        />
                        <Input
                          name="cpAadhar"
                          value={values.cpAadhar}
                          onChange={handleChange}
                          maxLength="12"
                          className="h-9 w-full sm:h-10"
                        />
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="लिंग"
                          required
                        />
                        <div className="flex gap-6">
                          {[
                            ["F", "स्त्री"],
                            ["M", "पुरुष"],
                            ["O", "इतर"],
                          ].map(([value, label]) => (
                            <label
                              key={value}
                              className="flex cursor-pointer items-center gap-2"
                            >
                              <Input
                                type="radio"
                                name="rbdCPGender"
                                value={value}
                                checked={
                                  values.rbdCPGender === value
                                }
                                onChange={handleChange}
                                className="h-4 w-4"
                              />
                              <span>{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:gap-3">
                        <Label
                          className="mt-2 w-32 shrink-0 md:w-40"
                          text="पत्ता"
                          required
                        />
                        <Textarea
                          name="cpAddr"
                          value={values.cpAddr}
                          onChange={handleChange}
                          className="min-h-15 w-full"
                        />
                      </div>
                    </div>

                    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                      <Label
                        className="w-32 shrink-0 md:w-40"
                        text="अर्जदार प्रकार"
                        required
                      />
                      <Select
                        value={values.cpApplicant}
                        onValueChange={(value) =>
                          setFieldValue("cpApplicant", value)
                        }
                      >
                        <SelectTrigger className="h-9 w-full md:w-64 sm:h-10">
                          <SelectValue placeholder="-- Select --" />
                        </SelectTrigger>
                        <SelectContent>
                          {cpApplicant.map((item, index) => (
                            <SelectItem
                              key={item.APPLITYPE_ID || item.id || index}
                              value={String(item.APPLITYPE_ID || item.id)}
                            >
                              {item.APPLITYPE_NAME || item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mb-4 flex justify-center">
                      <Button
                        type="button"
                        onClick={() =>
                          handleAddCP(values, setFieldValue)
                        }
                      >
                        Add Director
                      </Button>
                    </div>

                    <ShadCNTable
                      headers={partnerCorrHeaders}
                      data={transformedPartnerCorrGrid}
                      keyMapping={partnerCorrKeyMapping}
                      pagination={false}
                    />
                  </div>
                )}

                {/* <hr className="my-4" /> */}

                {showTransferPanel && (
                  <div className="mb-4">
                    <h3 className="mb-3 font-semibold"><u>Existing Details</u></h3>

                    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                      <Label
                        className="w-32 shrink-0 md:w-40"
                        text="परवानाधारक / भागिदाराचे नाव"
                        required
                      />
                      <Input
                        name="trOPartner"
                        value={values.trOPartner}
                        onChange={handleChange}
                        className="h-9 w-full sm:h-10"
                      />
                    </div>

                    {/* <hr className="my-4" /> */}

                    <h3 className="mb-3 font-semibold">
                      <u>New Details</u>
                    </h3>

                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="नवीन परवानाधारक / भागिदाराचे नाव"
                          required
                        />
                        <Input
                          name="newPartName"
                          value={values.newPartName}
                          onChange={handleChange}
                          className="h-9 w-full sm:h-10"
                        />
                      </div>

                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="आधार क्रमांक"
                          required
                        />
                        <Input
                          name="trAadhar"
                          value={values.trAadhar}
                          onChange={handleChange}
                          maxLength="12"
                          className="h-9 w-full sm:h-10"
                        />
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="नाते"
                          required
                        />
                        <Select
                          value={values.transRel}
                          onValueChange={(value) =>
                            setFieldValue("transRel", value)
                          }
                        >
                          <SelectTrigger className="h-9 w-full sm:h-10">
                            <SelectValue placeholder="-- Select --" />
                          </SelectTrigger>
                          <SelectContent>
                            {transRel.map((item, index) => (
                              <SelectItem
                                key={item.RELATION_ID || index}
                                value={String(item.RELATION_ID)}
                              >
                                {item.RELATION_NAME}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="अर्जदार / व्यवसाय मालकाची सद्यस्थिती"
                          required
                        />
                        <Select
                          value={values.transStat}
                          onValueChange={(value) =>
                            setFieldValue("transStat", value)
                          }
                        >
                          <SelectTrigger className="h-9 w-full sm:h-10">
                            <SelectValue placeholder="-- Select --" />
                          </SelectTrigger>
                          <SelectContent>
                            {transStat.map((item, index) => (
                              <SelectItem
                                key={item.id || index}
                                value={String(item.id)}
                              >
                                {item.name ||
                                  item.STATUS_NAME ||
                                  item.APPLICATION_STATUS}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="मोबाईल क्र."
                          required
                        />
                        <Input
                          name="nMob"
                          value={values.nMob}
                          onChange={handleChange}
                          maxLength="10"
                          className="h-9 w-full sm:h-10"
                        />
                      </div>

                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="ई-मेल"
                          required
                        />
                        <Input
                          name="nEmail"
                          value={values.nEmail}
                          onChange={handleChange}
                          type="email"
                          className="h-9 w-full sm:h-10"
                        />
                      </div>
                    </div>

                    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                      <Label
                        className="w-32 shrink-0 md:w-40"
                        text="लिंग"
                        required
                      />
                      <div className="flex gap-6">
                        {[["F", "स्त्री"], ["M", "पुरुष"], ["O", "इतर"]].map(([value, label]) => (
                          <label
                            key={value}
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <Input
                              type="radio"
                              name="rbtnNDirectorGender"
                              value={value}
                              checked={
                                values.rbtnNDirectorGender === value
                              }
                              onChange={handleChange}
                              className="h-4 w-4"
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:gap-3">
                      <Label
                        className="mt-2 w-32 shrink-0 md:w-40"
                        text="पत्ता"
                      />
                      <Textarea
                        name="nResAdd"
                        value={values.nResAdd}
                        onChange={handleChange}
                        className="min-h-15 w-full"
                      />
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="अर्जदार प्रकार"
                          required
                        />
                        <Select
                          value={values.nAppliCat}
                          onValueChange={(value) =>
                            setFieldValue("nAppliCat", value)
                          }
                        >
                          <SelectTrigger className="h-9 w-full sm:h-10">
                            <SelectValue placeholder="-- Select --" />
                          </SelectTrigger>
                          <SelectContent>
                            {nAppliCat.map((item, index) => (
                              <SelectItem key={item.APPLITYPE_ID || item.id || index} value={String(item.APPLITYPE_ID || item.id)}>
                                {item.APPLITYPE_NAME || item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Label
                          className="w-32 shrink-0 md:w-40"
                          text="संचालकाचा फोटो"
                        />
                        <Input
                          type="file"
                          accept=".png,.jpg,.jpeg"
                          onChange={(event) =>
                            handleTransferFileChange(event, setFieldValue)
                          }
                          className="h-9 w-full sm:h-10"
                        />
                      </div>
                    </div>

                    <div className="mb-4 flex justify-center">
                      <Button
                        type="button"
                        onClick={() =>
                          handleTransferAdd(values, setFieldValue)
                        }
                      >
                        Add Director
                      </Button>
                    </div>

                    <div className="overflow-auto">
                      <ShadCNTable
                        headers={transferHeaders}
                        data={transformedTransferGrid}
                        keyMapping={transferKeyMapping}
                        pagination={false}
                      />
                    </div>
                  </div>
                )}

                {/* <hr className="my-4" /> */}

                {showTradeAddrPanel && (
                  <div className="mb-4 overflow-auto">
                    <ShadCNTable
                      headers={[
                        "ID",
                        "Existing Address",
                        "New Address",
                      ]}
                      data={tradeAddrGrid.map((item) => ({
                        id: item.APPLI_ID || item.id,
                        existingAddress: item.APPLI_ADDRESS || item.var_appli_address || "",
                        newAddress: (
                          <Textarea
                            className="min-h-15 w-full"
                            placeholder="Enter new address"
                          />
                        ),
                      }))}
                      keyMapping={{
                        ID: "id",
                        "Existing Address": "existingAddress",
                        "New Address": "newAddress",
                      }}
                      pagination={false}
                    />
                  </div>
                )}

                {/* <hr className="my-4" /> */}

                {showDocumentPanel && (
                  <>
                    <div className="mb-4 overflow-auto">
                      <div className="mb-2 flex items-center gap-2">
                        <Checkbox
                          checked={
                            fileUploadsGrid.length > 0 &&
                            fileUploadsGrid.every(
                              (row) => row.selected
                            )
                          }
                          onCheckedChange={handleSelectAllFiles}
                        />
                        <Label text="Select All" />
                      </div>

                      <ShadCNTable
                        headers={fileUploadHeaders}
                        data={transformedFileUploadsGrid}
                        keyMapping={fileUploadKeyMapping}
                        pagination={false}
                      />
                    </div>

                    {/* <hr className="my-4" /> */}

                    {/* <div className="mb-4 overflow-auto">
                      <ShadCNTable
                        headers={uploadDocHeaders}
                        data={transformedUploadDocGrid}
                        keyMapping={uploadDocKeyMapping}
                        pagination={false}
                      />
                    </div> */}
                  </>
                )}

                {showSelfPanel && (
                  <div className="mb-4">
                    <div className="flex flex-col items-center">
                      {declarations.map((item, index) => (
                        <div
                          key={item.ID || item.id || index}
                          className="mb-2 flex w-full max-w-3xl items-start gap-2"
                        >
                          <Checkbox
                            id={`decl-${index}`}
                            className="mt-1"
                          />
                          {item.MESSAGE || item.Message || item.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* <hr className="my-4" /> */}

                <div className="flex flex-col items-stretch justify-center gap-3 pt-4 sm:flex-row sm:items-center">
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleReset(resetForm)}
                  >
                    Reset
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                  >
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Form>
      )}
    </Formik>
  );
};

export default FrmMarketLicenseUpdt;