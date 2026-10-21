import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";
import ShadCNTable from "@/components/ui/table";
import config from "@/utils/config";

const FrmWaterConnectionApplication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  console.log({ location })
  const locationState = location.state || {};
  const ulbId = locationState.ulbId || user?.ulbId
  const userId = locationState.userId || user?.userId
  // const serviceId = 14
  const serviceId = locationState.serviceId
  const serviceName = location.state?.serviceName

  console.log("Service ID:", serviceId);
  console.log("ULB ID:", ulbId);
  console.log("User ID:", userId);


  const [formData, setFormData] = useState({
    zone: "",
    firstName: "",
    middleName: "",
    lastName: "",
    firstNameMarathi: "",
    middleNameMarathi: "",
    lastNameMarathi: "",
    mobileNo: "",
    aadharNo: "",
    email: "",
    address: "",
    addressMarathi: "",
    purpose: "",
    purposeMarathi: "",
    connectionNo: "",
    consumeType: "",
    meterType: "",
    sewrageType: "",
    nocPurpose: "",
  });

  const [zoneList, setZoneList] = useState([]);
  const [zoneLoading, setZoneLoading] = useState(false);
  const [consumerTypeList, setConsumerTypeList] = useState([]);
  const [consumerTypeLoading, setConsumerTypeLoading] = useState(false);
  const [meterTypeList, setMeterTypeList] = useState([]);
  const [meterTypeLoading, setMeterTypeLoading] = useState(false);
  const [sewerageTypeList, setSewerageTypeList] = useState([]);
  const [sewerageTypeLoading, setSewerageTypeLoading] = useState(false);
  const [documentList, setDocumentList] = useState([]);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentFiles, setDocumentFiles] = useState({});
  const [bndForm, setBndForm] = useState({
    registrationNo: "",
    birthDeathDate: "",
    fatherName: "",
    motherName: "",
  });
  const [bndDetails, setBndDetails] = useState([]);
  const [nocPurposeList, setNocPurposeList] = useState([]);
  const [nocPurposeLoading, setNocPurposeLoading] = useState(false);

  const [bndHeader, setBndHeader] = useState("");
  const [bndLoading, setBndLoading] = useState(false);
  const [selectedBndRecord, setSelectedBndRecord] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const BND_SERVICE_IDS = [14, 15, 342, 343];
  const SEWERAGE_SERVICE_IDS = [513];
  const Fire_Biridage_ServiceId = [12, 13];
  const isFireBrigadeService = Fire_Biridage_ServiceId.includes(Number(serviceId));

  const isBndService = BND_SERVICE_IDS.includes(Number(serviceId));
  const isSewerageService = SEWERAGE_SERVICE_IDS.includes(Number(serviceId));
  const isBirthService = [14, 342].includes(Number(serviceId));
  const bndDateLabel = isBirthService ? "Birth Date" : "Death Date";

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value, }));
  };

  const ALLOWED_DOC_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];
  const ALLOWED_DOC_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/pjpeg",
    "image/png",
    "image/x-png",
  ];

  const isValidDocFile = (file) => {
    if (!file || !file.name) return false;
    const parts = file.name.trim().split(".");
    if (parts.length < 2) return false;
    const ext = parts.pop().toLowerCase();
    const isExtValid = ALLOWED_DOC_EXTENSIONS.includes(ext);
    const isMimeValid = !file.type || ALLOWED_DOC_MIME_TYPES.includes(file.type.toLowerCase());
    return isExtValid && isMimeValid;
  };

  const handleDocumentFileChange = (docId, file) => {
    if (!file) {
      setDocumentFiles((prev) => {
        const updated = { ...prev };
        delete updated[docId];
        return updated;
      });
      return;
    }

    if (!isValidDocFile(file)) {
      Swal.fire({
        text: "Only PDF, JPG, and PNG file formats are allowed.",
        confirmButtonColor: "#1e3a8a",
      });
      setDocumentFiles((prev) => {
        const updated = { ...prev };
        delete updated[docId];
        return updated;
      });
      return;
    }

    setDocumentFiles((prev) => ({ ...prev, [docId]: file, }));
  };

  const fetchZones = async () => {
    try {
      setZoneLoading(true);
      const url = `${BASE_URL}/api/watermodule/wards`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Zone API Response:", response.data);

      if (response?.data?.ok === true && response?.data?.data?.success === true) {
        const zones = response.data.data.data || [];
        setZoneList(zones);
        console.log("Zone List:", zones);
      } else {
        setZoneList([]);
        console.error("Zone API Error:", response?.data?.message);
      }
    } catch (error) {
      console.error("Fetch Zone API Error:", error);
      console.error("Zone Error Response:", error?.response?.data);
      setZoneList([]);
    } finally {
      setZoneLoading(false);
    }
  };


  const fetchConsumerTypes = async () => {
    try {
      setConsumerTypeLoading(true);

      const url = `${BASE_URL}/api/watermodule/water-consumer-types`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Consumer Type Response:", response.data);

      if (response?.data?.ok === true && response?.data?.data?.success === true) {
        const consumerTypes = response.data.data.data || [];
        setConsumerTypeList(consumerTypes);
      } else {
        setConsumerTypeList([]);
        console.error("Consumer Type API Error:", response?.data?.message);
      }
    } catch (error) {
      console.error("Consumer Type API Error:", error);
      console.error("Consumer Type Error Response:", error?.response?.data);
      setConsumerTypeList([]);
    } finally {
      setConsumerTypeLoading(false);
    }
  };



  const fetchSewerageTypes = async () => {
    try {
      setSewerageTypeLoading(true);

      const response = await axios.get(`${BASE_URL}/api/watermodule/water-sewerage-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response?.data?.ok === true && response?.data?.data?.success === true) {
        const meterTypes = response.data.data.data || [];
        setSewerageTypeList(meterTypes);
      } else {
        setSewerageTypeList([]);
        console.error("Meter Type API Error:", response?.data?.message);
      }
    } catch (error) {
      console.error("Meter Type API Error:", error);
      console.error("Meter Type Error Response:", error?.response?.data);
      setSewerageTypeList([]);
    } finally {
      setSewerageTypeLoading(false);
    }
  };
  const fetchMeterTypes = async () => {
    try {
      setMeterTypeLoading(true);

      const url = `${BASE_URL}/api/watermodule/water-meter-types`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response?.data?.ok === true && response?.data?.data?.success === true) {
        const meterTypes = response.data.data.data || [];
        setMeterTypeList(meterTypes);
      } else {
        setMeterTypeList([]);
        console.error("Meter Type API Error:", response?.data?.message);
      }
    } catch (error) {
      console.error("Meter Type API Error:", error);
      console.error("Meter Type Error Response:", error?.response?.data);
      setMeterTypeList([]);
    } finally {
      setMeterTypeLoading(false);
    }
  };

  const fetchServiceDocuments = async () => {
    try {
      if (!serviceId || !ulbId) {
        console.error(
          "Service ID or ULB ID is missing",
          {
            serviceId,
            ulbId,
          }
        );

        setDocumentList([]);
        return;
      }

      setDocumentLoading(true);



      const url = `${BASE_URL}/api/watermodule/service-documents`;

      console.log(
        "Fetching service documents:",
        {
          url,
          serviceId,
          ulbId,
        }
      );

      const response = await axios.get(url,
        {
          params: { serviceId: serviceId, ulbid: ulbId },
          headers: { Authorization: `Bearer ${token}` },
        },

      );

      console.log(
        "Service Documents Response:",
        response.data
      );

      if (
        response?.data?.ok === true &&
        response?.data?.data?.success === true
      ) {
        const documents =
          response.data.data.data || [];

        setDocumentList(documents);

        console.log(
          "Document List:",
          documents
        );
      } else {
        setDocumentList([]);

        Swal.fire({

          title: "Unable to Load Documents",
          text:
            response?.data?.message ||
            "Unable to fetch service documents.",
        });
      }
    } catch (error) {
      console.error(
        "Service Documents API Error:",
        error
      );

      console.error(
        "Service Documents Error Response:",
        error?.response?.data
      );

      setDocumentList([]);


    } finally {
      setDocumentLoading(false);
    }
  };

  const handleBndSearch = async () => {
    const { registrationNo, birthDeathDate, fatherName, motherName } = bndForm;

    if (!registrationNo.trim() && !birthDeathDate && !fatherName.trim() && !motherName.trim()) {
      await Swal.fire({
        icon: "warning",
        text: "Please Enter Reg.no OR Date OR Father Name OR Mother Name",
      });
      return;
    }

    setBndLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/api/watermodule/search-birth-death-details`,
        {
          serviceId: Number(serviceId),
          registrationNo: registrationNo.trim(),
          birthDeathDate,
          fatherName: fatherName.trim(),
          motherName: motherName.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const responseData = response.data?.data;
      setBndHeader(responseData?.header || "");

      const formattedBndDetails = (responseData?.data || []).map((item) => ({
        ...item,
        BNDdate: item.BNDdate
          ? item.BNDdate.split("T")[0].split("-").reverse().join("/")
          : "-",
      }));

      setBndDetails(formattedBndDetails);

      setSelectedBndRecord(null);

      if (!responseData?.data?.length) {
        await Swal.fire({
          icon: "info",
          text: "No records found",
        });
      }
    } catch (error) {
      setBndDetails([]);
      setBndHeader("");
      setSelectedBndRecord(null);

      await Swal.fire({
        icon: "error",
        text: error?.response?.data?.message || error?.response?.data?.error || "Unable to fetch Birth/Death details.",
      });
    } finally {
      setBndLoading(false);
    }
  };


  const fetchNocPurpose = async () => {
    try {
      setNocPurposeLoading(true);

      const response = await axios.get(`${BASE_URL}/api/watermodule/noc-purpose`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("NOC Purpose API Response:", response.data);

      if (
        response?.data?.ok === true &&
        response?.data?.data?.success === true
      ) {
        const apiData = response.data.data.data || [];

        console.log("Raw NOC Purpose List:", apiData);

        const formattedData = apiData
          .map((item, index) => ({
            // Actual database ID
            id:
              item.NUM_NOCPURPOSE_ID ??
              item.VAR_NOCPURPOSE_ID ??
              item.NOC_PURPOSE_ID ??
              item.id,

            name:
              item.VAR_NOCPURPOSE_NAME ??
              item.NOC_PURPOSE_NAME ??
              item.name ??
              "",

            // only for React key if database ID is missing/duplicate
            uiKey: `${item.NUM_NOCPURPOSE_ID ?? item.VAR_NOCPURPOSE_ID ?? item.NOC_PURPOSE_ID ?? item.id ?? "noc"}-${index}`,
          }))
          .filter(
            (item) =>
              item.id !== undefined &&
              item.id !== null &&
              item.name
          );

        console.log(
          "Formatted NOC Purpose List:",
          formattedData
        );

        setNocPurposeList(formattedData);
      } else {
        setNocPurposeList([]);

        console.error(
          "NOC Purpose API Error:",
          response?.data?.message
        );
      }
    } catch (error) {
      console.error(
        "NOC Purpose API Error:",
        error
      );

      console.error(
        "Response:",
        error?.response?.data
      );

      setNocPurposeList([]);
    } finally {
      setNocPurposeLoading(false);
    }
  };


  useEffect(() => {
    fetchZones();
    fetchConsumerTypes();
    fetchMeterTypes();
    fetchSewerageTypes();
  }, []);

  useEffect(() => {
    setBndForm({
      registrationNo: "",
      birthDeathDate: "",
      fatherName: "",
      motherName: "",
    });
    setBndDetails([]);
    setBndHeader("");
    setSelectedBndRecord(null);
  }, [serviceId]);

  useEffect(() => {
    if (serviceId && ulbId) {
      fetchServiceDocuments();
    }
  }, [serviceId, ulbId]);

  useEffect(() => {

    const currentServiceId = Number(serviceId);

    if (
      currentServiceId === 12 ||
      currentServiceId === 13
    ) {
      fetchNocPurpose();
    } else {
      setNocPurposeList([]);

      handleChange(
        "nocPurpose",
        ""
      );
    }

  }, [serviceId]);

  const isValidEmail = (email) => {
    if (!email || typeof email !== "string") return false;
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) return false;

    const isInvalidTestDomain =
      /\.(test|example|invalid|localhost)$/i.test(trimmed) ||
      /^test@test\./i.test(trimmed) ||
      trimmed === "test@test.test";

    if (isInvalidTestDomain) return false;
    return true;
  };

  const handleSubmit = async () => {

    if (isBndService && !selectedBndRecord && isBirthService) {
      await Swal.fire({
        // icon: "warning",
        text: "Select At least one Record in Birth Details Search",
        confirmButtonColor: "#1e3a8a",
      });
      {isBirthService ? "Birth Details Search" : "Death Details Search"}
      return;
    } else if (isBndService && !selectedBndRecord){
        await Swal.fire({
          // icon: "warning",
          text: "Select At least one Record in Death Details Search",
          confirmButtonColor: "#1e3a8a",
        });
      return;
    }

    if (!formData.zone) {
      Swal.fire({

        text: "Please select Zone.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }
    if (!formData.firstName.trim()) {
      Swal.fire({

        text: "Please enter First Name.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }
    if (!formData.middleName.trim()) {
      Swal.fire({

        text: "Please enter Middle Name.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (!formData.lastName.trim()) {
      Swal.fire({

        text: "Please enter Last Name.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

     if (!formData.firstNameMarathi.trim()) {
      Swal.fire({

        text: "Please enter First Name in Marathi.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (!formData.middleNameMarathi.trim()) {
      Swal.fire({

        text: "Please enter Middle Name in Marathi.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (!formData.lastName.trim()) {
      Swal.fire({

        text: "Please enter Last Name.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (!formData.lastNameMarathi.trim()) {
      Swal.fire({

        text: "Please enter Last Name in Marathi.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (!formData.mobileNo.trim()) {
      Swal.fire({

        text: "Please enter Mobile Number.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (formData.mobileNo.length !== 10) {
      Swal.fire({

        text: "Please enter a valid 10 digit Mobile Number.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (!formData.aadharNo.trim()) {
      Swal.fire({

        text: "Please enter Aadhar Card Number.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (formData.aadharNo.length !== 12) {
      Swal.fire({

        text: "Please enter a valid 12 digit Aadhar Number.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (!formData.email.trim()) {
      Swal.fire({
        text: "Please enter Email.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (!isValidEmail(formData.email)) {
      Swal.fire({

        text: "Please enter a valid Email ID.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(formData.email.trim())) {
      Swal.fire({
        text: "Please enter a valid Email address.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (!formData.address.trim()) {
      Swal.fire({

        text: "Please enter Address.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (!formData.addressMarathi.trim()) {
      Swal.fire({

        text: "Please enter Address in Marathi.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (!formData.purpose.trim()) {
      Swal.fire({

        text: "Please enter Purpose.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (!formData.purposeMarathi.trim()) {
      Swal.fire({

        text: "Please enter Purpose in Marathi.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (!isFireBrigadeService && !isBndService && !formData.consumeType) {
      Swal.fire({
        text: "Please select Consumer Type.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (!isFireBrigadeService && !isBndService && !formData.meterType) {
      Swal.fire({
        text: "Please select Meter Type.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (!isFireBrigadeService && !isBndService && !formData.connectionNo.trim()) {
      Swal.fire({
        text: "Please enter Connection No.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (isSewerageService && !formData.sewrageType) {
      Swal.fire({
        text: "Please select Sewerage Type.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (isFireBrigadeService && !formData.nocPurpose) {
      await Swal.fire({
        text: "Please select NOC Purpose.",
        confirmButtonColor: "#1e3a8a",
      });

      return;
    }




    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const selectedDocuments = documentList.map((document) => {
      const file = documentFiles[document.DOCID];

      if (!file) {
        return null;
      }

      return {
        documentId: document.DOCID,
        documentName: document.DOCNAME || "",
        documentType: document.DOCTYPE || "",
        file: file,
      };
    }).filter(Boolean);


    console.log("Selected Documents:", selectedDocuments);

    if (Number(serviceId) !== 28) {

      if (documentList.length === 0) {
        await Swal.fire({
          title: "Document Required",
          text: "No documents are configured for this service.",
          confirmButtonColor: "#1e3a8a",
        });

        return;
      }

      const missingDocuments = documentList.filter(
        (document) => !documentFiles[document.DOCID]
      );

      if (missingDocuments.length > 0) {

        const missingDocumentNames = missingDocuments.map((document, index) => `${index + 1}. ${document.DOCNAME || "Document"}`).join("<br/>");

        await Swal.fire({
          title: "Documents Required",
          html: `
          <div style="text-align:left">
            <p><strong>All documents are compulsory for submission.</strong></p>
            <p style="margin-top:10px">Please upload the following document(s):</p>
            <div style="margin-top:10px">${missingDocumentNames}</div>
          </div>
      `,
          confirmButtonColor: "#1e3a8a",
        });

        return;
      }
    }

    const invalidFiles = selectedDocuments.filter((doc) => !isValidDocFile(doc.file));
    if (invalidFiles.length > 0) {
      const invalidDocumentNames = invalidFiles.map((doc, index) => `${index + 1}. ${doc.documentName || "Document"}`).join("<br/>");
      await Swal.fire({
        title: "Invalid File Format",
        html: `
            <div style="text-align:left">
              <p><strong>Only PDF, JPG, and PNG file formats are allowed.</strong></p>
              <p style="margin-top:10px">Please re-upload valid files for:</p>
              <div style="margin-top:10px">${invalidDocumentNames}</div>
            </div>
          `,
        confirmButtonColor: "#1e3a8a",
      });

      return;
    }

    const confirmResult =
      await Swal.fire({

        title: "Submit Application?",
        text: "Are you sure you want to submit this application?",
        showCancelButton: true,
        confirmButtonText: "Yes, Submit",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#1e3a8a",
      });

    if (!confirmResult.isConfirmed) {
      return;
    }



    try {
      setIsSubmitting(true);

      Swal.fire({
        title: "Submitting Application...",
        text: "Please wait while your application is being processed.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });



      const savePayload = {
        in_ulbid: Number(ulbId),
        in_corpid: Number(ulbId),
        in_serviceid: Number(serviceId),
        in_userid: Number(userId),
        in_firstname: formData.firstName.trim(),
        in_firstnameM: formData.firstNameMarathi.trim(),
        in_middlename: formData.middleName.trim(),
        in_middlenameM: formData.middleNameMarathi.trim(),
        in_lastname: formData.lastName.trim(),
        in_lastnameM: formData.lastNameMarathi.trim(),
        in_mobileno: Number(formData.mobileNo),
        in_adharno: formData.aadharNo.trim(),
        in_email: formData.email.trim(),
        in_address: formData.address.trim(),
        in_addressM: formData.addressMarathi.trim(),
        in_purpose: formData.purpose.trim(),
        in_purposeM: formData.purposeMarathi.trim(),
        in_zoneid: Number(formData.zone),
        in_wardno: Number(formData.zone),
        in_propertyno: !isFireBrigadeService && !isBndService ? formData.connectionNo.trim() : "",
        in_mode: 1,
        in_PropertyUsage: 1,
        in_SellerName: "",
        in_TransferToWhom: "",
        in_AgreementDate: new Date().toISOString().split("T")[0],
        in_AppNo: locationState.appNo || "",
        in_wtsewrgtypeid: isSewerageService && formData.sewrageType ? Number(formData.sewrageType) : "",
        // in_wtsewrgtypeid: 1,
        in_nocpurposeid: isFireBrigadeService && formData.nocPurpose ? Number(formData.nocPurpose) : "",
        in_RegiNo: isBndService ? (selectedBndRecord?.regno || "") : "",
        in_UniqueNo: isBndService ? (selectedBndRecord?.uniqueNo || "") : "",
        in_appsource: config?.source,
        in_deliveryflag: null,
        in_consumertypeid: formData.consumeType ? Number(formData.consumeType) : "",
        in_metertypeid: formData.meterType ? Number(formData.meterType) : "",
      };

      console.log(
        "Water Save Payload:",
        savePayload
      );


      const saveResponse =
        await axios.post(`${BASE_URL}/api/watermodule/save`, savePayload, {
          headers: { Authorization: `Bearer ${token}` },
        });

      console.log(
        "Save API Response:",
        saveResponse.data
      );


      if (
        saveResponse?.data?.ok !== true
      ) {
        Swal.close();

        await Swal.fire({

          title: "Application Failed",
          text:
            saveResponse?.data?.message ||
            "Application could not be processed.",
          confirmButtonColor: "#1e3a8a",
        });

        return;
      }


      const saveData =
        saveResponse?.data?.data;

      const procedureData =
        saveData?.data;

      const errorCode =
        Number(
          procedureData?.errorCode
        );

      const errorMessage =
        procedureData?.message ||
        saveData?.message ||
        saveResponse?.data?.message ||
        "";

      const applicationNo =
        procedureData?.appNo;

      console.log(
        "Procedure Error Code:",
        errorCode
      );

      console.log(
        "Procedure Message:",
        errorMessage
      );

      console.log(
        "Application No:",
        applicationNo
      );

      if (
        errorCode !== 9999 ||
        !applicationNo
      ) {
        Swal.close();

        await Swal.fire({

          title: "Application Failed",
          text:
            errorMessage ||
            "Application could not be processed.",
          confirmButtonColor: "#1e3a8a",
        });

        return;
      }



      console.log(
        "Application Created:",
        applicationNo
      );



      const uploadResults = [];

      for (
        const document
        of selectedDocuments
      ) {

        try {

          console.log(
            "Uploading Document:",
            {
              applicationNo,
              documentId:
                document.documentId,
              documentName:
                document.documentName,
              fileName:
                document.file.name,
            }
          );


          const extension = document.file.name
            .split(".")
            .pop()
            ?.toLowerCase();

          let docType = "PDF";

          if (extension === "pdf") {
            docType = "PDF";
          } else if (extension === "jpg" || extension === "jpeg") {
            docType = "JPG";
          } else if (extension === "png") {
            docType = "PNG";
          } else {
            throw new Error(`File format .${extension} is not supported. Only PDF, JPG, and PNG are allowed.`);
          }

          const uploadFormData = new FormData();
          uploadFormData.append("documents", document.file, document.file.name);

          const uploadResponse = await axios.post(`${BASE_URL}/api/watermodule/upload-app-doc`,
            uploadFormData,
            {
              params: {
                CorpId: Number(ulbId),
                ServiceId: Number(serviceId),
                AppNo: applicationNo,
                DocType: docType,
                DocumentId: document.documentId,
              },
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            }
          );

          console.log(
            "Document Upload Response:",
            uploadResponse.data
          );



          if (
            uploadResponse?.data?.ok !== true
          ) {

            throw new Error(
              uploadResponse?.data?.message ||
              `Failed to upload ${document.documentName}`
            );

          }

          uploadResults.push({
            documentId:
              document.documentId,

            documentName:
              document.documentName,

            fileName:
              document.file.name,

            success: true,

            response:
              uploadResponse.data,
          });

        } catch (uploadError) {

          console.error(
            "Document Upload Error:",
            uploadError
          );

          uploadResults.push({
            documentId:
              document.documentId,

            documentName:
              document.documentName,

            fileName:
              document.file.name,

            success: false,

            message:
              uploadError?.response?.data
                ?.message ||
              uploadError?.message ||
              "Document upload failed.",
          });

        }
      }


      const failedUploads =
        uploadResults.filter(
          (item) =>
            item.success !== true
        );


      if (
        failedUploads.length > 0
      ) {

        Swal.close();

        const failedNames =
          failedUploads
            .map(
              (item) =>
                item.documentName
            )
            .join(", ");

        await Swal.fire({

          title: "Application Saved",
          html: `
          <div style="text-align:left">
            <p>
              Application No:
              <strong>${applicationNo}</strong>
            </p>

            <p>
              Application was submitted successfully,
              but the following document(s) could not
              be uploaded:
            </p>

            <p>
              <strong>${failedNames}</strong>
            </p>
          </div>
        `,
          confirmButtonColor: "#1e3a8a",
        });

        return;
      }



      Swal.close();

      await Swal.fire({

        title: "Application Submitted Successfully",
        html: `
        <div style="text-align:center">
          <p>
            Application No:
            <strong>${applicationNo}</strong>
          </p>

          <p>
            Application and documents have been
            submitted successfully.
          </p>
        </div>
      `,
        confirmButtonColor: "#1e3a8a",
      });


      setFormData({
        zone: "",

        firstName: "",
        middleName: "",
        lastName: "",

        firstNameMarathi: "",
        middleNameMarathi: "",
        lastNameMarathi: "",

        mobileNo: "",
        aadharNo: "",
        email: "",

        address: "",
        addressMarathi: "",

        purpose: "",
        purposeMarathi: "",

        connectionNo: "",

        consumeType: "",
        meterType: "",
      });

      setDocumentFiles([]);
      setBndDetails([])
      navigate("/app/FrmTrackApplication")
      console.log(
        "Final Upload Results:",
        uploadResults
      );

    } catch (error) {

      console.error(
        "Water Application Submit Error:",
        error
      );

      Swal.close();



      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to submit application.";

      await Swal.fire({

        title: "Submission Failed",
        text: errorMessage,
        confirmButtonColor: "#1e3a8a",
      });

    } finally {

      setIsSubmitting(false);

    }
  };
  const handleClose = () => {
    window.history.back();
  };

  const tableBndDetails = bndDetails.map((row) => ({
    ...row,
    checked: selectedBndRecord?.uniqueNo === row.uniqueNo,
  }));


  return (
    <div>
      <Card className="shadow-sm border">


        <CardHeader className="border-b px-4 py-2">
          <CardTitle className="text-lg font-semibold text-[#083c76]">{serviceName}</CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">

          <div>
            <h4 className="text-md font-semibold mb-3">
              Application Details
            </h4>

            <hr className="mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">


              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">

                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">

                  <Label
                    text="Zone"
                    required
                  />

                  <span>:</span>

                </div>

                <Select
                  value={formData.zone}
                  onValueChange={(value) =>
                    handleChange(
                      "zone",
                      value
                    )
                  }
                  disabled={zoneLoading}
                >

                  <SelectTrigger className="w-full">

                    <SelectValue
                      placeholder={
                        zoneLoading
                          ? "Loading zones..."
                          : "-- Select Option --"
                      }
                    />

                  </SelectTrigger>

                  <SelectContent>

                    {zoneList.length > 0 ? (

                      zoneList.map(
                        (zone) => (

                          <SelectItem
                            key={
                              zone.WARDID
                            }
                            value={String(
                              zone.WARDID
                            )}
                          >
                            {
                              zone.WARDNAME
                            }
                          </SelectItem>

                        )
                      )

                    ) : (

                      !zoneLoading && (
                        <SelectItem
                          value="no-zone"
                          disabled
                        >
                          No zones available
                        </SelectItem>
                      )

                    )}

                  </SelectContent>

                </Select>

              </div>


              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">

                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">

                  <Label
                    text="First Name"
                    required
                  />

                  <span>:</span>

                </div>

                <Input
                  value={formData.firstName}
                  onChange={(e) =>
                    handleChange("firstName", e.target.value.replace(/[^a-zA-Z]/g, ""))
                  }
                  placeholder="First Name"
                />

              </div>


              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">

                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">

                  <Label
                    text="Middle Name"
                    required
                  />

                  <span>:</span>

                </div>

                <Input
                  value={
                    formData.middleName
                  }
                  onChange={(e) =>
                    handleChange(
                      "middleName",
                      e.target.value.replace(/[^a-zA-Z]/g, "")
                    )
                  }
                  placeholder="Middle Name"
                />

              </div>



              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">

                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">

                  <Label
                    text="Last Name"
                    required
                  />

                  <span>:</span>

                </div>

                <Input
                  value={
                    formData.lastName
                  }
                  onChange={(e) =>
                    handleChange(
                      "lastName",
                      e.target.value.replace(/[^a-zA-Z]/g, "")
                    )
                  }
                  placeholder="Last Name"
                />

              </div>


              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">

                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">

                  <Label
                    text="प्रथम नाव"
                    required
                  />

                  <span>:</span>

                </div>

                <Input
                  value={
                    formData.firstNameMarathi
                  }
                  onChange={(e) =>
                    handleChange(
                      "firstNameMarathi",
                      e.target.value.replace(/[^a-zA-Z]/g, "")
                    )
                  }
                  onKeyDown={(e) => e.stopPropagation()}
                  style={{ fontFamily: "'Noto Sans Devanagari', 'Nirmala UI', 'Mangal', 'Poppins', sans-serif" }}
                  placeholder="प्रथम नाव"
                />

              </div>



              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">

                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">

                  <Label
                    text="मधले नाव"
                    required
                  />

                  <span>:</span>

                </div>

                <Input
                  value={
                    formData.middleNameMarathi
                  }
                  onChange={(e) =>
                    handleChange(
                      "middleNameMarathi",
                      e.target.value.replace(/[^a-zA-Z]/g, "")
                    )
                  }
                  onKeyDown={(e) => e.stopPropagation()}
                  style={{ fontFamily: "'Noto Sans Devanagari', 'Nirmala UI', 'Mangal', 'Poppins', sans-serif" }}
                  placeholder="मधले नाव"
                />

              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">

                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">

                  <Label
                    text="आडनाव"
                    required
                  />

                  <span>:</span>

                </div>

                <Input
                  value={
                    formData.lastNameMarathi
                  }
                  onChange={(e) =>
                    handleChange(
                      "lastNameMarathi",
                      e.target.value.replace(/[^a-zA-Z]/g, "")
                    )
                  }
                  onKeyDown={(e) => e.stopPropagation()}
                  style={{ fontFamily: "'Noto Sans Devanagari', 'Nirmala UI', 'Mangal', 'Poppins', sans-serif" }}
                  placeholder="आडनाव"
                />

              </div>


              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">

                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">

                  <Label
                    text="Mobile No."
                    required
                  />

                  <span>:</span>

                </div>

                <Input
                  type="text"
                  maxLength={10}
                  value={formData.mobileNo}
                  onChange={(e) =>
                    handleChange(
                      "mobileNo",
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  placeholder="Mobile No."
                />

              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">

                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">

                  <Label
                    text="Aadhar Card No"
                    required
                  />

                  <span>:</span>

                </div>

                <Input
                  type="text"
                  maxLength={12}
                  value={
                    formData.aadharNo
                  }
                  inputMode="numeric"
                  onChange={(e) =>
                    handleChange(
                      "aadharNo",
                      e.target.value.replace(/\D/g, "")
                    )
                  }

                  placeholder="Aadhar Card No"
                />

              </div>


              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">

                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">

                  <Label
                    text="Email"
                    required
                  />

                  <span>:</span>

                </div>

                <Input
                  type="email"
                  maxLength={30}
                  value={
                    formData.email
                  }
                  onChange={(e) =>
                    handleChange(
                      "email",
                      e.target.value
                    )
                  }
                  placeholder="Email"
                />

              </div>


              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">

                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">

                  <Label
                    text="Address"
                    required
                  />

                  <span>:</span>

                </div>

                <Input
                  value={
                    formData.address
                  }
                  onChange={(e) =>
                    handleChange(
                      "address",
                      e.target.value
                    )
                  }
                  placeholder="Address"
                />

              </div>



              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">

                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">

                  <Label
                    text="पत्ता (मराठी)"
                    required
                  />

                  <span>:</span>

                </div>

                <Input
                  value={
                    formData.addressMarathi
                  }
                  onChange={(e) =>
                    handleChange(
                      "addressMarathi",
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => e.stopPropagation()}
                  style={{ fontFamily: "'Noto Sans Devanagari', 'Nirmala UI', 'Mangal', 'Poppins', sans-serif" }}
                  placeholder="पत्ता"
                />

              </div>


              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">

                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">

                  <Label
                    text="Purpose"
                    required
                  />

                  <span>:</span>

                </div>

                <Input
                  value={
                    formData.purpose
                  }
                  onChange={(e) =>
                    handleChange(
                      "purpose",
                      e.target.value
                    )
                  }
                  placeholder="Purpose"
                />

              </div>



              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">

                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">

                  <Label
                    text="उद्देश (मराठी)"
                    required
                  />

                  <span>:</span>

                </div>

                <Input
                  value={
                    formData.purposeMarathi
                  }
                  onChange={(e) =>
                    handleChange(
                      "purposeMarathi",
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => e.stopPropagation()}
                  style={{ fontFamily: "'Noto Sans Devanagari', 'Nirmala UI', 'Mangal', 'Poppins', sans-serif" }}
                  placeholder="उद्देश"
                />

              </div>
              {isFireBrigadeService && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">

                  <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">

                    <Label
                      text="NOC Purpose"
                      required
                    />

                    <span>:</span>

                  </div>

                  <Select
                    value={formData.nocPurpose || ""}
                    onValueChange={(value) => {
                      console.log("Selected NOC Purpose ID:", value);

                      handleChange(
                        "nocPurpose",
                        value
                      );
                    }}
                    disabled={nocPurposeLoading}
                  >

                    <SelectTrigger className="w-full">

                      <SelectValue
                        placeholder={
                          nocPurposeLoading
                            ? "Loading NOC Purpose..."
                            : "-- Select NOC Purpose --"
                        }
                      />

                    </SelectTrigger>

                    <SelectContent>

                      {nocPurposeList.length > 0 ? (

                        nocPurposeList.map((item) => (

                          <SelectItem
                            key={item.uiKey}
                            value={String(item.id)}
                          >
                            {item.name}
                          </SelectItem>

                        ))

                      ) : (

                        !nocPurposeLoading && (

                          <SelectItem
                            value="no-noc-purpose"
                            disabled
                          >
                            No NOC Purpose available
                          </SelectItem>

                        )

                      )}

                    </SelectContent>

                  </Select>

                </div>
              )}

              {!isFireBrigadeService && !isBndService && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Connection No" required />
                      <span>:</span>
                    </div>

                    <Input
                      value={formData.connectionNo}
                      onChange={(e) =>
                        handleChange("connectionNo", e.target.value)
                      }
                      placeholder="Connection No"
                    />
                  </div>


                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Consume Type" required />
                      <span>:</span>
                    </div>

                    <Select
                      value={formData.consumeType}
                      onValueChange={(value) =>
                        handleChange("consumeType", value)
                      }
                      disabled={consumerTypeLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={consumerTypeLoading ? "Loading..." : "-- Select Option --"} />
                      </SelectTrigger>

                      <SelectContent>
                        {consumerTypeList.length > 0 ? (
                          consumerTypeList.map((consumerType) => (
                            <SelectItem key={consumerType.NUM_WTRCONS_ID} value={String(consumerType.NUM_WTRCONS_ID)}>{consumerType.VAR_WTRCONS_NAME} </SelectItem>
                          )))
                          :
                          (!consumerTypeLoading && (<SelectItem value="no-consumer-type" disabled>No consumer types available</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Meter Type" required />
                      <span>:</span>
                    </div>

                    <Select
                      value={formData.meterType}
                      onValueChange={(value) =>
                        handleChange("meterType", value)
                      }
                      disabled={meterTypeLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={meterTypeLoading ? "Loading..." : "-- Select Option --"} />
                      </SelectTrigger>
                      <SelectContent>
                        {meterTypeList.length > 0 ? (
                          meterTypeList.map((meterType) => (
                            <SelectItem key={meterType.NUM_WTRMETER_ID} value={String(meterType.NUM_WTRMETER_ID)}>
                              {meterType.VAR_WTRMETER_NAME}
                            </SelectItem>
                          )))
                          :
                          (!meterTypeLoading && (<SelectItem value="no-meter-type" disabled>No meter types available</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  {isSewerageService && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Sewerage Type Type" required />
                        <span>:</span>
                      </div>

                      <Select
                        value={formData.sewrageType}
                        onValueChange={(value) =>
                          handleChange("sewrageType", value)
                        }
                        disabled={sewerageTypeLoading}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={sewerageTypeLoading ? "Loading..." : "-- Select Option --"} />
                        </SelectTrigger>
                        <SelectContent>
                          {sewerageTypeList.length > 0 ? (
                            sewerageTypeList.map((sewerageType) => (
                              <SelectItem key={sewerageType.NUM_WTSEWARAGE_ID} value={String(sewerageType.NUM_WTSEWARAGE_ID)}>
                                {sewerageType.VAR_WTSEWARAGE_NAME}
                              </SelectItem>
                            )))
                            :
                            (!sewerageTypeLoading && (<SelectItem value="no-meter-type" disabled>No meter types available</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>


          {isBndService && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#080080]">
                  {isBirthService ? "Birth Details Search" : "Death Details Search"}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label text="Registration No." />
                    <Input
                      value={bndForm.registrationNo}
                      onChange={(e) =>
                        setBndForm((prev) => ({
                          ...prev,
                          registrationNo: e.target.value,
                        }))
                      }
                      placeholder="Enter Registration No."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label text={bndDateLabel} />
                    <Input
                      type="date"
                      value={bndForm.birthDeathDate}
                      onChange={(e) =>
                        setBndForm((prev) => ({
                          ...prev,
                          birthDeathDate: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label text="Mother Name" />
                    <Input
                      value={bndForm.motherName}
                      onChange={(e) =>
                        setBndForm((prev) => ({
                          ...prev,
                          motherName: e.target.value,
                        }))
                      }
                      placeholder="Enter Mother Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label text="Father Name" />
                    <Input
                      value={bndForm.fatherName}
                      onChange={(e) =>
                        setBndForm((prev) => ({
                          ...prev,
                          fatherName: e.target.value,
                        }))
                      }
                      placeholder="Enter Father Name"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleBndSearch}
                    disabled={bndLoading}
                    className="bg-[#080080] hover:bg-[#060066]"
                  >
                    {bndLoading ? "Searching..." : "Search"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isBndService && bndDetails.length > 0 && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#080080]">
                  {bndHeader}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <ShadCNTable
                  headers={[
                    "Select",
                    "Reg No.",
                    "Name",
                    "Gender",
                    bndDateLabel,
                    "Mother Name",
                    "Father Name",
                    "Copies",
                  ]}
                  data={tableBndDetails}
                  keyMapping={{
                    Select: "rowcheck",
                    "Reg No.": "regno",
                    Name: "name",
                    Gender: "gender",
                    [bndDateLabel]: "BNDdate",
                    "Mother Name": "mothername",
                    "Father Name": "fathername",
                    Copies: "copies",
                  }}
                  onRowCheckChange={(row, checked) => {
                    if (checked) {
                      setSelectedBndRecord(row);
                    } else {
                      setSelectedBndRecord(null);
                    }
                  }}
                />
              </CardContent>
            </Card>
          )}




          <div>
            <h4 className="text-md font-semibold mb-3">Document Details</h4>
            <hr className="mb-4" />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border text-sm">
                <thead className="bg-[#083c76] text-white">
                  <tr >
                    <th className="border px-3 py-2 text-left w-20">Sr No.</th>
                    <th className="border px-3 py-2 text-left">Document Name</th>
                    <th className="border px-3 py-2 text-left">Image(jpg,png,pdf)</th>
                  </tr>
                </thead>
                <tbody>

                  {documentLoading && (
                    <tr>
                      <td colSpan={3} className="border px-3 py-6 text-center text-gray-500">Loading documents...</td>
                    </tr>
                  )}

                  {!documentLoading && documentList.length === 0 && (
                    <tr>
                      <td colSpan={3} className="border px-3 py-6 text-center text-gray-500">No documents required for this service.</td>
                    </tr>
                  )}

                  {!documentLoading && documentList.map(
                    (document, index) => (
                      <tr key={document.DOCID || index}>
                        <td className="border px-3 py-2">{index + 1}</td>
                        <td className="border px-3 py-2">
                          <div className="flex flex-col">
                            <span className="font-medium">{document.DOCNAME}</span>
                            {document.ENGDOCDESC && (<span className="text-xs text-gray-500">{document.ENGDOCDESC}</span>)}
                          </div>
                        </td>
                        <td className="border px-3 py-2">
                          {/* <Input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={(e) =>
                              handleDocumentFileChange(
                                document.DOCID,
                                e.target.files?.[0] ||
                                null
                              )
                            }
                            className="cursor-pointer"
                          /> */}
                          <Input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            maxFileSize={5 * 1024 * 1024}
                            onInvalidFile={() => {
                              Swal.fire({
                                text: "Document size must not exceed 5 MB.",
                                confirmButtonColor: "#1e3a8a",
                              });

                              setDocumentFiles((prev) => {
                                const updatedFiles = { ...prev };
                                delete updatedFiles[document.DOCID];
                                return updatedFiles;
                              });
                            }}
                            onInvalidFileType={() => {
                              Swal.fire({
                                text: "Only PDF, JPG, and PNG file formats are allowed.",
                                confirmButtonColor: "#1e3a8a",
                              });

                              setDocumentFiles((prev) => {
                                const updatedFiles = { ...prev };
                                delete updatedFiles[document.DOCID];
                                return updatedFiles;
                              });
                            }}
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              if (file && !isValidDocFile(file)) {
                                e.target.value = "";
                                Swal.fire({
                                  text: "Only PDF, JPG, and PNG file formats are allowed.",
                                  confirmButtonColor: "#1e3a8a",
                                });
                                setDocumentFiles((prev) => {
                                  const updatedFiles = { ...prev };
                                  delete updatedFiles[document.DOCID];
                                  return updatedFiles;
                                });
                                return;
                              }
                              handleDocumentFileChange(
                                document.DOCID,
                                file
                              );
                            }}
                            className="cursor-pointer"
                          />
                          {documentFiles[document.DOCID] && (<p className="mt-1 text-xs text-green-600">Selected:{" "}{documentFiles[document.DOCID].name}</p>)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>


          <div className="flex items-center justify-center gap-3 border-t pt-5">
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</Button>
            <Button type="button" variant="outline" onClick={handleClose} className="px-8"> Close</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FrmWaterConnectionApplication;