import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ShadCNTable from "@/components/ui/table";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import config from "@/utils/config";
import { z } from "zod";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const ALLOWED_TLDS = new Set([
  "com", "org", "net", "edu", "gov", "mil", "int",
  "in", "co.in", "net.in", "org.in", "gov.in", "ac.in", "edu.in", "res.in",
  "io", "co", "us", "uk", "co.uk", "info", "biz", "me", "app", "dev",
]);

const hasValidTld = (email) => {
  const parts = String(email || "").toLowerCase().split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1];
  const tldCandidates = domain.split(".");
  for (let i = 0; i < tldCandidates.length; i++) {
    const candidate = tldCandidates.slice(i).join(".");
    if (ALLOWED_TLDS.has(candidate)) return true;
  }
  return false;
};

const emailValidationAlt = z.string()
  .transform((val) => {
    if (!val) return val;
    return val.trim().toLowerCase();
  })
  .refine((val) => val && val.length > 0, "Email ID is required")
  .refine((val) => emailRegex.test(val), "Invalid Email Address")
  .refine((val) => hasValidTld(val), "Invalid Email Address");

const initialValues = {
  zoneId: "",
  wardNo: "",
  propertyNo: "",
  ownerNameSearch: "",
  firstName: "",
  firstNameM: "",
  middleName: "",
  middleNameM: "",
  lastName: "",
  lastNameM: "",
  mobileNo: "",
  aadharNo: "",
  email: "",
  address: "",
  addressM: "",
  purpose: "",
  purposeM: "",
  wtSewerageType: "",
  nocPurposeId: "",
  wardId: "",
  usageId: "",
  constId: "",
  propArea: "",
  owner: "",
  propAddress: "",
  regNo: "",
  regDate: "",
  fatherName: "",
  motherName: "",
  approved: false,
};

const FrmNewTaxRecoveryReg = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  const locationState = location.state || {};
  const ulbId = locationState.ulbId || user?.ulbId;
  const userId = locationState.userId || user?.userId;
  const corpId = locationState.corpId || user?.corpId;
  const serviceId = locationState.serviceId || user?.serviceId;
  const serviceName = locationState.serviceName || user?.serviceName;
  const appNo = locationState.appNo || "";

  console.log("locationState :", locationState);

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const authHeader = {
    Authorization: `Bearer ${token || localStorage.getItem("token")}`,
  };

  const [loading, setLoading] = useState(false);
  const [isSearchingProp, setIsSearchingProp] = useState(false);
  const [isSearchingBnd, setIsSearchingBnd] = useState(false);

  const [masterData, setMasterData] = useState({
    wards: [],
    usages: [],
    constructions: [],
    nocPurposes: [],
    waterSewerageTypes: [],
  });

  const [propDetails, setPropDetails] = useState(null);
  const [bndRows, setBndRows] = useState([]);
  const [bndHeader, setBndHeader] = useState("");
  const [propertyFound, setPropertyFound] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBndUniqueNo, setSelectedBndUniqueNo] = useState("");
  const [selectedBndRegNo, setSelectedBndRegNo] = useState("");
  const [mode, setMode] = useState(1);

  const isBndService = ["14", "15"].includes(String(serviceId));
  const isNocService = String(serviceId) === "12";
  const isWaterService = String(serviceId) === "16";
  const isPropSearchHidden = [""].includes(String(serviceId));
  const isKarjatUlb = ["1890", "1150"].includes(String(ulbId));

  useEffect(() => {
    document.title = serviceName || "New Tax Recovery Registration";
    fetchWardList();
    fetchUsageTypeList();
    fetchConstructionTypeList();
    if (isNocService) fetchNocPurposeList();
    if (isWaterService) fetchWaterSewerageTypeList();
    if (userId && ulbId) fetchUserMobile();
    if (appNo) fetchPrefilled(appNo);
  }, [serviceId, ulbId]);

  const fetchWardList = async () => {
    try {
      const resp = await axios.post(
        `${BASE_URL}/api/FrmNewTaxRecoveryReg/ward-list`,
        { ulbID: Number(ulbId) },
        { headers: authHeader },
      );
      setMasterData((p) => ({ ...p, wards: resp.data?.data?.rows || [] }));
    } catch (e) {
      console.error("ward-list:", e);
    }
  };

  const fetchUsageTypeList = async () => {
    try {
      const resp = await axios.post(
        `${BASE_URL}/api/FrmNewTaxRecoveryReg/usage-type-list`,
        {},
        { headers: authHeader },
      );
      setMasterData((p) => ({ ...p, usages: resp.data?.data?.rows || [] }));
    } catch (e) {
      console.error("usage-type-list:", e);
    }
  };

  const fetchConstructionTypeList = async () => {
    try {
      const resp = await axios.post(
        `${BASE_URL}/api/FrmNewTaxRecoveryReg/construction-type-list`,
        {},
        { headers: authHeader },
      );
      setMasterData((p) => ({
        ...p,
        constructions: resp.data?.data?.rows || [],
      }));
    } catch (e) {
      console.error("construction-type-list:", e);
    }
  };

  const fetchNocPurposeList = async () => {
    try {
      const resp = await axios.post(
        `${BASE_URL}/api/FrmNewTaxRecoveryReg/noc-purpose-list`,
        { serviceId: Number(serviceId) },
        { headers: authHeader },
      );
      setMasterData((p) => ({
        ...p,
        nocPurposes: resp.data?.data?.rows || [],
      }));
    } catch (e) {
      console.error("noc-purpose-list:", e);
    }
  };

  const fetchWaterSewerageTypeList = async () => {
    try {
      const resp = await axios.post(
        `${BASE_URL}/api/FrmNewTaxRecoveryReg/water-sewerage-type-list`,
        { serviceId: Number(serviceId) },
        { headers: authHeader },
      );
      setMasterData((p) => ({
        ...p,
        waterSewerageTypes: resp.data?.data?.rows || [],
      }));
    } catch (e) {
      console.error("water-sewerage-type-list:", e);
    }
  };

  const fetchUserMobile = async () => {
    try {
      const resp = await axios.post(
        `${BASE_URL}/api/FrmNewTaxRecoveryReg/user-mobile-number`,
        { userUniqueId: userId, ulbID: Number(ulbId) },
        { headers: authHeader },
      );
      return resp.data?.data?.mobileNumber || "";
    } catch (e) {
      console.error("user-mobile-number:", e);
      return "";
    }
  };

  const fetchPrefilled = async (appNoValue) => {
    try {
      const resp = await axios.post(
        `${BASE_URL}/api/FrmNewTaxRecoveryReg/prefilled-applicant-details`,
        {
          corpId: Number(corpId),
          serviceId: Number(serviceId),
          userId: String(userId),
          ulbID: Number(ulbId),
          appNo: appNoValue,
        },
        { headers: authHeader },
      );
      if (resp.data?.ok && resp.data?.data?.applicantDetails) {
        setMode(resp.data.data.Mode || 2);
      }
    } catch (e) {
      console.error("prefilled:", e);
    }
  };

  const handleSearchProperty = async (values, setFieldValue) => {
    setHasSearched(true);
    setPropertyFound(false);

    if (!values.propertyNo) {
      Swal.fire({
        text: "Please Enter Property Number",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    setIsSearchingProp(true);
    try {
      const resp = await axios.post(
        `${BASE_URL}/api/FrmPropertyAppel/property-details`,
        { propNo: values.propertyNo, userId: String(userId), ulbId: Number(ulbId) },
        { headers: authHeader },
      );
      
      if (resp.data?.ok && resp.data?.data?.propertyOwners) {
        const p = resp.data.data.propertyOwners;
        
        if (p.payamt && parseFloat(p.payamt) > 0) {
          Swal.fire({
            text: `Property tax payment of Rs.${p.payamt} is due, please make the payment first`,
            confirmButtonColor: "#1e3a8a",
            confirmButtonText: "OK",
          });
          return;
        }

        setPropDetails(p);
        setPropertyFound(true);
        
        setFieldValue("wardId", p.wardname || "");
        setFieldValue("usageId", p.usagetype_name || "");
        setFieldValue("constId", p.consttype_name || "");
        setFieldValue("propArea", p.prop_area || "");
        setFieldValue("owner", p.ownername || "");
        setFieldValue("propAddress", p.address || "");

        Swal.fire({
          text: "Property details fetched successfully!",
          confirmButtonColor: "#1e3a8a",
        });
      } else {
        Swal.fire({
          text: "Property Not Found For This Prop No",
          confirmButtonColor: "#1e3a8a",
        });
        setPropDetails(null);
      }
    } catch (err) {
      Swal.fire({
        text: err?.response?.data?.error || "Error fetching property details",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setIsSearchingProp(false);
    }
  };

  const handleBndSearch = async (values) => {
    if (!values.regNo && !values.regDate && !values.fatherName && !values.motherName) {
      Swal.fire({
        text: "Please Enter Reg.no OR Date OR Father Name OR Mother Name",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }
    setIsSearchingBnd(true);
    try {
      const resp = await axios.post(
        `${BASE_URL}/api/FrmNewTaxRecoveryReg/search-bnd-records`,
        {
          serviceId: Number(serviceId),
          registrationNo: values.regNo || "",
          bndDate: values.regDate || "",
          fatherName: values.fatherName || "",
          motherName: values.motherName || "",
        },
        { headers: authHeader },
      );
      if (resp.data?.ok && resp.data?.data) {
        const rows = resp.data.data.data || [];
        setBndRows(rows);
        setBndHeader(resp.data.data.header || "");
        setSelectedBndUniqueNo("");
        setSelectedBndRegNo("");
        if (rows.length === 0) {
          Swal.fire({
            text: "No records found",
            confirmButtonColor: "#1e3a8a",
          });
        }
      }
    } catch (err) {
      Swal.fire({
        text: err?.response?.data?.error || "Something Went Wrong",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setIsSearchingBnd(false);
    }
  };

  const handleSelectBndRow = (row) => {
    setSelectedBndUniqueNo(String(row.UNIQUENO ?? row.uniqueNo ?? ""));
    setSelectedBndRegNo(String(row.REGNO ?? row.regno ?? ""));
  };

  const handleSubmit = async (values) => {
    if (!values.zoneId) return Swal.fire({ text: "Select valid Zone from the list", confirmButtonColor: "#1e3a8a" });
    if (!values.firstName) return Swal.fire({ text: "First Name can not be blank", confirmButtonColor: "#1e3a8a" });
    if (!values.middleName) return Swal.fire({ text: "Middle Name can not be blank", confirmButtonColor: "#1e3a8a" });
    if (!values.lastName) return Swal.fire({ text: "Last Name can not be blank", confirmButtonColor: "#1e3a8a" });
    if (!values.firstNameM) return Swal.fire({ text: "First Name in Marathi can not be blank", confirmButtonColor: "#1e3a8a" });
    if (!values.middleNameM) return Swal.fire({ text: "Middle Name in Marathi can not be blank", confirmButtonColor: "#1e3a8a" });
    if (!values.lastNameM) return Swal.fire({ text: "Last Name in Marathi can not be blank", confirmButtonColor: "#1e3a8a" });
    if (values.mobileNo && values.mobileNo.length !== 10) return Swal.fire({ text: "Invalid Mobile No.", confirmButtonColor: "#1e3a8a" });
    if (!values.email) return Swal.fire({ text: "Email can not be blank", confirmButtonColor: "#1e3a8a" });
    const emailValidationResult = emailValidationAlt.safeParse(values.email);
    if (!emailValidationResult.success) {
      return Swal.fire({ 
        text: emailValidationResult.error.issues[0].message, 
        confirmButtonColor: "#1e3a8a" 
      });
    }
    if (!values.address) return Swal.fire({ text: "Address can not be blank", confirmButtonColor: "#1e3a8a" });
    if (!values.addressM) return Swal.fire({ text: "Address in Marathi can not be blank", confirmButtonColor: "#1e3a8a" });
    if (!values.purpose) return Swal.fire({ text: "Purpose can not be blank", confirmButtonColor: "#1e3a8a" });
    if (!values.purposeM) return Swal.fire({ text: "Purpose in Marathi can not be blank", confirmButtonColor: "#1e3a8a" });
    if (isWaterService && !values.wtSewerageType) return Swal.fire({ text: "Select Water sewarage type from the list", confirmButtonColor: "#1e3a8a" });
    if (isNocService && !values.nocPurposeId) return Swal.fire({ text: "Select NOC Purpose", confirmButtonColor: "#1e3a8a" });
    if (isBndService && !selectedBndUniqueNo) return Swal.fire({ text: "Select Atleast one Record", confirmButtonColor: "#1e3a8a" });
    if (!values.approved) return Swal.fire({ text: "Please Accept the Condition", confirmButtonColor: "#1e3a8a" });

    setLoading(true);
    const loader = Swal.fire({
      title: "Submitting Application...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const bndRecords = isBndService
        ? [{ selected: true, registrationNo: selectedBndRegNo, uniqueNo: selectedBndUniqueNo }]
        : [];

      const payload = {
        ulbID: Number(ulbId),
        corpId: Number(corpId),
        serviceId: Number(serviceId),
        userId: String(userId),
        firstName: values.firstName,
        firstNameM: values.firstNameM,
        middleName: values.middleName,
        middleNameM: values.middleNameM,
        lastName: values.lastName,
        lastNameM: values.lastNameM,
        mobileNo: values.mobileNo,
        aadharNo: values.aadharNo,
        email: emailValidationResult.data,
        address: values.address,
        addressM: values.addressM,
        purpose: values.purpose,
        purposeM: values.purposeM,
        zoneId: values.zoneId ? Number(values.zoneId) : null,
        wardNo: values.wardNo ? Number(values.wardNo) : null,
        propertyNo: values.propertyNo || null,
        mode: mode,
        propertyUsage: null,
        sellerName: null,
        transferToWhom: null,
        agreementDate: null,
        appNo: appNo || "",
        wtsewrgtypeid: isWaterService && values.wtSewerageType ? Number(values.wtSewerageType) : null,
        nocpurposeid: isNocService && values.nocPurposeId ? Number(values.nocPurposeId) : null,
        bndRecords,
        approved: true,
        mahaULBID: "",
        chatbot: "",
        propFlag: propertyFound ? "Y" : "N",
        wardId: values.wardId || null,
        usageId: values.usageId || null,
        constId: values.constId || null,
        propArea: values.propArea || null,
        owner: values.owner || null,
        propAddress: values.propAddress || null,
      };

      const resp = await axios.post(
        `${BASE_URL}/api/FrmNewTaxRecoveryReg/insert-new-tax-application`,
        payload,
        { headers: authHeader },
      );

      loader.close();

      if (!resp.data?.ok || !resp.data?.data?.success) {
        Swal.fire({
          text: resp.data?.message || resp.data?.data?.message || "Application submission failed",
          confirmButtonColor: "#1e3a8a",
        });
        return;
      }

      const data = resp.data.data;
      const applicationNo = data.applicationNo;

      if (isKarjatUlb && ["5", "44", "45", "46", "48", "49", "51", "52", "58", "61", "133"].includes(String(serviceId))) {
        try {
          await axios.post(
            `${BASE_URL}/api/FrmNewTaxRecoveryReg/insert-karjat-module`,
            {
              ulbID: Number(ulbId),
              corpId: Number(corpId),
              serviceId: Number(serviceId),
              userId: String(userId),
              appNo: applicationNo,
              firstName: values.firstName, 
              firstNameM: values.firstNameM,
              middleName: values.middleName, 
              middleNameM: values.middleNameM,
              lastName: values.lastName, 
              lastNameM: values.lastNameM,
              mobileNo: values.mobileNo, 
              aadharNo: values.aadharNo,
              email: emailValidationResult.data, 
              address: values.address, 
              addressM: values.addressM,
              purpose: values.purpose, 
              purposeM: values.purposeM,
              zoneId: values.zoneId ? Number(values.zoneId) : null,
              wardNo: values.wardNo ? Number(values.wardNo) : null,
              propertyNo: values.propertyNo || null,
              propertyUsage: null, sellerName: null, transferToWhom: null,
              wtsewrgtypeid: null, nocpurposeid: isNocService ? Number(values.nocPurposeId) : null,
              regiNo: selectedBndRegNo || null, uniqueNo: selectedBndUniqueNo || null,
              appSource: config.source || "WEB",
            },
            { headers: authHeader },
          );
        } catch (karjatErr) {
          console.warn("Karjat insert failed (non-fatal):", karjatErr?.response?.data || karjatErr.message);
        }
      }

      try {
        const corpResp = await axios.post(
          `${BASE_URL}/api/FrmNewTaxRecoveryReg/get-corporation-code`,
          { ulbID: Number(ulbId) },
          { headers: authHeader },
        );
        const corpCode = corpResp.data?.data?.corporationCode;
        if (corpCode === "AMC") {
          await axios.post(
            `${BASE_URL}/api/FrmNewTaxRecoveryReg/get-amc-no-dues-details`,
            {
              appNo: applicationNo,
              payAmount: 0,
              ulbID: Number(ulbId),
              serviceId: Number(serviceId),
            },
            { headers: authHeader },
          );
        }
      } catch (amcErr) {
        console.warn("AMC step skipped:", amcErr?.response?.data || amcErr.message);
      }

      Swal.fire({
        text: `${data.message}. Application Number: ${applicationNo}` || "Application submitted successfully",
        confirmButtonColor: "#1e3a8a",
      }).then(() => {
        if (["5", "44", "45", "46", "48", "49", "51", "52", "58", "61", "133"].includes(String(serviceId))) {
          navigate("/Step1", { state: { applicationNo, serviceId, ulbId, userId, corpId, serviceName } });
        }
        else {
          navigate("/app/FrmTrackApplication", { state: { applicationNo } });
        }
      });
    } catch (err) {
      loader.close();
      Swal.fire({
        text: err?.response?.data?.error || err?.response?.data?.message || "Error submitting application",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setLoading(false);
    }
  };

  const bndHeaders = ["Select", "Registration No", "Name", "Gender", "Date", "Mother Name", "Father Name", "Copies"];
  const bndKeyMapping = {
    Select: "select",
    "Registration No": "regno",
    Name: "name",
    Gender: "gender",
    Date: "BNDdate",
    "Mother Name": "mothername",
    "Father Name": "fathername",
    Copies: "copies",
  };

  const transformedBnd = bndRows.map((r) => ({
    ...r,
    regno: r.REGNO ?? r.regno,
    name: r.NAME ?? r.name,
    gender: r.GENDER ?? r.gender,
    BNDdate: r.BNDDATE ?? r.BNDdate,
    mothername: r.MOTHERNAME ?? r.mothername,
    fathername: r.FATHERNAME ?? r.fathername,
    copies: r.COPIES ?? r.copies,
    select: (
      <input
        type="radio"
        name="bndSelect"
        checked={selectedBndUniqueNo === String(r.UNIQUENO ?? r.uniqueNo ?? "")}
        onChange={() => handleSelectBndRow(r)}
        className="h-4 w-4"
      />
    ),
  }));

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
      {({ values, handleChange, setFieldValue }) => {
        useEffect(() => {
          fetchUserMobile().then((m) => {
            if (m) setFieldValue("mobileNo", String(m));
          });
        }, []);

        const handleTranslateBlur = async (field, marathiField) => {
          const text = values[field];
          if (!text) return;
          try {
            const resp = await axios.post(
              `${BASE_URL}/api/FrmNewTaxRecoveryReg/translate`,
              { text },
              { headers: authHeader },
            );
            const tr = resp.data?.data?.translated;
            if (tr) setFieldValue(marathiField, tr);
          } catch {}
        };

        const disableSubmit =
          loading ||
          (isBndService
            ? !selectedBndUniqueNo
            : !propertyFound && !isPropSearchHidden && !isBndService);

        return (
          <Form>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg font-semibold">
                    {serviceName || "Applicant Information / अर्जदाराचे माहिती"}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-6">
                  {!isPropSearchHidden && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:col-span-2">
                        <div className="sm:w-40 shrink-0 flex justify-between items-center">
                          <Label required text="Property No" />
                          <span>:</span>
                        </div>
                        <Input
                          name="propertyNo"
                          value={values.propertyNo}
                          onChange={(e) => {
                            handleChange(e);
                            if (propertyFound || hasSearched) {
                              setPropertyFound(false);
                              setHasSearched(false);
                              setPropDetails(null);
                              setFieldValue("wardId", "");
                              setFieldValue("usageId", "");
                              setFieldValue("constId", "");
                              setFieldValue("propArea", "");
                              setFieldValue("owner", "");
                              setFieldValue("propAddress", "");
                            }
                          }}
                          className="w-full h-9"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          className="bg-blue-900 hover:bg-blue-800 text-white"
                          onClick={() => handleSearchProperty(values, setFieldValue)}
                          disabled={isSearchingProp}
                        >
                          {isSearchingProp ? "Searching..." : "Search"}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-y border-gray-300 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Ward" />
                        <span>:</span>
                      </div>
                      <div className="w-full min-h-9 flex items-center px-2">
                        {propDetails?.wardname || ""}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Usage Type" />
                        <span>:</span>
                      </div>
                      <div className="w-full min-h-9 flex items-center px-2">
                        {propDetails?.usagetype_name || ""}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Construction Type" />
                        <span>:</span>
                      </div>
                      <div className="w-full min-h-9 flex items-center px-2">
                        {propDetails?.consttype_name || ""}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Prop Area" />
                        <span>:</span>
                      </div>
                      <div className="w-full min-h-9 flex items-center px-2">
                        {propDetails?.prop_area || ""}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Prop Owner Name" />
                        <span>:</span>
                      </div>
                      <div className="w-full min-h-9 flex items-center px-2">
                        {propDetails?.ownername || ""}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Address" />
                        <span>:</span>
                      </div>
                      <div className="w-full min-h-9 flex items-center px-2">
                        {propDetails?.address || ""}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-40 shrink-0 flex justify-between items-center">
                        <Label required text="Zone" />
                        <span>:</span>
                      </div>
                      <Select value={values.zoneId} onValueChange={(v) => setFieldValue("zoneId", v)}>
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="-- Select Option --" />
                        </SelectTrigger>
                        <SelectContent>
                          {masterData.wards.map((w) => {
                            const id = w.WARDID ?? w.wardid;
                            const name = w.WARDNAME ?? w.wardname;
                            return <SelectItem key={id} value={String(id)}>{name}</SelectItem>;
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-40 shrink-0 flex justify-between items-center">
                          <Label required text="First Name" />
                          <span>:</span>
                        </div>
                      <Input 
                        name="firstName" 
                        value={values.firstName}
                        onChange={handleChange}
                        onBlur={() => handleTranslateBlur("firstName", "firstNameM")}
                        className="h-9" 
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-40 shrink-0 flex justify-between items-center">
                        <Label required text="Middle Name" />
                        <span>:</span>
                      </div>
                      <Input 
                        name="middleName" 
                        value={values.middleName}
                        onChange={handleChange}
                        onBlur={() => handleTranslateBlur("middleName", "middleNameM")}
                        className="h-9" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-40 shrink-0 flex justify-between items-center">
                        <Label required text="Last Name" />
                        <span>:</span>
                      </div>
                      <Input 
                        name="lastName" 
                        value={values.lastName}
                        onChange={handleChange}
                        onBlur={() => handleTranslateBlur("lastName", "lastNameM")}
                        className="h-9" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-40 shrink-0 flex justify-between items-center">
                        <Label required text="प्रथम नाव(मराठी)" className="sm:whitespace-nowrap" />
                        <span>:</span>
                      </div>
                      <Input 
                        name="firstNameM" 
                        value={values.firstNameM} 
                        onChange={handleChange} 
                        className="h-9" 
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-40 shrink-0 flex justify-between items-center">
                        <Label required text="मधले नाव(मराठी)" className="sm:whitespace-nowrap" />
                        <span>:</span>
                      </div>
                      <Input 
                        name="middleNameM" 
                        value={values.middleNameM} 
                        onChange={handleChange} 
                        className="h-9" 
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-40 shrink-0 flex justify-between items-center">
                        <Label required text="आडनाव(मराठी)" className="sm:whitespace-nowrap" />
                        <span>:</span>
                      </div>
                      <Input 
                        name="lastNameM" 
                        value={values.lastNameM} 
                        onChange={handleChange} 
                        className="h-9" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-40 shrink-0 flex justify-between items-center">
                        <Label text="Mobile No" />
                        <span>:</span>
                      </div>
                      <Input name="mobileNo" value={values.mobileNo}
                        onChange={(e) => setFieldValue("mobileNo", e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="h-9" maxLength={10} />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-40 shrink-0 flex justify-between items-center">
                        <Label text="Aadhar Card No" className="sm:whitespace-nowrap" />
                        <span>:</span>
                      </div>
                      <Input name="aadharNo" value={values.aadharNo}
                        onChange={(e) => setFieldValue("aadharNo", e.target.value.replace(/\D/g, "").slice(0, 12))}
                        className="h-9" maxLength={12} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-40 shrink-0 flex justify-between items-center">
                        <Label required text="Email" />
                        <span>:</span>
                      </div>
                      <Input name="email" value={values.email} onChange={handleChange}
                        type="email" className="h-9" maxLength={50} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-40 shrink-0 flex justify-between items-center">
                        <Label required text="Address" />
                        <span>:</span>
                      </div>
                      <Input name="address" value={values.address}
                        onChange={handleChange}
                        onBlur={() => handleTranslateBlur("address", "addressM")}
                        className="h-9" maxLength={1000} />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-40 shrink-0 flex justify-between items-center">
                        <Label required text="पत्ता(मराठी)" />
                        <span>:</span>
                      </div>
                      <Input name="addressM" value={values.addressM} onChange={handleChange}
                        className="h-9" maxLength={1000} />
                    </div>
                  </div>

                  {isWaterService && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-40 shrink-0 flex justify-between items-center">
                          <Label required text="पृष्ठभागाचा प्रकार" />
                          <span>:</span>
                        </div>
                        <Select value={values.wtSewerageType} onValueChange={(v) => setFieldValue("wtSewerageType", v)}>
                          <SelectTrigger className="w-full h-9">
                            <SelectValue placeholder="-- Select --" />
                          </SelectTrigger>
                          <SelectContent>
                            {masterData.waterSewerageTypes.map((s) => {
                              const id = s.NUM_WTSEWARAGE_ID ?? s.num_wtsewarage_id;
                              const name = s.VAR_WTSEWARAGE_NAME ?? s.var_wtsewarage_name;
                              return <SelectItem key={id} value={String(id)}>{name}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-40 shrink-0 flex justify-between items-center">
                        <Label required text="Purpose" />
                        <span>:</span>
                      </div>
                      <Input name="purpose" value={values.purpose} onChange={handleChange}
                        onBlur={() => handleTranslateBlur("purpose", "purposeM")}
                        className="h-9" maxLength={500} />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-40 shrink-0 flex justify-between items-center">
                        <Label required text="उद्देश(मराठी)" />
                        <span>:</span>
                      </div>
                      <Input name="purposeM" value={values.purposeM} onChange={handleChange}
                        className="h-9" maxLength={500} />
                    </div>
                  </div>

                  {isNocService && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-40 shrink-0 flex justify-between items-center">
                          <Label required text="NOC Purpose" />
                          <span>:</span>
                        </div>
                        <Select value={values.nocPurposeId} onValueChange={(v) => setFieldValue("nocPurposeId", v)}>
                          <SelectTrigger className="w-full h-9">
                            <SelectValue placeholder="-- Select --" />
                          </SelectTrigger>
                          <SelectContent>
                            {masterData.nocPurposes.map((n) => {
                              const id = n.VAR_NOCPURPOSE_ID ?? n.var_nocpurpose_id;
                              const name = n.VAR_NOCPURPOSE_NAME ?? n.var_nocpurpose_name;
                              return <SelectItem key={id} value={String(id)}>{name}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {isBndService && (
                    <>
                      <hr />
                      <h3 className="font-bold text-lg">
                        {String(serviceId) === "14" ? "Birth Details" : "Death Details"}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="sm:w-40 shrink-0 flex justify-between items-center">
                            <Label text="Reg. No" />
                            <span>:</span>
                          </div>
                          <Input name="regNo" value={values.regNo} onChange={handleChange} className="h-9" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="sm:w-40 shrink-0 flex justify-between items-center">
                            <Label text={String(serviceId) === "14" ? "Birth Date" : "Death Date"} />
                            <span>:</span>
                          </div>
                          <Input name="regDate" type="date" value={values.regDate} onChange={handleChange} className="h-9" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="sm:w-40 shrink-0 flex justify-between items-center">
                            <Label text="Father Name" />
                            <span>:</span>
                          </div>
                          <Input name="fatherName" value={values.fatherName} onChange={handleChange} className="h-9" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="sm:w-40 shrink-0 flex justify-between items-center">
                            <Label text="Mother Name" />
                            <span>:</span>
                          </div>
                          <Input name="motherName" value={values.motherName} onChange={handleChange} className="h-9" />
                        </div>
                        <div className="flex items-center">
                          <Button type="button" className="bg-blue-900 hover:bg-blue-800 text-white"
                            onClick={() => handleBndSearch(values)} disabled={isSearchingBnd}>
                            {isSearchingBnd ? "Searching..." : "Search"}
                          </Button>
                        </div>
                      </div>

                      {bndRows.length > 0 && (
                        <div className="overflow-x-auto border rounded">
                          <div className="p-2 font-semibold">{bndHeader}</div>
                          <ShadCNTable headers={bndHeaders} data={transformedBnd} keyMapping={bndKeyMapping} pagination={false} />
                        </div>
                      )}
                      <hr />
                    </>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-40 shrink-0 flex justify-between items-center">
                      <Label required text="Approve" />
                    </div>
                    <Input
                      id="approved"
                      type="checkbox"
                      checked={values.approved}
                      onChange={(e) => setFieldValue("approved", e.target.checked)}
                      className="mt-1 h-4 w-4"
                    />
                    <label htmlFor="approved" className="text-sm text-gray-700">
                      All the above filled information are correct; in case of any incorrect information I will be responsible for that.
                    </label>
                  </div>

                  <div className="flex justify-center items-center gap-3 pt-4 border-t">
                    <Button type="submit" className="bg-blue-900 hover:bg-blue-800 text-white" disabled={disableSubmit}>
                      {loading ? "Submitting..." : "Save Details"}
                    </Button>
                    <Button type="button" variant="outline" className="bg-gray-100 hover:bg-gray-200" onClick={() => navigate("/")}>
                      Back
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default FrmNewTaxRecoveryReg;