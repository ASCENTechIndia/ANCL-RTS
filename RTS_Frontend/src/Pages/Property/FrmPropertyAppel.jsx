import React, { useEffect, useState } from "react";
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
import { propertySearchValidationSchema } from "@/validations/global.validation";
import { DatePicker } from "@/components/ui/calendar";
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
  ptn: "",
  firstName: "",
  middleName: "",
  lastName: "",
  billNo: "",
  landHolder: "",
  structureHolder: "",
  ownerDetails: "",
  address: "",
  mobileNo: "",
  emailId: "",
  aadharNo: "",
  telephNo: "",
  objectionType: "",
  objectionDescription: "",
  chkTaxDate: false,
  currentTaxDate: "",
  expectedTaxDate: "",
  chkUsageType: false,
  currentUsageType: "",
  expectedUsageType: "",
  chkUsageSubType: false,
  currentUsageSubType: "",
  expectedUsageSubType: "",
  chkAreaConstruct: false,
  currentAreaConstruct: "",
  expectedAreaConstruct: "",
  chkAnnualTax: false,
  currentAnnualTax: "",
  expectedAnnualTax: "",
  chkTaxable: false,
  currentTaxable: "",
  expectedTaxable: "",
  txtEngfirstName: "",
  txtEngMidName: "",
  txtEnglastname: "",
  txtMarFirstName: "",
  txtMarMiddleName: "",
  txtMarLastName: "",
};

const FrmPropertyAppel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  const locationState = location.state || {};
  const ulbId = locationState.ulbId || user?.ulbId;
  const userId = locationState.userId || user?.userId;
  const corpId = locationState.corpId || user?.corpId;
  const serviceId = locationState.serviceId;
  const serviceName = locationState.serviceName || "Property Appeal";

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token || localStorage.getItem("token")}`,
    },
  };

  const [isLoading, setIsLoading] = useState(false);
  const [propertyFound, setPropertyFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [objections, setObjections] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [zones, setZones] = useState([]);
  const [usageTypes, setUsageTypes] = useState([]);
  const [usageSubTypes, setUsageSubTypes] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const headers = ["Sr No.", "Document Name", "Image(jpg,png,pdf)"];
  const keyMapping = {
    "Sr No.": "srNo",
    "Document Name": "documentName",
    "Image(jpg,png,pdf)": "fileUpload",
  };

  const fetchObjections = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/FrmPropertyAppel/objections`,
        authHeaders
      );
      const rows = res.data?.data?.data || res.data?.data?.objections || [];
      setObjections(
        rows.map((r) => ({
          objectionId: r.objectionId ?? r.NUM_OBJECTION_ID ?? r.num_objection_id,
          objectionName:
            r.objectionName ?? r.VAR_OBJECTION_NAME ?? r.var_objection_name,
        }))
      );
    } catch (err) {
      console.error("Error fetching objections:", err);
      setObjections([]);
    }
  };

  const fetchZones = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/FrmPropertyAppel/wards`,
        { params: { ulbId: Number(ulbId) }, ...authHeaders }
      );
      const rows = res.data?.data?.data || [];
      setZones(
        rows.map((r) => ({
          wardId: r.wardId ?? r.WARDID ?? r.wardid,
          wardName: r.wardName ?? r.WARDNAME ?? r.wardname,
        }))
      );
    } catch (err) {
      console.error("Error fetching wards:", err);
    }
  };

  const fetchUsageTypes = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/FrmPropertyAppel/usage-types`,
        authHeaders
      );
      const rows = res.data?.data?.data || [];
      setUsageTypes(
        rows.map((r) => ({
          usageTypeId: r.usageTypeId ?? r.NUM_USAGETYPE_ID ?? r.num_usagetype_id,
          usageTypeName:
            r.usageTypeName ?? r.VAR_USAGETYPE_NAME ?? r.var_usagetype_name,
        }))
      );
    } catch (err) {
      console.error("Error fetching usage types:", err);
    }
  };

  const fetchUsageSubTypes = async (usageTypeId) => {
    if (!usageTypeId) {
      setUsageSubTypes([]);
      return;
    }
    try {
      const res = await axios.get(
        `${BASE_URL}/api/FrmPropertyAppel/usage-sub-types`,
        { params: { usageTypeId }, ...authHeaders }
      );
      const rows = res.data?.data?.data || [];
      setUsageSubTypes(
        rows.map((r) => ({
          usageSubTypeId:
            r.usageSubTypeId ?? r.NUM_USAGESUBTYPE_ID ?? r.num_usagesubtype_id,
          usageSubTypeName:
            r.usageSubTypeName ??
            r.VAR_USAGESUBTYPE_NAME ??
            r.var_usagesubtype_name,
        }))
      );
    } catch (err) {
      console.error("Error fetching usage sub-types:", err);
    }
  };

  useEffect(() => {
    fetchObjections();
    fetchZones();
    fetchUsageTypes();
  }, [serviceId, ulbId]);

  const getPropertyDetails = async (propNo, userId) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmPropertyAppel/property-details`,
        { propNo, userId, ulbId },
        { ...authHeaders, timeout: 30000 }
      );
      if (res.data?.ok && res.data?.data) return res.data.data;
      return null;
    } catch (err) {
      console.error("getPropertyDetails Error:", err);
      throw err;
    }
  };

  const handleSearchProperty = async (ptn, setFieldValue, resetForm) => {
    const validation = propertySearchValidationSchema.safeParse({ ptn });
    if (!validation.success) {
      Swal.fire({
        text: validation.error.issues[0].message,
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    setIsLoading(true);
    setIsSearching(true);
    setHasSearched(true);

    try {
      setPropertyFound(false);

      const result = await getPropertyDetails(ptn, userId);
      console.log("result: ", result);
      
      if (result && result.propertyOwners) {
        const p = result.propertyOwners;

        if (p.payamt && parseFloat(p.payamt) > 0) {
          Swal.fire({
            text: `Your property tax payment of Rs.${p.payamt} is due, please make the payment first`,
            confirmButtonColor: "#1e3a8a",
          }).then(() => {
            resetForm();
            setHasSearched(false);
          });
          return;
        }

        const splitName = (fullName) => {
          if (!fullName || typeof fullName !== "string") return ["", "", ""];
          const parts = fullName.trim().split(/\s+/);
          return [
            parts[0] || "",
            parts.length > 2 ? parts[1] : "",
            parts.length > 2 ? parts.slice(2).join(" ") : parts[1] || ""
          ];
        };

        const engNameStr = p.ownername || p.land_Holder || "";
        const [engFName, engMName, engLName] = splitName(engNameStr);

        setFieldValue("txtEngfirstName", engFName);
        setFieldValue("txtEngMidName", engMName);
        setFieldValue("txtEnglastname", engLName);
        
        const marNameStr = p.owner_Details || "";
        const [marFName, marMName, marLName] = splitName(marNameStr);

        setFieldValue("txtMarFirstName", marFName);
        setFieldValue("txtMarMiddleName", marMName);
        setFieldValue("txtMarLastName", marLName);

        setFieldValue("address", p.address ?? "");
        setFieldValue(
          "currentTaxDate",
          p.billdt ? new Date(p.billdt).toISOString().split("T")[0] : ""
        );
        setFieldValue("currentUsageType", p.usagetype_name ?? "");
        setFieldValue("currentUsageSubType", p.subusagetype_name ?? "");
        setFieldValue("currentAreaConstruct", p.prop_area ?? "");
        setFieldValue("currentAnnualTax", p.yearlyrent ?? "");
        setFieldValue("currentTaxable", p.num_prop_ratable ?? "");

        setPropertyFound(true);
        Swal.fire({
          text: "Property found successfully!",
          confirmButtonColor: "#1e3a8a",
          timer: 1500,
        });
      } else {
        Swal.fire({
          text: "Property Not Found For This Prop No",
          confirmButtonColor: "#1e3a8a",
        }).then(() => {
          resetForm();
          setHasSearched(false);
        });
      }
    } catch (err) {
      console.error("Search Property Error:", err);
      setHasSearched(false);
      Swal.fire({
        text:
          err?.response?.data?.error ||
          "Error searching property. Please try again.",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const uploadDocument = async (applicationNo, doc) => {
    const fd = new FormData();
    fd.append("corpId", user.corpId);
    fd.append("serviceId", serviceId);
    fd.append("appNo", applicationNo);
    fd.append("docType", doc.docType);
    fd.append("documentId", String(doc.docId));
    fd.append("document", doc.file);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/FrmAssessmentCerti/upload-document`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data.ok === true;
    } catch (err) {
      console.error("Error uploading document:", err);
      return false;
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);
    let loader;

    try {
      const fail = (msg) => {
        Swal.fire({ text: msg, confirmButtonColor: "#1e3a8a" });
        setLoading(false);
      };

      if (!values.zone) return fail("Please select a valid Zone.");

      if (!values.firstName?.trim()) return fail("Please enter First Name.");
      if (!values.middleName?.trim()) return fail("Please enter Middle Name.");
      if (!values.lastName?.trim()) return fail("Please enter Last Name.");

      if (!values.ptn?.trim()) return fail("Please Enter Property Number.");
      if (!propertyFound) return fail("Please search and verify the Property Number first.");

      if (!values.billNo?.trim()) return fail("Please Enter Bill / Tax Notice Number.");

      if (!values.address?.trim()) return fail("Please Enter Property Address.");

      if (!values.mobileNo || values.mobileNo.length !== 10)
        return fail("Please enter a valid 10-digit Mobile No.");
      
      const emailValidationResult = emailValidationAlt.safeParse(values.emailId);
      if (!emailValidationResult.success) {
        return fail(emailValidationResult.error.issues[0].message);
      }
      
      if (!values.aadharNo || values.aadharNo.length !== 12)
        return fail("Please enter a valid 12-digit Aadhar Number.");
        
      if (!values.telephNo || values.telephNo.length !== 10)
        return fail("Please enter a valid 10-digit Telephone Number.");

      if (!values.objectionType) return fail("Please select Objection Type.");
      if (!values.objectionDescription?.trim())
        return fail("Please Enter Objection Description.");

      const missing = tableData.filter((r) => !r.file);
      if (missing.length > 0) {
        return fail(
          `Please upload all required documents. Missing: ${missing
            .map((r) => r.documentName)
            .join(", ")}`
        );
      }

      const documents = tableData
        .filter((r) => r.file)
        .map((r) => ({
          docId: r.docId,
          docName: r.documentName,
          docType: r.docType,
          file: r.file,
        }));

      const payload = {
        userId: String(userId),
        ulbId: String(ulbId),
        zoneId: Number(values.zone),
        serviceId: Number(serviceId),
        propNo: values.ptn,
        bilTaxNo: values.billNo,
        
        landHolder: values.landHolder,
        structHolder: values.structureHolder,
        ownDetails: values.ownerDetails, 
        
        address: values.address,
        appliFName: values.firstName.trim(),
        appliMName: values.middleName.trim(),
        appliLName: values.lastName.trim(),
        mobile: String(values.mobileNo),
        email: emailValidationResult.data,
        aadhar: String(values.aadharNo),
        telephNo: String(values.telephNo),
        objectType: Number(values.objectionType),
        objectDesc: values.objectionDescription,
        taxDate: values.chkTaxDate && values.expectedTaxDate ? values.expectedTaxDate : null,
        usageType: values.chkUsageType ? Number(values.expectedUsageType) || 0 : 0,
        usageSubType: values.chkUsageSubType ? Number(values.expectedUsageSubType) || 0 : 0,
        areaConstruct: values.chkAreaConstruct && values.expectedAreaConstruct ? String(values.expectedAreaConstruct) : null,
        annualTax: values.chkAnnualTax && values.expectedAnnualTax ? String(values.expectedAnnualTax) : null,
        taxable: values.chkTaxable && values.expectedTaxable ? String(values.expectedTaxable) : null,
        
        ownEngFName: values.txtEngfirstName,
        ownEngMName: values.txtEngMidName,
        ownEngLName: values.txtEnglastname,
        ownMraFName: values.txtMarFirstName,
        ownMraMName: values.txtMarMiddleName,
        ownMraLName: values.txtMarLastName,

        appSource: config?.source || "WEB",
      };

      loader = Swal.fire({
        title: "Submitting Application...",
        text: "Please wait ...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.post(
        `${BASE_URL}/api/FrmPropertyAppel/prop-appeal`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.data?.ok || !res.data?.data?.success) {
        loader.close();
        return fail(
          res.data?.data?.message || res.data?.message || "Application submission failed."
        );
      }

      const applicationNo = res.data.data.applicationNo;
      const message = res.data.data.message || "Property Appeal submitted successfully.";

      if (!applicationNo) {
        loader.close();
        return fail("Application created but application number not received.");
      }

      for (const doc of documents) {
        const ok = await uploadDocument(applicationNo, doc);
        if (!ok) {
          loader.close();
          return fail(`Failed to upload document: ${doc.docName}`);
        }
      }

      loader.close();

      Swal.fire({
        text: message,
        confirmButtonColor: "#1e3a8a",
      }).then(() => {
        // navigate("/app/FrmTrackApplication", { state: { applicationNo } });
        if (["5", "44", "45", "46", "48", "49", "51", "52", "58", "61", "133"].includes(String(serviceId))) {
          navigate("/Step1", { state: { applicationNo, serviceId, ulbId, userId, corpId, serviceName } });
        }
        else {
          navigate("/app/FrmTrackApplication", { state: { applicationNo } });
        }
      });
    } catch (err) {
      console.error("Submit error:", err);
      if (loader) loader.close();
      Swal.fire({
        text:
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Error submitting application. Please try again.",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setLoading(false);
    }
  };

  const objectionTableData = [
    {
      id: "taxDate",
      type: "कर मुल्यांकन दिनांक",
      chkKey: "chkTaxDate",
      curKey: "currentTaxDate",
      expKey: "expectedTaxDate",
      inputType: "date",
    },
    {
      id: "usageType",
      type: "वापराचा प्रकार",
      chkKey: "chkUsageType",
      curKey: "currentUsageType",
      expKey: "expectedUsageType",
      options: usageTypes,
      optionValueKey: "usageTypeId",
      optionLabelKey: "usageTypeName",
    },
    {
      id: "usageSubType",
      type: "वापराचा उप प्रकार",
      chkKey: "chkUsageSubType",
      curKey: "currentUsageSubType",
      expKey: "expectedUsageSubType",
      options: usageSubTypes,
      optionValueKey: "usageSubTypeId",
      optionLabelKey: "usageSubTypeName",
    },
    {
      id: "areaConstruct",
      type: "बांधकामाचा क्षेत्रफळ",
      chkKey: "chkAreaConstruct",
      curKey: "currentAreaConstruct",
      expKey: "expectedAreaConstruct",
      isNumberOnly: true,
    },
    {
      id: "annualTax",
      type: "वार्षिक करयोग्य मूल्य",
      chkKey: "chkAnnualTax",
      curKey: "currentAnnualTax",
      expKey: "expectedAnnualTax",
      isNumberOnly: true,
    },
    {
      id: "taxable",
      type: "करयोग्य मूल्य",
      chkKey: "chkTaxable",
      curKey: "currentTaxable",
      expKey: "expectedTaxable",
      isNumberOnly: true,
    },
  ];

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, handleChange, setFieldValue, resetForm }) => (
        <Form>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">
                  {serviceName}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-40 shrink-0 flex justify-between items-center">
                      <Label required text="Zone Id" />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.zone}
                      onValueChange={(v) => setFieldValue("zone", v)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="-- Select Option --" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((w) => (
                          <SelectItem key={w.wardId} value={String(w.wardId)}>
                            {w.wardName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="sm:w-40 shrink-0 flex justify-between items-center">
                    <Label required text="अर्जदाराचे नाव" />
                    <span>:</span>
                  </div>
                  <Input
                    name="firstName"
                    value={values.firstName}
                    onChange={handleChange}
                    placeholder="प्रथम नाव"
                    className="w-full h-9"
                  />
                  <Input
                    name="middleName"
                    value={values.middleName}
                    onChange={handleChange}
                    placeholder="वडिलांचे / पतीचे नाव"
                    className="w-full h-9"
                  />
                  <Input
                    name="lastName"
                    value={values.lastName}
                    onChange={handleChange}
                    placeholder="आडनाव"
                    className="w-full h-9"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-40 shrink-0 flex justify-between items-center">
                      <Label required text="भ्रमणध्वनी क्रमांक" />
                      <span>:</span>
                    </div>
                    <Input
                      name="mobileNo"
                      value={values.mobileNo}
                      onChange={(e) =>
                        setFieldValue(
                          "mobileNo",
                          e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      className="w-full h-9"
                      maxLength={10}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-40 shrink-0 flex justify-between items-center">
                      <Label required text="ईमेल" />
                      <span>:</span>
                    </div>
                    <Input
                      name="emailId"
                      value={values.emailId}
                      onChange={handleChange}
                      type="email"
                      maxLength={50}
                      className="w-full h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-40 shrink-0 flex justify-between items-center">
                      <Label text="आधार क्रमांक" />
                      <span>:</span>
                    </div>
                    <Input
                      name="aadharNo"
                      value={values.aadharNo}
                      onChange={(e) =>
                        setFieldValue(
                          "aadharNo",
                          e.target.value.replace(/\D/g, "").slice(0, 12)
                        )
                      }
                      className="w-full h-9"
                      maxLength={12}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-40 shrink-0 flex justify-between items-center">
                      <Label required text="घरचा टेलीफोन क्रमांक" />
                      <span>:</span>
                    </div>
                    <Input
                      name="telephNo"
                      value={values.telephNo}
                      onChange={(e) =>
                        setFieldValue(
                          "telephNo",
                          e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      className="w-full h-9"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-40 shrink-0 flex justify-between items-center">
                      <Label required text="आक्षेपाचा कशावर" />
                      <span>:</span>
                    </div>
                    <Select
                      value={values.objectionType}
                      onValueChange={(v) => setFieldValue("objectionType", v)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="-- Select Option --" />
                      </SelectTrigger>
                      <SelectContent>
                        {objections.map((o) => (
                          <SelectItem
                            key={o.objectionId}
                            value={String(o.objectionId)}
                          >
                            {o.objectionName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-40 shrink-0 flex justify-between items-center">
                      <Label required text="मालमत्ता क्रमांक" />
                      <span>:</span>
                    </div>
                    <Input
                      name="ptn"
                      value={values.ptn}
                      onChange={(e) => {
                        handleChange(e);
                        if (propertyFound || hasSearched) {
                          setPropertyFound(false);
                          setHasSearched(false);
                        }
                      }}
                      className="w-full h-9"
                    />
                  </div>

                  <div className="flex items-center">
                    <Button
                      type="button"
                      className="bg-blue-900 hover:bg-blue-800 text-white"
                      onClick={() =>
                        handleSearchProperty(values.ptn, setFieldValue, resetForm)
                      }
                      disabled={isSearching}
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-40 shrink-0 flex justify-between items-center">
                      <Label required text="बिल / कर नोटीस क्र." />
                      <span>:</span>
                    </div>
                    <Input
                      name="billNo"
                      value={values.billNo}
                      onChange={handleChange}
                      className="w-full h-9"
                      maxLength={300}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-40 shrink-0 flex justify-between items-center">
                      <Label required text="मालमत्तेचा पत्ता" />
                      <span>:</span>
                    </div>
                    <Input
                      name="address"
                      value={values.address}
                      onChange={handleChange}
                      className="w-full h-9"
                      maxLength={300}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="flex justify-start items-center gap-2">
                    <Label required text="Owner Name (English)" />
                    <span>:</span>
                  </div>
                  <Input
                    name="txtEngfirstName"
                    value={values.txtEngfirstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="w-full h-9"
                  />
                  <Input
                    name="txtEngMidName"
                    value={values.txtEngMidName}
                    onChange={handleChange}
                    placeholder="Middle Name"
                    className="w-full h-9"
                  />
                  <Input
                    name="txtEnglastname"
                    value={values.txtEnglastname}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-full h-9"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="flex justify-start items-center gap-2">
                    <Label required text="मालकाचे नाव (मराठी)" />
                    <span>:</span>
                  </div>
                  <Input
                    name="txtMarFirstName"
                    value={values.txtMarFirstName}
                    onChange={handleChange}
                    placeholder="प्रथम नाव"
                    className="w-full h-9"
                  />
                  <Input
                    name="txtMarMiddleName"
                    value={values.txtMarMiddleName}
                    onChange={handleChange}
                    placeholder="वडिलांचे / पतीचे नाव"
                    className="w-full h-9"
                  />
                  <Input
                    name="txtMarLastName"
                    value={values.txtMarLastName}
                    onChange={handleChange}
                    placeholder="आडनाव"
                    className="w-full h-9"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-40 shrink-0 flex justify-between items-center">
                      <Label required text="आक्षेपाचे वर्णन" />
                      <span>:</span>
                    </div>
                    <Input
                      name="objectionDescription"
                      value={values.objectionDescription}
                      onChange={handleChange}
                      className="w-full h-9"
                    />
                  </div>
                </div>

                <hr />

                <div className="table-responsive">
                  <ShadCNTable
                    headers={["", "आक्षेपाचा प्रकार", "सद्यस्थिती मधील माहिती", "अपेक्षित माहिती"]}
                    keyMapping={{
                      "": "checkboxCell",
                      "आक्षेपाचा प्रकार": "typeCell",
                      "सद्यस्थिती मधील माहिती": "currentCell",
                      "अपेक्षित माहिती": "expectedCell",
                    }}
                    pagination={false}
                    data={objectionTableData.map((row) => ({
                      ...row,
                      checkboxCell: (
                        <div className="flex justify-center">
                          <Input
                            type="checkbox"
                            checked={values[row.chkKey]}
                            onChange={(e) =>
                              setFieldValue(row.chkKey, e.target.checked)
                            }
                          />
                        </div>
                      ),
                      typeCell: <span className="text-left block">{row.type}</span>,
                      currentCell: row.id === "taxDate" ? (
                        <DatePicker
                          value={values[row.curKey]}
                          disabled
                          className="h-9 w-full bg-gray-100"
                        />
                      ) : (
                        <Input
                          value={values[row.curKey]}
                          disabled
                          type={row.inputType || "text"}
                          className="h-9 w-full bg-gray-100"
                        />
                      ),
                      expectedCell: row.id === "taxDate" ? (
                        <DatePicker
                          value={values[row.expKey]}
                          onChange={(date) => setFieldValue(row.expKey, date)}
                          disabled={!values[row.chkKey]}
                          className="h-9 w-full"
                        />
                      ) : row.options ? (
                        <Select
                          value={values[row.expKey]}
                          onValueChange={(v) => {
                            setFieldValue(row.expKey, v);
                            if (row.id === "usageType") fetchUsageSubTypes(v);
                          }}
                          disabled={!values[row.chkKey]}
                        >
                          <SelectTrigger className="h-9 w-full">
                            <SelectValue placeholder="-- Select --" />
                          </SelectTrigger>
                          <SelectContent>
                            {row.options.map((opt) => (
                              <SelectItem
                                key={opt[row.optionValueKey]}
                                value={String(opt[row.optionValueKey])}
                              >
                                {opt[row.optionLabelKey]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={values[row.expKey]}
                          type={row.inputType || "text"}
                          disabled={!values[row.chkKey]}
                          onChange={(e) =>
                            setFieldValue(
                              row.expKey,
                              row.isNumberOnly
                                ? e.target.value.replace(/\D/g, "")
                                : e.target.value
                            )
                          }
                          className="h-9 w-full"
                        />
                      ),
                    }))}
                  />
                </div>

                <hr />

                <div className="flex justify-center items-center gap-3 pt-4 border-t">
                  <Button
                    type="submit"
                    className="bg-blue-900 hover:bg-blue-800 text-white"
                    disabled={loading || !propertyFound}
                  >
                    {loading ? "Submitting..." : "Save"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="bg-gray-100 hover:bg-gray-200"
                    onClick={() => {
                      resetForm();
                      setPropertyFound(false);
                      setHasSearched(false);
                      setUsageSubTypes([]);
                    }}
                  >
                    Reset
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="bg-gray-100 hover:bg-gray-200"
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

export default FrmPropertyAppel;