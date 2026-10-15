import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";

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
import { DatePicker } from "@/components/ui/calendar";
import ShadCNTable from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import config from "@/utils/config";
import {
  marriageRegistrationSchema,
  documentGridValidationSchema,
} from "@/validations/global.validation";

const emptyPerson = {
  photo: null,
  photoPreview: "",
  thumb: null,
  thumbPreview: "",
  englishFirstName: "",
  englishMiddleName: "",
  englishLastName: "",
  marathiFirstName: "",
  marathiMiddleName: "",
  marathiLastName: "",
  aadharNo: "",
  contact: "",
  email: "",
  birthDate: null,
  age: "",
  documentType: "",
  documentNo: "",
  relation: "",
  maritalStatus: "",
  disability: "N",
  birthReligion: "",
  adoptedReligion: "",
  englishAddress: "",
  marathiAddress: "",
  idDocument: "",
  idDocumentFile: null,
  addressDocument: "",
  addressDocumentFile: null,
  ageDocument: "",
  ageDocumentFile: null,
};

const initialValues = {
  application: {
    zone: "",
    applicantFirstName: "",
    applicantMiddleName: "",
    applicantLastName: "",
    mobileNo: "",
    address: "",
    marriageDate: null,
    marriagePlaceEnglish: "",
    marriagePlaceMarathi: "",
    documents: [],
  },
  husband: { ...emptyPerson },
  wife: { ...emptyPerson },
  witness1: { ...emptyPerson },
  witness2: { ...emptyPerson },
  witness3: { ...emptyPerson },
  priest: { ...emptyPerson },
};

const tabs = [
  { value: "application", label: "Application Entry" },
  { value: "husband", label: "Husband Details" },
  { value: "wife", label: "Wife Details" },
  { value: "witness1", label: "Witness1 Details" },
  { value: "witness2", label: "Witness2 Details" },
  { value: "witness3", label: "Witness3 Details" },
  { value: "priest", label: "Priest Details" },
];

function FrmMarriageRgstn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  const locationState = location.state || {};
  const serviceId = locationState.serviceId;
  const serviceName = locationState.serviceName ;
  const serviceRate = locationState.serviceRate ;
  const serviceUrl = locationState.serviceUrl;

  const [activeTab, setActiveTab] = useState("application");
  const [loading, setLoading] = useState(false);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [religionOptions, setReligionOptions] = useState([]);
  const [documentOptions, setDocumentOptions] = useState([]);
  const [addressDocOptions, setAddressDocOptions] = useState([]);
  const [ageDocOptions, setAgeDocOptions] = useState([]);
  const [relationOptions, setRelationOptions] = useState([]);
  const [documentDefs, setDocumentDefs] = useState([]);

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const ulbId = user?.ulbId;
  const userId = user?.userId;
  const corpId = user?.corpId;

  useEffect(() => {
    document.title = serviceName;
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const tokenValue = token || localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${tokenValue}` };

      const zoneRes = await axios.post(
        `${BASE_URL}/api/FrmMarriageRgstn/zones`,
        { ulbId },
        { headers },
      );
      if (zoneRes.data.ok) {
        setZoneOptions(zoneRes.data.data.rows || []);
      }

      const statusRes = await axios.post(
        `${BASE_URL}/api/FrmMarriageRgstn/previous-status`,
        {},
        { headers },
      );
      if (statusRes.data.ok) {
        setStatusOptions(statusRes.data.data.rows || []);
      }

      const religionRes = await axios.post(
        `${BASE_URL}/api/FrmMarriageRgstn/religion-list`,
        {},
        { headers },
      );
      if (religionRes.data.ok) {
        setReligionOptions(religionRes.data.data.rows || []);
      }

      const idDocRes = await axios.post(
        `${BASE_URL}/api/FrmMarriageRgstn/id-documents`,
        {},
        { headers },
      );
      if (idDocRes.data.ok) {
        setDocumentOptions(idDocRes.data.data.rows || []);
      }

      const addressDocRes = await axios.post(
        `${BASE_URL}/api/FrmMarriageRgstn/address-documents`,
        {},
        { headers },
      );
      if (addressDocRes.data.ok) {
        setAddressDocOptions(addressDocRes.data.data.rows || []);
      }

      const ageDocRes = await axios.post(
        `${BASE_URL}/api/FrmMarriageRgstn/age-documents`,
        {},
        { headers },
      );
      if (ageDocRes.data.ok) {
        setAgeDocOptions(ageDocRes.data.data.rows || []);
      }

      const relationRes = await axios.post(
        `${BASE_URL}/api/FrmMarriageRgstn/relations`,
        {},
        { headers },
      );
      if (relationRes.data.ok) {
        setRelationOptions(relationRes.data.data.rows || []);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const calculateAgeFromAPI = async (marriageDate, birthDate, setFieldValue, fieldName) => {
    if (!marriageDate || !birthDate) return;
    
    try {
      const tokenValue = token || localStorage.getItem("token");
      const formattedMarriageDate = new Date(marriageDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).replace(/ /g, '-');
      
      const formattedBirthDate = new Date(birthDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).replace(/ /g, '-');
      
      const response = await axios.post(
        `${BASE_URL}/api/FrmMarriageRgstn/calculate-age`,
        {
          marriageDate: formattedMarriageDate,
          birthDate: formattedBirthDate,
        },
        { headers: { Authorization: `Bearer ${tokenValue}` } }
      );
      
      if (response.data.ok && response.data.data?.age !== undefined) {
        setFieldValue(fieldName, String(response.data.data.age));
      }
    } catch (error) {
      console.error("Error calculating age:", error);
    }
  };

  const handleFile = (setFieldValue, path, previewPath, file) => {
    setFieldValue(path, file || null);
    if (!file) {
      setFieldValue(previewPath, "");
      return;
    }
    const preview = URL.createObjectURL(file);
    setFieldValue(previewPath, preview);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    try {
      const validationResult = marriageRegistrationSchema.safeParse(values);
      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        const fieldPath = firstError.path.join(".");
        // const tabMap = {
        //   zone: "application",
        //   applicantFirstName: "application",
        //   applicantMiddleName: "application",
        //   applicantLastName: "application",
        //   mobileNo: "application",
        //   address: "application",
        //   marriageDate: "application",
        //   marriagePlaceEnglish: "application",
        //   marriagePlaceMarathi: "application",
        // };
        // let tab = "application";
        // for (const [key, value] of Object.entries(tabMap)) {
        //   if (fieldPath.includes(key)) {
        //     tab = value;
        //     break;
        //   }
        // }
        // setActiveTab(tab);
        Swal.fire({
          text: firstError.message,
          confirmButtonColor: "#1e3a8a",
          confirmButtonText: "OK",
          allowOutsideClick: false,
        });
        setLoading(false);
        setSubmitting(false);
        return;
      }

      const personConfigs = [
        { key: "husband",  label: "Husband",  needsPhoto: true, needsThumb: true, needsBeforeMarriageDocs: true },
        { key: "wife",     label: "Wife",     needsPhoto: true, needsThumb: true, needsBeforeMarriageDocs: true },
        { key: "witness1", label: "Witness 1", needsPhoto: true, needsThumb: true, needsBeforeMarriageDocs: false },
        { key: "witness2", label: "Witness 2", needsPhoto: true, needsThumb: true, needsBeforeMarriageDocs: false },
        { key: "witness3", label: "Witness 3", needsPhoto: true, needsThumb: true, needsBeforeMarriageDocs: false },
      ];

      for (const cfg of personConfigs) {
        const person = values[cfg.key] || {};
        const tabValue = cfg.key;

        if (cfg.needsPhoto && !person.photo) {
          setActiveTab(tabValue);
          Swal.fire({
            text: `${cfg.label}: Photo is required`,
            confirmButtonColor: "#1e3a8a",
            confirmButtonText: "OK",
            allowOutsideClick: false,
          });
          setLoading(false);
          setSubmitting(false);
          return;
        }

        if (cfg.needsThumb && !person.thumb) {
          setActiveTab(tabValue);
          Swal.fire({
            text: `${cfg.label}: Thumb Impression is required`,
            confirmButtonColor: "#1e3a8a",
            confirmButtonText: "OK",
            allowOutsideClick: false,
          });
          setLoading(false);
          setSubmitting(false);
          return;
        }

        if (cfg.needsBeforeMarriageDocs) {
          if (!person.idDocument) {
            setActiveTab(tabValue);
            Swal.fire({
              text: `${cfg.label}: Please Select ID Document`,
              confirmButtonColor: "#1e3a8a",
              confirmButtonText: "OK",
              allowOutsideClick: false,
            });
            setLoading(false);
            setSubmitting(false);
            return;
          }
          if (!person.idDocumentFile) {
            setActiveTab(tabValue);
            Swal.fire({
              text: `${cfg.label}: Please upload ID Document file`,
              confirmButtonColor: "#1e3a8a",
              confirmButtonText: "OK",
              allowOutsideClick: false,
            });
            setLoading(false);
            setSubmitting(false);
            return;
          }

          if (!person.addressDocument) {
            setActiveTab(tabValue);
            Swal.fire({
              text: `${cfg.label}: Please Select Address Document`,
              confirmButtonColor: "#1e3a8a",
              confirmButtonText: "OK",
              allowOutsideClick: false,
            });
            setLoading(false);
            setSubmitting(false);
            return;
          }
          if (!person.addressDocumentFile) {
            setActiveTab(tabValue);
            Swal.fire({
              text: `${cfg.label}: Please upload Address Document file`,
              confirmButtonColor: "#1e3a8a",
              confirmButtonText: "OK",
              allowOutsideClick: false,
            });
            setLoading(false);
            setSubmitting(false);
            return;
          }

          if (!person.ageDocument) {
            setActiveTab(tabValue);
            Swal.fire({
              text: `${cfg.label}: Please Select Age Document`,
              confirmButtonColor: "#1e3a8a",
              confirmButtonText: "OK",
              allowOutsideClick: false,
            });
            setLoading(false);
            setSubmitting(false);
            return;
          }
          if (!person.ageDocumentFile) {
            setActiveTab(tabValue);
            Swal.fire({
              text: `${cfg.label}: Please upload Age Document file`,
              confirmButtonColor: "#1e3a8a",
              confirmButtonText: "OK",
              allowOutsideClick: false,
            });
            setLoading(false);
            setSubmitting(false);
            return;
          }
        }
      }

      const normalizedHusbandEmail = validationResult.data.husband?.email || "";
      const normalizedWifeEmail = validationResult.data.wife?.email || "";

      console.log("normalizedHusbandEmail: ", normalizedHusbandEmail);
      console.log("normalizedWifeEmail: ", normalizedWifeEmail);

      const docs = values.application.documents || [];
      const docValidation = documentGridValidationSchema.safeParse(docs);
      if (!docValidation.success) {
        setActiveTab("application");
        Swal.fire({
          text:
            docValidation.error.issues[0]?.message ||
            "All documents are compulsory. Please select and upload all required documents.",
          confirmButtonColor: "#1e3a8a",
          confirmButtonText: "OK",
          allowOutsideClick: false,
        });
        setLoading(false);
        setSubmitting(false);
        return;
      }

      const loader = Swal.fire({
        title: "Submitting Application...",
        text: "Please wait while we process your application.",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = buildPayload(values, normalizedHusbandEmail, normalizedWifeEmail);
      console.log("Submit Payload:", payload);

      const tokenValue = token || localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/FrmMarriageRgstn/submit`,
        payload,
        { headers: { Authorization: `Bearer ${tokenValue}` } },
      );

      if (!response.data.ok) {
        Swal.fire({
          text: response.data.error || "Application submission failed",
          confirmButtonColor: "#1e3a8a",
          confirmButtonText: "OK",
          allowOutsideClick: false,
        });
        setLoading(false);
        setSubmitting(false);
        return;
      }

      const applicationNo = response.data.data?.applicationNo;
      const mrrgdtlid = response.data.data?.mrrgdtlid;
      const mrrgid = response.data.data?.mrrgid;
      const message = response.data.data?.message || "Application submitted successfully";
      const payFlag = response.data.data?.payFlag || "N";

      await uploadAllDocuments(applicationNo, mrrgdtlid, mrrgid, values);

      loader.close();

      Swal.fire({
        text: message,
        confirmButtonColor: "#1e3a8a",
        confirmButtonText: "OK",
        allowOutsideClick: false,
      }).then(() => {
        navigate("/app/FrmAppoints", {
          state: { 
            appNo: applicationNo,
            mode: "1" 
          },
        });
        // if (payFlag === "Y") {
        //   navigate("/app/FrmAppliFee", { state: { applicationNo, serviceId } });
        // } else {
        //   navigate("/app/FrmTrackApplication", { state: { applicationNo } });
        // }
      });
    } catch (error) {
      console.error("Submit Error:", error);
      Swal.fire({
        text:
          error?.response?.data?.error ||
          "Error submitting application. Please try again.",
        confirmButtonColor: "#1e3a8a",
        confirmButtonText: "OK",
        allowOutsideClick: false,
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const buildPayload = (values, normalizedHusbandEmail, normalizedWifeEmail) => {
    const app = values.application;
    const h = values.husband;
    const w = values.wife;
    const w1 = values.witness1;
    const w2 = values.witness2;
    const w3 = values.witness3;
    const p = values.priest;

    const selectedDocs = app.documents.filter((d) => d.selected === true);

    return {
      ulbId,
      userId,
      corpId,
      serviceId,
      zoneId: app.zone,
      appliFname: app.applicantFirstName,
      appliMname: app.applicantMiddleName,
      appliLname: app.applicantLastName,
      appliMobile: app.mobileNo,
      appliAddre: app.address,
      regDate: new Date().toISOString().split("T")[0],
      mrrgDate: app.marriageDate
        ? new Date(app.marriageDate).toISOString().split("T")[0]
        : null,
      placeEng: app.marriagePlaceEnglish,
      placeMar: app.marriagePlaceMarathi,
      documentIds: selectedDocs.map((d) => String(d.id)),
      deliveryFlag: "Y",
      appSource: config.source || "WEB",
      hefname: h.englishFirstName,
      hemname: h.englishMiddleName,
      helname: h.englishLastName,
      hmfname: h.marathiFirstName,
      hmmname: h.marathiMiddleName,
      hmlname: h.marathiLastName,
      headdress: h.englishAddress,
      hmaddress: h.marathiAddress,
      hMobile: h.contact,
      hmstatus: h.maritalStatus,
      hphysichall: h.disability === "Y" ? "1" : "0",
      hbirthdt: h.birthDate
        ? new Date(h.birthDate).toISOString().split("T")[0]
        : null,
      hbirthreligion: h.birthReligion,
      hadopreligion: h.adoptedReligion,
      // hemail: h.email,
      hemail: normalizedHusbandEmail || h.email,
      hiddoc: h.idDocument,
      haddresdoc: h.addressDocument,
      hagedoc: h.ageDocument,
      haadharno: h.aadharNo,
      wefname: w.englishFirstName,
      wemname: w.englishMiddleName,
      welname: w.englishLastName,
      wmfname: w.marathiFirstName,
      wmmname: w.marathiMiddleName,
      wmlname: w.marathiLastName,
      weaddress: w.englishAddress,
      wmaddress: w.marathiAddress,
      wMobile: w.contact,
      wmstatus: w.maritalStatus,
      wphysichall: w.disability === "Y" ? "1" : "0",
      wbirthdt: w.birthDate
        ? new Date(w.birthDate).toISOString().split("T")[0]
        : null,
      wbirthreligion: w.birthReligion,
      wadopreligion: w.adoptedReligion,
      // wemail: w.email,
      wemail: normalizedWifeEmail || w.email,
      widdoc: w.idDocument,
      waddresdoc: w.addressDocument,
      wagedoc: w.ageDocument,
      waadharno: w.aadharNo,
      w1efname: w1.englishFirstName,
      w1emname: w1.englishMiddleName,
      w1elname: w1.englishLastName,
      w1mfname: w1.marathiFirstName,
      w1mmname: w1.marathiMiddleName,
      w1mlname: w1.marathiLastName,
      w1docid: w1.documentType,
      w1relationid: w1.relation,
      w1mobileno: w1.contact,
      w1eaddre: w1.englishAddress,
      w1maddre: w1.marathiAddress,
      w1birthdt: w1.birthDate
        ? new Date(w1.birthDate).toISOString().split("T")[0]
        : null,
      w2efname: w2.englishFirstName,
      w2emname: w2.englishMiddleName,
      w2elname: w2.englishLastName,
      w2mfname: w2.marathiFirstName,
      w2mmname: w2.marathiMiddleName,
      w2mlname: w2.marathiLastName,
      w2docid: w2.documentType,
      w2relationid: w2.relation,
      w2mobileno: w2.contact,
      w2eaddre: w2.englishAddress,
      w2maddre: w2.marathiAddress,
      w2birthdt: w2.birthDate
        ? new Date(w2.birthDate).toISOString().split("T")[0]
        : null,
      w3efname: w3.englishFirstName,
      w3emname: w3.englishMiddleName,
      w3elname: w3.englishLastName,
      w3mfname: w3.marathiFirstName,
      w3mmname: w3.marathiMiddleName,
      w3mlname: w3.marathiLastName,
      w3docid: w3.documentType,
      w3relationid: w3.relation,
      w3mobileno: w3.contact,
      w3eaddre: w3.englishAddress,
      w3maddre: w3.marathiAddress,
      w3birthdt: w3.birthDate
        ? new Date(w3.birthDate).toISOString().split("T")[0]
        : null,
      prefname: p.englishFirstName,
      premname: p.englishMiddleName,
      prelname: p.englishLastName,
      prmfname: p.marathiFirstName,
      prmmname: p.marathiMiddleName,
      prmlname: p.marathiLastName,
      prage: p.age,
      prreligion: p.birthReligion,
      preaddress: p.englishAddress,
      prmaddress: p.marathiAddress,
    };
  };

  const uploadAllDocuments = async (applicationNo, mrrgdtlid, mrrgid, values) => {
    const tokenValue = token || localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${tokenValue}` };

    const selectedDocs = values.application.documents.filter(d => d.selected === true);
    for (const doc of selectedDocs) {
      if (doc.file && doc.id) {
        const formData = new FormData();
        formData.append("corpId", corpId);
        formData.append("serviceId", serviceId);
        formData.append("appNo", applicationNo);
        formData.append("docType", "S");
        formData.append("documentId", String(doc.id));
        formData.append("document", doc.file);

        await axios.post(
          `${BASE_URL}/api/FrmMarriageRgstn/upload-grid-document`,
          formData,
          { headers: { ...headers, "Content-Type": "multipart/form-data" } }
        );
      }
    }

    const husPhoto = values.husband.photo;
    const husThumb = values.husband.thumb;
    if (husPhoto || husThumb) {
      const formData = new FormData();
      formData.append("mrrgdtlidId", mrrgdtlid);
      formData.append("mrrgid", mrrgid);
      if (husPhoto) formData.append("photo", husPhoto);
      if (husThumb) formData.append("thumb", husThumb);

      await axios.post(
        `${BASE_URL}/api/FrmMarriageRgstn/upload-husband-images`,
        formData,
        { headers: { ...headers, "Content-Type": "multipart/form-data" } }
      );
    }

    const wifePhoto = values.wife.photo;
    const wifeThumb = values.wife.thumb;
    if (wifePhoto || wifeThumb) {
      const formData = new FormData();
      formData.append("mrrgdtlidId", mrrgdtlid);
      formData.append("mrrgid", mrrgid);
      if (wifePhoto) formData.append("photo", wifePhoto);
      if (wifeThumb) formData.append("thumb", wifeThumb);

      await axios.post(
        `${BASE_URL}/api/FrmMarriageRgstn/upload-wife-images`,
        formData,
        { headers: { ...headers, "Content-Type": "multipart/form-data" } }
      );
    }

    const witnesses = [
      { key: "witness1", number: 1, values: values.witness1 },
      { key: "witness2", number: 2, values: values.witness2 },
      { key: "witness3", number: 3, values: values.witness3 },
    ];

    for (const witness of witnesses) {
      const photo = witness.values.photo;
      const thumb = witness.values.thumb;
      if (photo || thumb) {
        const formData = new FormData();
        formData.append("mrrgdtlidId", mrrgdtlid);
        formData.append("mrrgid", mrrgid);
        formData.append("witnessNumber", String(witness.number));
        if (photo) formData.append("photo", photo);
        if (thumb) formData.append("thumb", thumb);

        await axios.post(
          `${BASE_URL}/api/FrmMarriageRgstn/upload-witness-images`,
          formData,
          { headers: { ...headers, "Content-Type": "multipart/form-data" } }
        );
      }
    }

    const husbandDocs = [
      { key: "idDocument", docId: values.husband.idDocument, file: values.husband.idDocumentFile, flag: "BR", docFlag: "IdDoc" },
      { key: "addressDocument", docId: values.husband.addressDocument, file: values.husband.addressDocumentFile, flag: "BR", docFlag: "AddDoc" },
      { key: "ageDocument", docId: values.husband.ageDocument, file: values.husband.ageDocumentFile, flag: "BR", docFlag: "AgDoc" },
    ];

    for (const doc of husbandDocs) {
      if (doc.docId && doc.file) {
        const formData = new FormData();
        formData.append("mrrgdtlid", mrrgdtlid);
        formData.append("mrrgdocid", String(doc.docId));
        formData.append("flag", doc.flag);
        formData.append("mrrgdocflag", doc.docFlag);
        formData.append("userId", userId);
        formData.append("ulbId", ulbId);
        formData.append("document", doc.file);

        await axios.post(
          `${BASE_URL}/api/FrmMarriageRgstn/upload-before-marriage-doc`,
          formData,
          { headers: { ...headers, "Content-Type": "multipart/form-data" } }
        );
      }
    }

    const wifeDocs = [
      { key: "idDocument", docId: values.wife.idDocument, file: values.wife.idDocumentFile, flag: "GR", docFlag: "IdDoc" },
      { key: "addressDocument", docId: values.wife.addressDocument, file: values.wife.addressDocumentFile, flag: "GR", docFlag: "AddDoc" },
      { key: "ageDocument", docId: values.wife.ageDocument, file: values.wife.ageDocumentFile, flag: "GR", docFlag: "AgDoc" },
    ];

    for (const doc of wifeDocs) {
      if (doc.docId && doc.file) {
        const formData = new FormData();
        formData.append("mrrgdtlid", mrrgdtlid);
        formData.append("mrrgdocid", String(doc.docId));
        formData.append("flag", doc.flag);
        formData.append("mrrgdocflag", doc.docFlag);
        formData.append("userId", userId);
        formData.append("ulbId", ulbId);
        formData.append("document", doc.file);

        await axios.post(
          `${BASE_URL}/api/FrmMarriageRgstn/upload-before-marriage-doc`,
          formData,
          { headers: { ...headers, "Content-Type": "multipart/form-data" } }
        );
      }
    }
  };

  const getStatusOptions = () =>
    statusOptions.map((item) => ({
      value: String(item.NUM_MSTATUS_ID || item.num_mstatus_id),
      label: item.VAR_MSTATUS_NAME || item.var_mstatus_name,
    }));

  const getReligionOptions = () =>
    religionOptions.map((item) => ({
      value: String(item.NUM_RELIGION_ID || item.num_religion_id),
      label: item.VAR_RELIGION_RELIGION || item.var_religion_religion,
    }));

  const getDocumentOptions = (options) =>
    options.map((item) => ({
      value: String(item.NUM_DOCUMENT_ID || item.num_document_id),
      label: item.VAR_DOCUMENT_NAME || item.var_document_name,
    }));

  const getRelationOptions = () =>
    relationOptions.map((item) => ({
      value: String(item.NUM_RELATION_ID || item.num_relation_id),
      label: item.VAR_RELATION_ENAME || item.var_relation_ename,
    }));

  const getZoneOptions = () =>
    zoneOptions.map((item) => ({
      value: String(item.WARDID || item.wardid),
      label: item.WARDNAME || item.wardname,
    }));

  const disabilityOptions = [
    { value: "N", label: "नाही" },
    { value: "Y", label: "होय" },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-100 p-3">
      <div className="mx-auto w-full max-w-[1600px]">
        <Card className="border shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-semibold">{serviceName}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Formik
              initialValues={initialValues}
              onSubmit={handleSubmit}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {({ values, setFieldValue, isSubmitting }) => {
              
                useEffect(() => {
                  const fetchDocumentDefinitions = async () => {
                    try {
                      const tokenValue = token || localStorage.getItem("token");
                      const response = await axios.post(
                        `${BASE_URL}/api/FrmMarriageRgstn/document-definitions`,
                        { corpId, serviceId, ulbId },
                        { headers: { Authorization: `Bearer ${tokenValue}` } }
                      );
                      if (response.data.ok) {
                        const docs = response.data.data.rows || [];
                        setDocumentDefs(docs);
                        const docList = docs.map((doc, index) => ({
                          id: doc.NUM_DOCUMENT_ID || doc.num_document_id || index + 1,
                          selected: false,
                          documentType: doc.VAR_DOCUMENT_NAME || doc.var_document_name || `Document ${index + 1}`,
                          file: null,
                          fileName: "",
                        }));
                        setFieldValue("application.documents", docList);
                      }
                    } catch (error) {
                      console.error("Error fetching document definitions:", error);
                    }
                  };
                  fetchDocumentDefinitions();
                }, []);

                return (
                  <Form className="w-full">
                    <div className="p-4 md:p-5">
                      <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                      >
                        <div className="w-full border-b border-slate-200">
                          <TabsList className="h-auto min-w-max justify-start gap-1 rounded-none bg-transparent p-0">
                            {tabs.map((tab) => (
                              <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="
                                  rounded-none
                                  border-b-2
                                  border-transparent
                                  bg-transparent
                                  px-3
                                  py-3
                                  text-sm
                                  font-semibold
                                  text-black
                                  shadow-none
                                  hover:bg-transparent
                                  data-[state=active]:border-black
                                  data-[state=active]:bg-transparent
                                  data-[state=active]:text-black
                                  data-[state=active]:shadow-none
                                "
                              >
                                {tab.label}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </div>

                        <TabsContent value="application" className="mt-0 pt-6">
                          <ApplicationTab
                            values={values.application}
                            setFieldValue={setFieldValue}
                            zoneOptions={getZoneOptions()}
                          />
                        </TabsContent>

                        {tabs
                          .filter((tab) => tab.value !== "application")
                          .map((tab) => {
                            const isPriest = tab.value === "priest";
                            const isHusband = tab.value === "husband";
                            const isWife = tab.value === "wife";
                            const titleMap = {
                              husband: "वराची माहिती",
                              wife: "वधूची माहिती",
                              witness1: "प्रथम साक्षीदाराची माहिती",
                              witness2: "दुसऱ्या साक्षीदाराची माहिती",
                              witness3: "तिसरा साक्षीदाराची माहिती",
                              priest: "पुरोहित/निबंधक माहिती",
                            };
                            const photoLabelMap = {
                              husband: "वराचे छायाचित्र",
                              wife: "वधूचे छायाचित्र",
                              witness1: "फोटो",
                              witness2: "फोटो",
                              witness3: "फोटो",
                              priest: "फोटो",
                            };
                            const thumbLabelMap = {
                              husband: "वराचा अंगठा",
                              wife: "वधूचा अंगठा",
                              witness1: "अंगठा",
                              witness2: "अंगठा",
                              witness3: "अंगठा",
                              priest: "अंगठा",
                            };

                            return (
                              <TabsContent
                                key={tab.value}
                                value={tab.value}
                                className="mt-0 pt-6"
                              >
                                <PersonTab
                                  type={tab.value}
                                  title={titleMap[tab.value] || ""}
                                  photoLabel={photoLabelMap[tab.value] || "फोटो"}
                                  thumbLabel={thumbLabelMap[tab.value] || "अंगठा"}
                                  values={values[tab.value] || emptyPerson}
                                  setFieldValue={(field, value) =>
                                    setFieldValue(`${tab.value}.${field}`, value)
                                  }
                                  handleFile={(field, preview, file) =>
                                    handleFile(
                                      setFieldValue,
                                      `${tab.value}.${field}`,
                                      `${tab.value}.${preview}`,
                                      file,
                                    )
                                  }
                                  isPriest={isPriest}
                                  isHusband={isHusband}
                                  isWife={isWife}
                                  statusOptions={getStatusOptions()}
                                  religionOptions={getReligionOptions()}
                                  documentOptions={getDocumentOptions(
                                    documentOptions,
                                  )}
                                  addressDocOptions={getDocumentOptions(
                                    addressDocOptions,
                                  )}
                                  ageDocOptions={getDocumentOptions(ageDocOptions)}
                                  relationOptions={getRelationOptions()}
                                  disabilityOptions={disabilityOptions}
                                  marriageDate={values.application.marriageDate}
                                  calculateAgeFromAPI={calculateAgeFromAPI}
                                />
                              </TabsContent>
                            );
                          })}

                        <div className="mt-8 flex items-center justify-center gap-32 border-t border-slate-200 pt-6">
                          <Button
                            type="submit"
                            className="bg-blue-900 hover:bg-blue-800 text-white"
                            disabled={loading || isSubmitting}
                          >
                            {loading || isSubmitting ? "Submitting..." : "Submit"}
                          </Button>
                          {/* <Button
                            type="button"
                            variant="outline"
                            className="bg-gray-100 hover:bg-gray-200"
                            onClick={() => window.print()}
                          >
                            Print
                          </Button> */}
                        </div>
                      </Tabs>
                    </div>
                  </Form>
                )}}
            </Formik>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ApplicationTab({ values, setFieldValue, zoneOptions }) {

  const handleDocumentChange = (index, field, value) => {
    const docs = [...(values.documents || [])];
    if (field === "file") {
      docs[index] = { 
        ...docs[index], 
        file: value,
        fileName: value?.name || "" 
      };
    } else {
      docs[index] = { ...docs[index], [field]: value };
    }
    setFieldValue("application.documents", docs);
  };

  const tableHeaders = ["Sr No.", "Select", "Document Type", "Image(jpg,png)"];

  const tableData = (values.documents || []).map((doc, index) => ({
    srNo: index + 1,
    select: (
      <Input
        type="checkbox"
        checked={Boolean(doc.selected)}
        onChange={(e) =>
          handleDocumentChange(index, "selected", e.target.checked)
        }
        className="mx-auto h-4 w-4 cursor-pointer"
      />
    ),
    documentType: doc.documentType || "",
    image: (
      <div className="min-w-[200px]">
        <Input
          type="file"
          accept=".jpg,.jpeg,.png"
          className="h-10 w-full cursor-pointer"
          onChange={(e) =>
            handleDocumentChange(
              index,
              "file",
              e.currentTarget.files?.[0] || null,
            )
          }
        />
        {doc.fileName && (
          <div className="mt-1 text-xs text-gray-500 truncate max-w-[180px]">
            {doc.fileName}
          </div>
        )}
      </div>
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label required text="Zone" />
            <span>:</span>
          </div>
          <Select
            value={values.zone || ""}
            onValueChange={(val) => setFieldValue("application.zone", val)}
          >
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="-- Select Option --" />
            </SelectTrigger>
            <SelectContent>
              {zoneOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label required text="Applicant First Name" />
            <span>:</span>
          </div>
          <Input
            value={values.applicantFirstName || ""}
            placeholder="Applicant First Name"
            onChange={(e) =>
              setFieldValue("application.applicantFirstName", e.target.value)
            }
            className="w-full h-9"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label required text="Applicant Middle Name" />
            <span>:</span>
          </div>
          <Input
            value={values.applicantMiddleName || ""}
            placeholder="Applicant Middle Name"
            onChange={(e) =>
              setFieldValue("application.applicantMiddleName", e.target.value)
            }
            className="w-full h-9"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label required text="Applicant Last Name" />
            <span>:</span>
          </div>
          <Input
            value={values.applicantLastName || ""}
            placeholder="Applicant Last Name"
            onChange={(e) =>
              setFieldValue("application.applicantLastName", e.target.value)
            }
            className="w-full h-9"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label required text="Mobile No" />
            <span>:</span>
          </div>
          <Input
            value={values.mobileNo || ""}
            placeholder="Mobile No"
            maxLength={10}
            onChange={(e) =>
              setFieldValue(
                "application.mobileNo",
                e.target.value.replace(/\D/g, ""),
              )
            }
            className="w-full h-9"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label required text="Marriage Date" />
            <span>:</span>
          </div>
          <DatePicker
            value={values.marriageDate || undefined}
            onChange={(date) => setFieldValue("application.marriageDate", date)}
            className="w-full h-9"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center pt-2">
            <Label required text="Address" />
            <span>:</span>
          </div>
          <Input
            value={values.address || ""}
            placeholder="Address"
            onChange={(e) =>
              setFieldValue("application.address", e.target.value)
            }
            className="w-full h-9"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center pt-2">
            <Label required text="Marriage Place English" />
            <span>:</span>
          </div>
          <Textarea
            value={values.marriagePlaceEnglish || ""}
            placeholder="Marriage Place English"
            onChange={(e) => setFieldValue("application.marriagePlaceEnglish", e.target.value)}
            className="min-h-[76px]"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center pt-2">
            <Label required text="Marriage Place Marathi" />
            <span>:</span>
          </div>
          <Textarea
            value={values.marriagePlaceMarathi || ""}
            placeholder="Marriage Place Marathi"
            onChange={(e) =>
              setFieldValue("application.marriagePlaceMarathi", e.target.value)
            }
            className="min-h-[76px]"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <ShadCNTable
          headers={tableHeaders}
          data={tableData}
          keyMapping={{
            "Sr No.": "srNo",
            Select: "select",
            "Document Type": "documentType",
            "Image(jpg,png)": "image",
          }}
          pagination={false}
        />
      </div>
    </div>
  );
}

function PersonTab({
  type,
  title,
  photoLabel,
  thumbLabel,
  values,
  setFieldValue,
  handleFile,
  isPriest,
  isHusband,
  isWife,
  statusOptions,
  religionOptions,
  documentOptions,
  addressDocOptions,
  ageDocOptions,
  relationOptions,
  disabilityOptions,
  marriageDate,
  calculateAgeFromAPI
}) {
  const showMarriageFields = isHusband || isWife;

  return (
    <div className="space-y-6">
      <h3 className="text-center text-lg font-bold border-b pb-3">{title}</h3>

      {!isPriest && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center pt-1">
              <Label required text={photoLabel} />
              <span>:</span>
            </div>
            <div className="flex flex-col items-center rounded-md border border-slate-200 bg-slate-50 p-4 flex-1">
              <div className="mb-3 flex h-[120px] w-[150px] items-center justify-center overflow-hidden rounded-sm border border-slate-300 bg-white">
                {values.photoPreview ? (
                  <img
                    src={values.photoPreview}
                    alt={photoLabel}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Preview</span>
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                className="h-10 w-full max-w-[320px] cursor-pointer bg-white"
                onChange={(e) =>
                  handleFile(
                    "photo",
                    "photoPreview",
                    e.currentTarget.files?.[0] || null,
                  )
                }
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center pt-1">
              <Label required text={thumbLabel} />
              <span>:</span>
            </div>
            <div className="flex flex-col items-center rounded-md border border-slate-200 bg-slate-50 p-4 flex-1">
              <div className="mb-3 flex h-[120px] w-[150px] items-center justify-center overflow-hidden rounded-sm border border-slate-300 bg-white">
                {values.thumbPreview ? (
                  <img
                    src={values.thumbPreview}
                    alt={thumbLabel}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Preview</span>
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                className="h-10 w-full max-w-[320px] cursor-pointer bg-white"
                onChange={(e) =>
                  handleFile(
                    "thumb",
                    "thumbPreview",
                    e.currentTarget.files?.[0] || null,
                  )
                }
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label required text="English First Name" />
            <span>:</span>
          </div>
          <Input
            value={values.englishFirstName || ""}
            placeholder="First Name in English"
            onChange={(e) => setFieldValue("englishFirstName", e.target.value)}
            className="w-full h-9"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label required text="English Middle Name" />
            <span>:</span>
          </div>
          <Input
            value={values.englishMiddleName || ""}
            placeholder="Middle Name in English"
            onChange={(e) => setFieldValue("englishMiddleName", e.target.value)}
            className="w-full h-9"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label required text="English Last Name" />
            <span>:</span>
          </div>
          <Input
            value={values.englishLastName || ""}
            placeholder="Last Name in English"
            onChange={(e) => setFieldValue("englishLastName", e.target.value)}
            className="w-full h-9"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label required text="Marathi First Name" />
            <span>:</span>
          </div>
          <Input
            value={values.marathiFirstName || ""}
            placeholder="First Name in Marathi"
            onChange={(e) => setFieldValue("marathiFirstName", e.target.value)}
            className="w-full h-9"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label required text="Marathi Middle Name" />
            <span>:</span>
          </div>
          <Input
            value={values.marathiMiddleName || ""}
            placeholder="Middle Name in Marathi"
            onChange={(e) => setFieldValue("marathiMiddleName", e.target.value)}
            className="w-full h-9"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label required text="Marathi Last Name" />
            <span>:</span>
          </div>
          <Input
            value={values.marathiLastName || ""}
            placeholder="Last Name in Marathi"
            onChange={(e) => setFieldValue("marathiLastName", e.target.value)}
            className="w-full h-9"
          />
        </div>
      </div>

      {isPriest ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                <Label required text="जन्म तारीख" />
                <span>:</span>
              </div>
              <Input
                value={values.age || ""}
                placeholder="Age"
                maxLength={3}
                onChange={(e) =>
                  setFieldValue("age", e.target.value.replace(/\D/g, ""))
                }
                className="w-full h-9"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                <Label required text="धर्म" />
                <span>:</span>
              </div>
              <Select
                value={values.birthReligion || ""}
                onValueChange={(val) => setFieldValue("birthReligion", val)}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="-- Select Option --" />
                </SelectTrigger>
                <SelectContent>
                  {religionOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-2">
              <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center pt-2">
                <Label required text="English Address" />
                <span>:</span>
              </div>
              <Textarea
                value={values.englishAddress || ""}
                placeholder="Address in English"
                onChange={(e) =>
                  setFieldValue("englishAddress", e.target.value)
                }
                className="min-h-[76px]"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-2">
              <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center pt-2">
                <Label required text="Marathi Address" />
                <span>:</span>
              </div>
              <Textarea
                value={values.marathiAddress || ""}
                placeholder="Address in Marathi"
                onChange={(e) =>
                  setFieldValue("marathiAddress", e.target.value)
                }
                className="min-h-[76px]"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {!isHusband && !isWife && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="दस्तऐवज" />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.documentType || ""}
                    onValueChange={(val) => setFieldValue("documentType", val)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="नाते संबंध" />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.relation || ""}
                    onValueChange={(val) => setFieldValue("relation", val)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                <Label required text="Contact Number" />
                <span>:</span>
              </div>
              <Input
                value={values.contact || ""}
                placeholder="Contact Number"
                maxLength={10}
                onChange={(e) =>
                  setFieldValue("contact", e.target.value.replace(/\D/g, ""))
                }
                className="w-full h-9"
              />
            </div>

            {(isHusband || isWife) && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label required text="Aadhar Card No" />
                  <span>:</span>
                </div>
                <Input
                  value={values.aadharNo || ""}
                  placeholder="Aadhar Card No"
                  maxLength={12}
                  onChange={(e) =>
                    setFieldValue("aadharNo", e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full h-9"
                />
              </div>
            )}

            {showMarriageFields && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="मागील स्थिती" />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.maritalStatus || ""}
                    onValueChange={(val) => setFieldValue("maritalStatus", val)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="दिव्यांग" />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.disability || ""}
                    onValueChange={(val) => setFieldValue("disability", val)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>
                    <SelectContent>
                      {disabilityOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                <Label required text="जन्म तारीख" />
                <span>:</span>
              </div>
              <DatePicker
                value={values.birthDate || undefined}
                onChange={(date) => setFieldValue("birthDate", date)}
                className="w-full h-9"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                <Label required text="लग्नाच्या वेळी वय" />
                <span>:</span>
              </div>
              <Input
                value={values.age || ""}
                placeholder="Age"
                maxLength={3}
                onChange={(e) =>
                  setFieldValue("age", e.target.value.replace(/\D/g, ""))
                }
                className="w-full h-9"
                // disabled
              />
            </div> */}

            {(isHusband || isWife) && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label required text="जन्म तारीख" />
                  <span>:</span>
                </div>
                <DatePicker
                  value={values.birthDate || undefined}
                  onChange={(date) => {
                    setFieldValue("birthDate", date);
                    if (marriageDate && date) {
                      calculateAgeFromAPI(marriageDate, date, setFieldValue, "age");
                    }
                  }}
                  className="w-full h-9"
                />
              </div>
            )}

            {(isHusband || isWife) && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label required text="लग्नाच्या वेळी वय" />
                  <span>:</span>
                </div>
                <Input
                  value={values.age || ""}
                  placeholder="Age"
                  className="w-full h-9"
                  disabled={true}
                  readOnly
                />
              </div>
            )}

            {!isHusband && !isWife && !isPriest && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label required text="जन्म तारीख" />
                  <span>:</span>
                </div>
                <DatePicker
                  value={values.birthDate || undefined}
                  onChange={(date) => {
                    setFieldValue("birthDate", date);
                    if (marriageDate && date) {
                      calculateAgeFromAPI(marriageDate, date, setFieldValue, "age");
                    }
                  }}
                  className="w-full h-9"
                />
              </div>
            )}

            {!isHusband && !isWife && !isPriest && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label required text="लग्नाच्या वेळी वय" />
                  <span>:</span>
                </div>
                <Input
                  value={values.age || ""}
                  placeholder="Age"
                  className="w-full h-9"
                  disabled={true}
                  readOnly
                />
              </div>
            )}

            {isPriest && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label required text="जन्म तारीख" />
                  <span>:</span>
                </div>
                <Input
                  value={values.age || ""}
                  placeholder="Age"
                  maxLength={3}
                  onChange={(e) => setFieldValue("age", e.target.value.replace(/\D/g, ""))}
                  className="w-full h-9"
                />
              </div>
            )}

            {showMarriageFields && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="जन्माने धर्म" />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.birthReligion || ""}
                    onValueChange={(val) => setFieldValue("birthReligion", val)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>
                    <SelectContent>
                      {religionOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="दत्तक घेऊन धर्म" />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.adoptedReligion || ""}
                    onValueChange={(val) =>
                      setFieldValue("adoptedReligion", val)
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>
                    <SelectContent>
                      {religionOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {(isHusband || isWife) && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label required text="ई-मेल आयडी" />
                  <span>:</span>
                </div>
                <Input
                  value={values.email || ""}
                  placeholder="Email Id"
                  onChange={(e) => setFieldValue("email", e.target.value)}
                  className="w-full h-9"
                  maxLength={30}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-2">
              <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center pt-2">
                <Label required text="English Address" />
                <span>:</span>
              </div>
              <Textarea
                value={values.englishAddress || ""}
                placeholder="Address in English"
                onChange={(e) =>
                  setFieldValue("englishAddress", e.target.value)
                }
                className="min-h-[76px]"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-2">
              <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center pt-2">
                <Label required text="Marathi Address" />
                <span>:</span>
              </div>
              <Textarea
                value={values.marathiAddress || ""}
                placeholder="Address in Marathi"
                onChange={(e) =>
                  setFieldValue("marathiAddress", e.target.value)
                }
                className="min-h-[76px]"
              />
            </div>
          </div>

          {(isHusband || isWife) && (
            <div className="space-y-4">
              <h4 className="text-center text-md font-bold border-b pb-2">
                लग्नापूर्वीची कागदपत्रे
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-200 rounded-md p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label required text="ID Document" />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.idDocument || ""}
                    onValueChange={(val) => setFieldValue("idDocument", val)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Upload Document" />
                    <span>:</span>
                  </div>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full h-9 cursor-pointer"
                    onChange={(e) => setFieldValue("idDocumentFile", e.currentTarget.files?.[0] || null)}
                  />
                  {values.idDocumentFile?.name && (
                    <div className="mt-1 text-xs text-gray-500 truncate">
                      {values.idDocumentFile.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-200 rounded-md p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label required text="रहिवासीचा पुरावा" />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.addressDocument || ""}
                    onValueChange={(val) => setFieldValue("addressDocument", val)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>
                    <SelectContent>
                      {addressDocOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Upload Document" />
                    <span>:</span>
                  </div>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full h-9 cursor-pointer"
                    onChange={(e) => setFieldValue("addressDocumentFile", e.currentTarget.files?.[0] || null)}
                  />
                  {values.addressDocumentFile?.name && (
                    <div className="mt-1 text-xs text-gray-500 truncate">
                      {values.addressDocumentFile.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-200 rounded-md p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label required text="वयाचा पुरावा" />
                    <span>:</span>
                  </div>
                  <Select
                    value={values.ageDocument || ""}
                    onValueChange={(val) => setFieldValue("ageDocument", val)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="-- Select Option --" />
                    </SelectTrigger>
                    <SelectContent>
                      {ageDocOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Upload Document" />
                    <span>:</span>
                  </div>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full h-9 cursor-pointer"
                    onChange={(e) => setFieldValue("ageDocumentFile", e.currentTarget.files?.[0] || null)}
                  />
                  {values.ageDocumentFile?.name && (
                    <div className="mt-1 text-xs text-gray-500 truncate">
                      {values.ageDocumentFile.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FrmMarriageRgstn;
