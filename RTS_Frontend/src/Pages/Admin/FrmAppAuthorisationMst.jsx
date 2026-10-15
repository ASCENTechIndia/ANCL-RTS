import React, { useState, useEffect, useRef } from "react";
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

const FrmAppAuthorisationMst = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  const locationState = location.state || {};
  const selectedData = locationState.selectedData || {};

  const authMode = locationState.authMode;
  const departId = selectedData.departId;
  const ulbId = user?.ulbId;
  const userId = user?.userId;
  const serviceId = selectedData.serviceId;
  const serviceName = selectedData.serviceName;

  console.log("Location State: ", locationState)
  console.log("ulbId: ", ulbId)
  console.log("user: ", user)

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [headerText, setHeaderText] = useState("");
  const [applicationData, setApplicationData] = useState({});
  const [documents, setDocuments] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [clerkList, setClerkList] = useState([]);
  const [selectedClerk, setSelectedClerk] = useState("");
  const [remark, setRemark] = useState("");
  const [amount, setAmount] = useState("0");
  const [authAction, setAuthAction] = useState("Accept");
  const [rejectReason, setRejectReason] = useState("");
  const [hoRejectRemark, setHoRejectRemark] = useState("");
  const [verificationDocs, setVerificationDocs] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState({});

  const [showClerkSelect, setShowClerkSelect] = useState(false);
  const [showAmount, setShowAmount] = useState(false);
  const [showReturnOption, setShowReturnOption] = useState(false);
  const [showVerificationGrid, setShowVerificationGrid] = useState(false);
  const [showCertificateInfo, setShowCertificateInfo] = useState(false);
  const [showTradeCertificateInfo, setShowTradeCertificateInfo] = useState(false);

  const [showPlumberDetails, setShowPlumberDetails] = useState(false);
  const [showWaterAppDetail, setShowWaterAppDetail] = useState(false);
  const [showWaterAppEntry, setShowWaterAppEntry] = useState(false);
  const [showWaterRegDetail, setShowWaterRegDetail] = useState(false);
  const [showMarketNew, setShowMarketNew] = useState(false);
  const [showMarketCategory, setShowMarketCategory] = useState(false);
  const [showCPTradeName, setShowCPTradeName] = useState(false);
  const [showAddOwn, setShowAddOwn] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showNameTrade, setShowNameTrade] = useState(false);
  const [showMarketExpire, setShowMarketExpire] = useState(false);
  const [showLicenseCancel, setShowLicenseCancel] = useState(false);
  const [showFaultyMeter, setShowFaultyMeter] = useState(false);
  const [showNoDues, setShowNoDues] = useState(false);
  const [showUnauthorisedConn, setShowUnauthorisedConn] = useState(false);
  const [showWaterPressure, setShowWaterPressure] = useState(false);
  const [showWaterQuality, setShowWaterQuality] = useState(false);
  const [showTempDisconnection, setShowTempDisconnection] = useState(false);
  const [showChangeUsage, setShowChangeUsage] = useState(false);
  const [showChangeConnSize, setShowChangeConnSize] = useState(false);
  const [showChangeOwnership, setShowChangeOwnership] = useState(false);
  const [showReconnection, setShowReconnection] = useState(false);
  const [showCertificatePopup, setShowCertificatePopup] = useState(false);
  const [showTradePopup, setShowTradePopup] = useState(false);
  const [certificateServiceId, setCertificateServiceId] = useState("");
  const [tradeType, setTradeType] = useState("T");
  const [certificateFormData, setCertificateFormData] = useState({});
  const [manualCertificateGenerating, setManualCertificateGenerating] = useState(false);
  const [manualCertificateUrl, setManualCertificateUrl] = useState(null);
  const [manualCertificateGenerated, setManualCertificateGenerated] = useState(false);
  const [hoClerkRemark, setHoClerkRemark] = useState("");

  const tableRef = useRef(null);
  const amountManuallyEdited = useRef(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const getDocHeaders = () => {
    const baseHeaders = ["Document Name", "Document Upload by", "View"];
    if (authMode === "CKV") {
      return ["Document Name", "Document Upload by", "View", "Verification Status"];
    }
    return baseHeaders;
  };

  const getDocKeyMapping = () => {
    const baseMapping = {
      "Document Name": "DocName",
      "Document Upload by": "DocType",
      View: "view",
    };

    if (authMode === "CKV") {
      return {
        ...baseMapping,
        "Verification Status": "verificationStatus",
      };
    }

    return baseMapping;
  };

  const docHeaders = getDocHeaders();
  const docKeyMapping = getDocKeyMapping();

  const verifyHeaders = ["Document Name", "Upload", "Action"];

  const verifyKeyMapping = {
    "Document Name": "docName",
    Upload: "upload",
    Action: "action",
  };

  useEffect(() => {
    setHeaderTextBasedOnMode(authMode);
    configureModeSpecificUI(authMode);

    if (selectedData.applino) {
      fetchMenuDetails(selectedData.applino, selectedData.servicid);
    }

    if (authMode === "HODV") {
      fetchClerkList();
    }
  }, []);

  const setHeaderTextBasedOnMode = (mode) => {
    switch (mode) {
      case "HODV":
        setHeaderText("HOD Verification");
        break;
      case "CKV":
        setHeaderText("Clerk Document Verification");
        break;
      case "CK":
        setHeaderText("Clerk Authorization");
        break;
      case "HO":
        setHeaderText("HOD Authorization");
        break;
      default:
        setHeaderText("Application Authorization");
    }
  };

  const configureModeSpecificUI = (mode) => {
    switch (mode) {
      case "HODV":
        setShowClerkSelect(true);
        setShowAmount(false);
        setShowReturnOption(false);
        setShowVerificationGrid(false);
        setShowCertificateInfo(false);
        setShowTradeCertificateInfo(false);
        break;
      case "CKV":
        setShowClerkSelect(false);
        setShowAmount(true);
        setShowReturnOption(false);
        setShowVerificationGrid(false);
        setShowCertificateInfo(false);
        setShowTradeCertificateInfo(false);
        break;
      case "CK":
        setShowClerkSelect(false);
        setShowAmount(false);
        setShowReturnOption(false);
        setShowVerificationGrid(true);
        setShowCertificateInfo(false);
        setShowTradeCertificateInfo(false);
        break;
      case "HO":
        setShowClerkSelect(false);
        setShowAmount(false);
        setShowReturnOption(true);
        setShowVerificationGrid(false);
        setShowCertificateInfo(false);
        setShowTradeCertificateInfo(false);
        break;
      default:
        setShowClerkSelect(false);
        setShowAmount(false);
        setShowReturnOption(false);
        setShowVerificationGrid(false);
        setShowCertificateInfo(false);
        setShowTradeCertificateInfo(false);
    }
  };

  const shouldShowCertificateInfo = (serviceId, departId) => {
    const dept24Services = ["22", "341", "18", "21", "24", "26", "27", "28", "29", "30", "161"];
    if (String(departId) === "24" && dept24Services.includes(String(serviceId))) {
      return true;
    }
    if (String(departId) === "841" && ["501", "304"].includes(String(serviceId))) {
      return true;
    }
    return false;
  };

  const fetchMenuDetails = async (applino, servicid) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/frmAppAuth/menu-details`,
        {
          serviceId: servicid,
          appNo: applino,
          authMode: authMode,
        },
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
        },
      );

      console.log("Menu Details Response:", response);

      if (response.data.ok && response.data.data) {
        let applicationData = {};
        let documentsData = [];
        let serviceDetails = {};
        let additionalData = {};

        if (response.data.data.success && response.data.data.data) {
          const responseData = response.data.data.data;
          applicationData = responseData.application || {};
          documentsData = responseData.documents || [];

          if (responseData.main && responseData.main.length > 0) {
            serviceDetails = responseData.main[0];
          }

          additionalData = {
            directory: responseData.directory || [],
            tradeSwarup: responseData.tradeSwarup || [],
            trade: responseData.trade || [],
            cpTradeName: responseData.cpTradeName || [],
            additionalDetails: responseData.additionalDetails || [],
          };
        } else {
          applicationData = response.data.data.application || {};
          documentsData = response.data.data.documents || [];

          if (response.data.data.main && response.data.data.main.length > 0) {
            serviceDetails = response.data.data.main[0];
          }
        }

        const mergedData = {
          ...applicationData,
          ...serviceDetails,
        };

        console.log("Merged Application Data:", mergedData);
        console.log("Additional Data:", additionalData);

        setApplicationData(mergedData);

        const serviceId = String(servicid);
        setServiceSpecificPanels(serviceId, mergedData, additionalData);

        if (authMode === "CK") {
          if (shouldShowCertificateInfo(serviceId, departId)) {
            if (String(departId) === "841" && ["501", "304"].includes(serviceId)) {
              setShowTradeCertificateInfo(true);
            } else {
              setShowCertificateInfo(true);
            }
          }
        }

        if (mergedData.HOAUTH === "HR") {
          setHoRejectRemark(mergedData.HODREMARK || "");
        }

        if (mergedData.HOAUTH === null || mergedData.HOAUTH === undefined) {
          setHoClerkRemark(mergedData.HODREMARK || "");
        }

        if (mergedData.AMOUNT && !amountManuallyEdited.current) {
          setAmount(String(mergedData.AMOUNT));
        }

        if (documentsData && documentsData.length > 0) {
          setDocuments(documentsData);
          const tableRows = documentsData.map((doc) => {
            const docId = doc.docId || doc.DocId;
            const row = {
              DocName: doc.docName || doc.DocName,
              DocType: doc.docType || doc.DocType,
              view: (
                <Button
                  variant="link"
                  size="sm"
                  className="text-blue-700 hover:text-blue-900 px-0"
                  onClick={() => viewDocument({ ...doc, docId })}
                >
                  View
                </Button>
              ),
            };

            if (authMode === "CKV") {
              row.verificationStatus = (
                <Input
                  type="checkbox"
                  checked={doc.vrfyFlag === "Y"}
                  disabled={true}
                  className="h-5 w-5 cursor-not-allowed"
                  style={{
                    accentColor: "#000000",
                    opacity: 1,
                    filter: "none",
                    WebkitFilter: "none",
                    WebkitOpacity: 1,
                  }}
                  data-docid={docId}
                />
              );
            }

            return row;
          });
          setTableData(tableRows);
        }
      }
    } catch (error) {
      console.error("Error fetching menu details:", error);
      Swal.fire({
        text: error?.response?.data?.error || "Error fetching application details.",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setLoading(false);
    }
  };

  const setServiceSpecificPanels = (serviceId, data, additionalData) => {
    setShowPlumberDetails(false);
    setShowWaterAppDetail(false);
    setShowWaterAppEntry(false);
    setShowWaterRegDetail(false);
    setShowMarketNew(false);
    setShowMarketCategory(false);
    setShowCPTradeName(false);
    setShowAddOwn(false);
    setShowTransfer(false);
    setShowNameTrade(false);
    setShowMarketExpire(false);
    setShowLicenseCancel(false);
    setShowFaultyMeter(false);
    setShowNoDues(false);
    setShowUnauthorisedConn(false);
    setShowWaterPressure(false);
    setShowWaterQuality(false);
    setShowTempDisconnection(false);
    setShowChangeUsage(false);
    setShowChangeConnSize(false);
    setShowChangeOwnership(false);
    setShowReconnection(false);

    const service = String(serviceId);

    const hasData = (keys) => {
      return keys.some(key => {
        const value = data[key];
        return value !== null && value !== undefined && String(value).trim() !== "";
      });
    };

    switch (service) {
      case "24":
      case "25":
        if (hasData(["panno", "applilname", "mobno", "email", "appliaddhar", "address"])) {
          setShowPlumberDetails(true);
        }
        break;

      case "18":
        if (hasData(["connno", "applilname", "mobno", "email", "appliaddhar", "appliaddress"])) {
          setShowWaterAppDetail(true);
        }
        if (hasData(["currname", "newname"])) {
          setShowChangeOwnership(true);
        }
        break;

      case "141":
        if (hasData(["applilname", "mobno", "email", "appliaddhar", "usagetype", "connsize"])) {
          setShowWaterAppEntry(true);
        }
        break;

      case "341":
        if (hasData(["var_wtreg_consno", "applilname", "mobno", "email", "appliaddhar", "usagetype", "connsize", "conaddress", "curconsize", "zonename"])) {
          setShowWaterRegDetail(true);
        }
        if (hasData(["var_wtreg_consno", "connsize"])) {
          setShowChangeConnSize(true);
        }
        break;

      case "21":
        if (hasData(["var_wtreg_consno", "applilname", "mobno", "email", "appliaddhar", "usagetype", "connsize", "conaddress", "curconsize", "zonename"])) {
          setShowWaterRegDetail(true);
        }
        if (hasData(["var_wtreg_consno"])) {
          setShowReconnection(true);
        }
        break;

      case "22":
        if (hasData(["var_wtreg_consno", "applilname", "mobno", "email", "appliaddhar", "usagetype", "connsize", "conaddress", "curconsize", "zonename"])) {
          setShowWaterRegDetail(true);
        }
        if (hasData(["var_wtreg_consno"])) {
          setShowChangeUsage(true);
        }
        break;

      case "161":
        if (hasData(["var_wtreg_consno", "applilname", "mobno", "email", "appliaddhar", "usagetype", "connsize", "conaddress", "curconsize", "zonename"])) {
          setShowWaterRegDetail(true);
        }
        if (hasData(["var_wtreg_consno"])) {
          setShowTempDisconnection(true);
        }
        break;

      case "501":
      case "502":
      case "503":
      case "504":
      case "505":
      case "146":
      case "304":
      case "509":
        if (hasData(["oldlicencno", "shopnameeng", "shopnamemar", "contactno", "email", "address", "placeownername"])) {
          setShowMarketNew(true);
        }
        break;

      case "302":
      case "500":
        if (hasData(["licenseno", "applname", "mobile", "email", "aadhar", "propno"])) {
          setShowMarketCategory(true);
        }
        break;

      case "306":
        if (hasData(["licenseno", "applname", "mobile", "email", "aadhar", "propno"])) {
          setShowMarketCategory(true);
        }
        break;

      case "308":
        if (hasData(["licenseno", "applname", "mobile", "email", "aadhar", "propno"])) {
          setShowMarketCategory(true);
        }
        if (hasData(["newbusiname"])) {
          setShowCPTradeName(true);
        }
        break;

      case "309":
        if (hasData(["licenseno", "applname", "mobile", "email", "aadhar", "propno"])) {
          setShowMarketCategory(true);
        }
        if (additionalData.additionalDetails && additionalData.additionalDetails.length > 0) {
          setShowAddOwn(true);
        }
        break;

      case "508":
        if (hasData(["licenseno", "applname", "mobile", "email", "aadhar", "propno"])) {
          setShowMarketCategory(true);
        }
        if (additionalData.additionalDetails && additionalData.additionalDetails.length > 0) {
          setShowTransfer(true);
        }
        break;

      case "307":
        if (hasData(["licenseno", "applname", "mobile", "email", "aadhar", "propno"])) {
          setShowMarketCategory(true);
        }
        if (hasData(["newbusiname"])) {
          setShowNameTrade(true);
        }
        break;

      case "311":
        if (hasData(["licenseno", "applname", "mobile", "email", "aadhar", "propno"])) {
          setShowMarketCategory(true);
        }
        if (hasData(["relation_name", "remark"])) {
          setShowMarketExpire(true);
        }
        break;

      case "310":
        if (hasData(["licenseno", "applname", "mobile", "email", "aadhar", "propno"])) {
          setShowMarketCategory(true);
        }
        if (hasData(["relation", "licensetype_name", "tradecategory", "closedt"])) {
          setShowLicenseCancel(true);
        }
        break;

      case "27":
        if (hasData(["txtfltname", "txtfltMobileno", "txtfltfulladdress"])) {
          setShowFaultyMeter(true);
        }
        break;

      case "28":
        if (hasData(["txtUnathrzVishay", "txtUnathrzShandarb"])) {
          setShowUnauthorisedConn(true);
        }
        break;

      case "29":
        if (hasData(["txtwtrpreVishy"])) {
          setShowWaterPressure(true);
        }
        break;

      case "30":
        if (hasData(["txtwtrqltyvishay"])) {
          setShowWaterQuality(true);
        }
        break;

      case "26":
        if (hasData(["txtNoduesVishay"])) {
          setShowNoDues(true);
        }
        break;

      default:
        break;
    }
  };

  const fetchClerkList = async () => {
    try {
      const zoneId = applicationData.ZONEID || sessionStorage.getItem("zoneId") || "3";
      const response = await axios.post(
        `${BASE_URL}/api/frmAppAuth/hod-clerk-list`,
        {
          zoneId: Number(zoneId),
        },
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
        },
      );

      console.log("Clerk List Response:", response);

      if (response.data.ok && response.data.data) {
        setClerkList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching clerk list:", error);
    }
  };

  // const previewDocument = (doc) => {
  //   const fileBytes = doc.fileBytes || doc.FileByts;
  //   const fileExtension = doc.fileExtension || doc.FileExtension;
  //   if (fileBytes) {
  //     try {
  //       let byteString = fileBytes;
  //       if (byteString.includes("base64,")) {
  //         byteString = byteString.split("base64,")[1];
  //       }

  //       const byteCharacters = atob(byteString);
  //       const byteNumbers = new Array(byteCharacters.length);
  //       for (let i = 0; i < byteCharacters.length; i++) {
  //         byteNumbers[i] = byteCharacters.charCodeAt(i);
  //       }
  //       const byteArray = new Uint8Array(byteNumbers);

  //       let mimeType = "application/pdf";
  //       if (fileExtension?.toLowerCase() === ".jpg" || fileExtension?.toLowerCase() === ".jpeg") {
  //         mimeType = "image/jpeg";
  //       } else if (fileExtension?.toLowerCase() === ".png") {
  //         mimeType = "image/png";
  //       }

  //       const blob = new Blob([byteArray], { type: mimeType });
  //       const url = URL.createObjectURL(blob);
  //       window.open(url, "_blank");
  //     } catch (error) {
  //       console.error("Error previewing document:", error);
  //       Swal.fire({
  //         text: "Error previewing document",
  //         confirmButtonColor: "#1e3a8a",
  //       });
  //     }
  //   } else {
  //     Swal.fire({
  //       text: "No document uploaded",
  //       confirmButtonColor: "#1e3a8a",
  //     });
  //   }
  // };


  const previewDocument = (doc) => {
    const fileBytes = doc.fileBytes || doc.FileByts;
    const fileExtension = doc.fileExtension || doc.FileExtension;

    if (!fileBytes) {
      Swal.fire({ text: "No document uploaded", confirmButtonColor: "#1e3a8a" });
      return;
    }

    try {
      let byteString = fileBytes;
      if (byteString.includes("base64,")) {
        byteString = byteString.split("base64,")[1];
      }

      const binary = atob(byteString);
      const byteNumbers = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        byteNumbers[i] = binary.charCodeAt(i);
      }

      let mimeType = "application/octet-stream";
      const b = byteNumbers;

      if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) {
        mimeType = "application/pdf";
      } else if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
        mimeType = "image/png";
      } else if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
        mimeType = "image/jpeg";
      } else if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) {
        mimeType = "image/gif";
      } else if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46) {
        mimeType = "image/webp";
      } else {
        const ext = (fileExtension || "").toLowerCase();
        if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
        else if (ext === ".png") mimeType = "image/png";
        else if (ext === ".pdf") mimeType = "application/pdf";
      }

      console.log("Detected MIME:", mimeType, "ext:", fileExtension);

      const blob = new Blob([byteNumbers], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const win = window.open(url, "_blank");
      if (!win) {
        Swal.fire({
          text: "Popup blocked. Please allow popups for this site.",
          confirmButtonColor: "#1e3a8a",
        });
      }

      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      console.error("Error previewing document:", error);
      Swal.fire({ text: "Error previewing document", confirmButtonColor: "#1e3a8a" });
    }
  };

  const viewDocument = async (doc) => {
    if (authMode === "CKV") {
      try {
        const loader = Swal.fire({
          title: "Opening Document...",
          text: "Please wait while we process your document.",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => Swal.showLoading(),
        });

        const response = await axios.post(
          `${BASE_URL}/api/frmAppAuth/update-document-flag`,
          {
            appNo: selectedData.applino,
            docId: doc.docId || doc.DocId,
          },
          {
            headers: {
              Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            },
          }
        );

        loader.close();

        if (response.data.ok) {
          await fetchMenuDetails(selectedData.applino, selectedData.servicid);

          Swal.fire({
            text: "Document verified successfully.",
            confirmButtonColor: "#1e3a8a",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error("Error updating document flag:", error);
        Swal.fire({
          text: error?.response?.data?.error || "Error verifying document.",
          confirmButtonColor: "#1e3a8a",
        });
      }
    }
    previewDocument(doc);
  };

  const handleDocNameChange = (index, value) => {
    const updatedDocs = [...verificationDocs];
    updatedDocs[index] = {
      ...updatedDocs[index],
      docName: value,
    };
    setVerificationDocs(updatedDocs);
  };

  const addVerificationRow = () => {
    const newIndex = verificationDocs.length;
    setVerificationDocs([
      ...verificationDocs,
      {
        docName: "",
        file: null,
        fileName: "No file chosen",
        fileData: null,
      },
    ]);
  };

  const handleFileUpload = (event, index) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedDocs = [...verificationDocs];
        updatedDocs[index] = {
          ...updatedDocs[index],
          file: file,
          fileName: file.name,
          fileData: reader.result,
        };
        setVerificationDocs(updatedDocs);
        const fileBuffer = reader.result;
        setUploadedFiles((prev) => ({
          ...prev,
          [index]: {
            file: file,
            buffer: fileBuffer,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeVerificationRow = (index) => {
    const updatedDocs = verificationDocs.filter((_, i) => i !== index);
    setVerificationDocs(updatedDocs);

    const newUploadedFiles = { ...uploadedFiles };
    delete newUploadedFiles[index];
    setUploadedFiles(newUploadedFiles);
  };

  const isAutoCertificateMode = () => {
    return authMode === "CK" && (Number(departId) === 7 || Number(departId) === 290);
  };

  const handleGenerateCertificate = async () => {
    try {
      setManualCertificateGenerating(true);

      const loader = Swal.fire({
        title: "Generating Certificate...",
        text: "Please wait while we generate the certificate.",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await axios.post(
        `${BASE_URL}/api/frmAppAuth/generate-noc-certificate`,
        {
          userId: user?.userId,
          ulbId: ulbId,
          serviceId: Number(selectedData.servicid),
          appNo: selectedData.applino,
        },
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
        }
      );

      loader.close();

      const errorCode = response.data?.data?.errorCode;

      if (errorCode !== 9999 && errorCode !== -160) {
        Swal.fire({
          text: response.data.message || "Certificate generation failed.",
          confirmButtonColor: "#1e3a8a",
        });
        return;
      }

      const certLoader = Swal.fire({
        title: "Fetching Certificate...",
        text: "Please wait while we fetch the certificate PDF.",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const certResponse = await axios.post(
        `${BASE_URL}/api/FrmTrackApplication/generate-certificate-report`,
        {
          serviceId: String(selectedData.servicid),
          appNo: selectedData.applino,
          ulbId: ulbId,
        },
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
        }
      );

      console.log("certResponse : ", certResponse);

      certLoader.close();

      if (certResponse.data.success && certResponse.data.pdfUrl) {
        setManualCertificateUrl(certResponse.data.pdfUrl);
        setManualCertificateGenerated(true);

        window.open(certResponse.data.pdfUrl, "_blank");

        Swal.fire({
          icon: "success",
          text: response.data.message || "Certificate generated successfully!",
          confirmButtonColor: "#1e3a8a",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          text: "Failed to generate certificate PDF.",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      Swal.fire({
        text: error?.response?.data?.error || "Error generating certificate.",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setManualCertificateGenerating(false);
    }
  };

  const viewManualCertificate = () => {
    if (manualCertificateUrl) {
      window.open(manualCertificateUrl, "_blank");
    } else {
      Swal.fire({
        text: "Certificate not generated yet. Please click 'Generate Certificate' first.",
        confirmButtonColor: "#1e3a8a",
      });
    }
  };

  useEffect(() => {
    if (authMode === "CK" && verificationDocs.length === 0) {
      if (Number(departId) === 7) {
        setVerificationDocs([]);
      } else {
        setVerificationDocs([
          {
            docName: "CertificateORG",
            file: null,
            fileName: "No file chosen",
            fileData: null,
          },
        ]);
      }
    }
  }, [authMode]);

  // useEffect(() => {
  //   if (authMode === "CK" && verificationDocs.length === 0) {
  //     setVerificationDocs([
  //       {
  //         docName: "CertificateORG",
  //         upload: (
  //           <div className="flex flex-col gap-1">
  //             <Input
  //               type="file"
  //               accept=".jpg,.jpeg,.png,.pdf"
  //               className="w-full h-9"
  //               onChange={(e) => handleFileUpload(e, 0)}
  //             />
  //           </div>
  //         ),
  //         action: (
  //           <Button
  //             variant="link"
  //             size="sm"
  //             className="text-red-600 hover:text-red-800 px-0 opacity-50 cursor-not-allowed"
  //             disabled
  //           >
  //             Remove
  //           </Button>
  //         ),
  //       },
  //     ]);
  //   }
  // }, [authMode]);

  const handleSubmit = async () => {
    if (authMode === "HODV" && authAction === "Accept" && !selectedClerk) {
      Swal.fire({
        text: "Please select clerk user",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (authMode === "CKV") {
      if ((amount === "0" || amount === "") && authAction !== "Reject") {
        Swal.fire({
          text: "Please Enter Amount",
          confirmButtonColor: "#1e3a8a",
        });
        return;
      }
      const validDocuments = documents.filter((doc) => doc.docName && doc.docName.trim() !== "");
      if (validDocuments.length > 0) {
        const allVerified = validDocuments.every((doc) => doc.vrfyFlag === "Y");
        if (!allVerified) {
          Swal.fire({
            text: "Please verify all documents.",
            confirmButtonColor: "#1e3a8a",
          });
          return;
        }
      }
    }

    if (authAction !== "Reject" && !remark.trim()) {
      Swal.fire({
        text: "Please Enter Remark",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (authAction === "Reject" && !rejectReason.trim()) {
      Swal.fire({
        text: "Please Enter Reject Reason",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (showVerificationGrid && 
        authAction !== "Reject" &&
        Number(departId) !== 7 && Number(departId) !== 290) {
      // if (showVerificationGrid) {
      const hasAnyDocs = verificationDocs.length > 0;
      if (!hasAnyDocs) {
        Swal.fire({
          text: "Please add document to upload.",
          confirmButtonColor: "#1e3a8a",
        });
        return;
      }

      const invalidRows = verificationDocs.filter(
        (doc) => !doc.docName?.trim() || !doc.file
      );

      if (invalidRows.length > 0) {
        Swal.fire({
          text: "Please add document to upload.",
          confirmButtonColor: "#1e3a8a",
        });
        return;
      }
    }

    if (
      authMode === "CK" &&
      // (Number(departId) === 7 || Number(departId) === 290) &&
      (Number(departId) === 290) &&
      !manualCertificateGenerated
    ) {
      Swal.fire({
        text: "Please generate the certificate first.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    setSubmitting(true);

    const loader = Swal.fire({
      title: "Submitting Application...",
      text: "Please wait while we process your application.",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const payload = {
        userId: user?.userId,
        applicationNo: selectedData.applino,
        status: authAction,
        reasonForReject: authAction === "Reject" ? rejectReason : remark,
        amount: parseInt(amount) || 0,
        // mode: authAction === "Reject" ? "HODV" : authMode,
        mode: authMode,
        clerkId: authMode === "HODV" && authAction === "Accept" ? selectedClerk : null,
        // tinyUrl: authMode === "CKV" ? generateTinyUrl(selectedData.applino) : "",
      };

      console.log("Authorization Payload:", payload);

      const authResponse = await axios.post(
        `${BASE_URL}/api/frmAppAuth/application-auth`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
        },
      );

      console.log("Authorization Response:", authResponse);

      loader.close();

      if (!authResponse.data.ok) {
        Swal.fire({
          text: authResponse.data.data.data.errorMsg || "Authorization failed",
          confirmButtonColor: "#1e3a8a",
        });
        setSubmitting(false);
        return;
      }

      // Generate Cerificate
      // if ((Number(departId) === 7 || Number(departId) === 290) && manualCertificateUrl) {
      if (Number(departId) === 290 && manualCertificateUrl) {
  try {
    console.log({ manualCertificateUrl });

    const pdfResponse = await fetch(manualCertificateUrl);

    if (!pdfResponse.ok) {
      throw new Error("Failed to fetch certificate PDF");
    }

    const pdfBlob = await pdfResponse.blob();

    const pdfFile = new File(
      [pdfBlob],
      `Certificate_${selectedData.applino}.pdf`,
      { type: "application/pdf" }
    );

    const filesToUpload = [
      {
        docName: "CertificateORG",
        file: pdfFile,
      },
    ];

    Object.keys(uploadedFiles)
      .filter((key) => {
        const index = parseInt(key);
        return index > 0 && uploadedFiles[key]?.file;
      })
      .forEach((key) => {
        const index = parseInt(key);

        filesToUpload.push({
          docName:
            verificationDocs[index]?.docName || `Document_${index}`,
          file: uploadedFiles[key].file,
        });
      });

    const formData = new FormData();

    formData.append("ulbid", ulbId);
    formData.append("applino", selectedData.applino);
    formData.append("userid", user?.userId);

    filesToUpload.forEach((fileData) => {
      formData.append("docnames", fileData.docName);
      formData.append("documents", fileData.file);
    });

    console.log(
      "Documents being uploaded:",
      filesToUpload.map((item) => ({
        docName: item.docName,
        fileName: item.file.name,
      }))
    );

    const uploadResponse = await axios.post(
      `${BASE_URL}/api/frmAppAuth/application-verification-document`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${
            token || localStorage.getItem("token")
          }`,
        },
      }
    );

    console.log(
      "Certificate and verification documents upload response:",
      uploadResponse.data
    );

    if (!uploadResponse.data.ok) {
      throw new Error(
        uploadResponse.data.message ||
          "Failed to upload certificate and verification documents"
      );
    }

    console.log(
      "Certificate and verification documents uploaded successfully"
    );
  } catch (uploadError) {
    console.error(
      "Error uploading certificate and verification documents:",
      uploadError
    );
  }
}

      // if (authMode === "CK" && !(Number(departId) === 7 || Number(departId) === 290)) {
      if (authMode === "CK") {
        const filesToUpload = Object.keys(uploadedFiles)
          .filter((key) => uploadedFiles[key]?.file)
          .map((key) => ({
            docName: verificationDocs[parseInt(key)]?.docName || "CertificateORG",
            file: uploadedFiles[key].file,
          }));

        if (filesToUpload.length > 0) {
          await uploadVerificationDocuments(filesToUpload);
        }
      }

      // if (authMode === "CK") {
      //   const filesToUpload = Object.keys(uploadedFiles)
      //     .filter((key) => uploadedFiles[key]?.file)
      //     .map((key) => ({
      //       docName: verificationDocs[parseInt(key)]?.docName || "CertificateORG",
      //       file: uploadedFiles[key].file,
      //     }));

      //   if (filesToUpload.length > 0) {
      //     await uploadVerificationDocuments(filesToUpload);
      //   }
      // }

      if (authMode === "HO" && applicationData.APPSOURCE === "MAHA") {
        await handleMahaOnlineIntegration(authAction);
      }

      Swal.fire({
        text: authResponse.data.data.data.errorMsg || "Authorization submitted successfully",
        confirmButtonColor: "#1e3a8a",
      }).then(() => {
        navigate(`/app/FrmAppAuthorisationList?@=${authMode}`)
      });
    } catch (error) {
      console.error("Error submitting authorization:", error);
      Swal.fire({
        text: error?.response?.data?.error || "Error submitting authorization.",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const uploadVerificationDocuments = async (files) => {
    try {
      const formData = new FormData();

      formData.append("ulbid", ulbId);
      formData.append("applino", selectedData.applino);
      formData.append("userid", user?.userId);

      files.forEach((fileData, index) => {
        const documentName = index === 0 && fileData.docName === "CertificateORG" ? "CertificateORG" : fileData.docName;
        formData.append("docnames", documentName);
        formData.append("documents", fileData.file);
      });

      const response = await axios.post(`${BASE_URL}/api/frmAppAuth/application-verification-document`,
        formData,
        { headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` } }
      );

      if (!response.data.ok) {
        throw new Error(
          response.data.message || "Failed to upload documents"
        );
      }

      console.log(
        "Verification documents uploaded successfully:",
        response.data
      );

      return true;
    } catch (error) {
      console.error("Error uploading verification documents:", error);

      Swal.fire({
        text:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Error uploading documents.",
        confirmButtonColor: "#1e3a8a",
      });

      return false;
    }
  };

  // const handleMahaOnlineIntegration = async (action) => {
  //   try {
  //     const payload = {
  //       applino: selectedData.applino,
  //       action: action,
  //       amount: amount,
  //       userId: user?.userId,
  //     };

  //     const response = await axios.post(
  //       `${BASE_URL}/api/frmAppAuth/maha-online-integration`,
  //       payload,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token || localStorage.getItem("token")}`,
  //         },
  //       },
  //     );

  //     return response.data.ok;
  //   } catch (error) {
  //     console.error("Error in Maha Online integration:", error);
  //     return false;
  //   }
  // };

  const handleCertificateInfo = () => {
    const serviceId = String(selectedData.servicid);

    if (String(departId) === "24") {
      setCertificateServiceId(serviceId);
      setShowCertificatePopup(true);
    }

    else if (String(departId) === "841" && ["501", "304"].includes(serviceId)) {
      setShowTradePopup(true);
    }
  };

  const handleTradeCertificateInfo = () => {
    setShowTradePopup(true);
  };

  const buildCertificateData = (serviceId) => {
    const service = String(serviceId);
    const data = [];

    switch (service) {
      case "22":
        data.push(
          certificateFormData.vishay || "",
          certificateFormData.shandharb || "",
          certificateFormData.effectiveDt || ""
        );
        break;
      case "341":
        data.push(
          certificateFormData.vishay || "",
          certificateFormData.shandharb || "",
          certificateFormData.waterUsage || "",
          certificateFormData.familyCount || "",
          certificateFormData.kararnamaDt || "",
          certificateFormData.manjurDt || "",
          certificateFormData.newConnSizeDt || ""
        );
        break;
      case "18":
        data.push(
          certificateFormData.vishay || "",
          certificateFormData.shandharb || "",
          certificateFormData.meterSize || "",
          certificateFormData.usageType || "",
          certificateFormData.effectiveDt || ""
        );
        break;
      case "21":
        data.push(
          certificateFormData.conAddr || "",
          certificateFormData.houseNo || "",
          certificateFormData.familyCount || "",
          certificateFormData.kararnamaDt || "",
          certificateFormData.manjurDt || "",
          certificateFormData.waterTiming || "",
          certificateFormData.reconDt || "",
          certificateFormData.reason || "",
          certificateFormData.remark || ""
        );
        break;
      case "24":
        data.push(
          certificateFormData.licenseNo || "",
          certificateFormData.renewalPeriod || "",
          certificateFormData.fromTo || "",
          certificateFormData.lastValidDt || ""
        );
        break;
      case "26":
        data.push(
          certificateFormData.vishay || "",
          certificateFormData.shandharb || ""
        );
        break;
      case "27":
        data.push(
          certificateFormData.houseNo || "",
          certificateFormData.waterUsage || "",
          certificateFormData.familyCount || "",
          certificateFormData.appliedDt || "",
          certificateFormData.acceptDt || "",
          certificateFormData.connType || "",
          certificateFormData.waterTiming || "",
          certificateFormData.meterNonWrkDt || "",
          certificateFormData.meterWrkDt || ""
        );
        break;
      case "28":
        data.push(
          certificateFormData.vishay || "",
          certificateFormData.shandharb || "",
          certificateFormData.deptVerf || "",
          certificateFormData.docValid || "",
          certificateFormData.stateComb || "",
          certificateFormData.connBroken || "",
          certificateFormData.puntvAction || ""
        );
        break;
      case "29":
        data.push(
          certificateFormData.vishay || "",
          certificateFormData.shandharb || "",
          certificateFormData.rightPresre || "",
          certificateFormData.obstructionTap || "",
          certificateFormData.garbageStuck || "",
          certificateFormData.sufficientSupply || "",
          certificateFormData.lowPresre || "",
          certificateFormData.custChannel || "",
          certificateFormData.cmpltStatus || ""
        );
        break;
      case "30":
        data.push(
          certificateFormData.vishay || "",
          certificateFormData.shandharb || "",
          certificateFormData.sampleCollDt || "",
          certificateFormData.sampleTestDt || "",
          certificateFormData.meterType || "",
          certificateFormData.chemicalTest || "",
          certificateFormData.freeChlorine || "",
          certificateFormData.ph || "",
          certificateFormData.turbidity || "",
          certificateFormData.chloride || "",
          certificateFormData.hardness || ""
        );
        break;
      case "161":
        data.push(
          certificateFormData.conAddr || "",
          certificateFormData.houseNo || "",
          certificateFormData.familyCount || "",
          certificateFormData.kararnamaDt || "",
          certificateFormData.manjurDt || "",
          certificateFormData.waterTiming || "",
          certificateFormData.disconDt || "",
          certificateFormData.oldMeterDt || "",
          certificateFormData.subConnDt || "",
          certificateFormData.fullName || "",
          certificateFormData.cutDt || "",
          certificateFormData.reason || "",
          certificateFormData.remark || ""
        );
        break;
      default:
        return "";
    }

    return data.join("~");
  };

  const collectTradeFormData = () => {
    return {
      business: certificateFormData.business || "",
      fromDt: certificateFormData.fromDt || "",
      toDt: certificateFormData.toDt || "",
      totalArea: certificateFormData.totalArea || "",
      machineryCount: certificateFormData.machineryCount || "",
      employeeCount: certificateFormData.employeeCount || "",
      electricityApproval: certificateFormData.electricityApproval || "",
      fireSafety: certificateFormData.fireSafety || "",
      firstAid: certificateFormData.firstAid || "",
      licenseNo: certificateFormData.licenseNo || "",
      year: certificateFormData.year || "",
      renewalDt: certificateFormData.renewalDt || "",
      receiptNo: certificateFormData.receiptNo || "",
      amount: certificateFormData.amount || "",
      name: certificateFormData.name || "",
      buildingNo: certificateFormData.buildingNo || "",
      situated: certificateFormData.situated || "",
      noOfArticles: certificateFormData.noOfArticles || "",
      quantity: certificateFormData.quantity || "",
    };
  };

  const renderChangeUsageForm = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label text="विषय" required />
          <Input
            value={certificateFormData.vishay || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, vishay: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="संदर्भ" required />
          <Input
            value={certificateFormData.shandharb || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, shandharb: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="सुधरित वर्गवारी लागु केल्याचा दिनांक" required />
          <Input
            type="date"
            value={certificateFormData.effectiveDt || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, effectiveDt: e.target.value })}
          />
        </div>
      </div>
    );
  };

  const renderChangeConnSizeForm = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label text="विषय" required />
          <Input
            value={certificateFormData.vishay || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, vishay: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="संदर्भ" required />
          <Input
            value={certificateFormData.shandharb || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, shandharb: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="पाण्याचा वापर" required />
          <Input
            value={certificateFormData.waterUsage || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, waterUsage: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="कुटुंब संख्या" required />
          <Input
            type="number"
            value={certificateFormData.familyCount || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, familyCount: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="नळ कनेक्शन करारनामा तारीख" required />
          <Input
            type="date"
            value={certificateFormData.kararnamaDt || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, kararnamaDt: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="मंजुर क्रमांक तारीख" required />
          <Input
            type="date"
            value={certificateFormData.manjurDt || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, manjurDt: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="सुधरित आकाराचे संयोजन जोडणी तारीख" required />
          <Input
            type="date"
            value={certificateFormData.newConnSizeDt || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, newConnSizeDt: e.target.value })}
          />
        </div>
      </div>
    );
  };

  const renderChangeOwnershipForm = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label text="विषय" required />
          <Input
            value={certificateFormData.vishay || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, vishay: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="संदर्भ" required />
          <Input
            value={certificateFormData.shandharb || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, shandharb: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="मिटरचा आकार" required />
          <Input
            value={certificateFormData.meterSize || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, meterSize: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="मुळ वर्गवारी" required />
          <Input
            value={certificateFormData.usageType || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, usageType: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="सुधरित हस्तांतरण लागु केल्याचा दिनांक" required />
          <Input
            type="date"
            value={certificateFormData.effectiveDt || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, effectiveDt: e.target.value })}
          />
        </div>
      </div>
    );
  };

  const renderTradeDetailsForm = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label text="यांना हा उद्योगधंदा" required />
          <Input
            value={certificateFormData.business || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, business: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="सुरु करण्याचा दि" required />
          <Input
            type="date"
            value={certificateFormData.fromDt || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, fromDt: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="ते दि" required />
          <Input
            type="date"
            value={certificateFormData.toDt || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, toDt: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="एकुण क्षेत्र" required />
          <Input
            type="number"
            value={certificateFormData.totalArea || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, totalArea: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="एकुण मशिनरी संख्या" required />
          <Input
            type="number"
            value={certificateFormData.machineryCount || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, machineryCount: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="कर्मचारी संख्या" required />
          <Input
            type="number"
            value={certificateFormData.employeeCount || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, employeeCount: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="विजेबाबत मंजुरी" required />
          <Input
            value={certificateFormData.electricityApproval || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, electricityApproval: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="अग्निशामक साधने" required />
          <Select
            value={certificateFormData.fireSafety || ""}
            onValueChange={(value) => setCertificateFormData({ ...certificateFormData, fireSafety: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Y">आहेत</SelectItem>
              <SelectItem value="N">नाहीत</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label text="प्रथमोपचार साधने" required />
          <Select
            value={certificateFormData.firstAid || ""}
            onValueChange={(value) => setCertificateFormData({ ...certificateFormData, firstAid: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Y">आहेत</SelectItem>
              <SelectItem value="N">नाहीत</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label text="परवाना क्रमांक" required />
          <Input
            value={certificateFormData.licenseNo || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, licenseNo: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="वर्ष" />
          <Input
            type="number"
            value={certificateFormData.year || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, year: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="नुतनीकरण केल्याची तारीख" />
          <Input
            type="date"
            value={certificateFormData.renewalDt || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, renewalDt: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="पावती नंबर" />
          <Input
            value={certificateFormData.receiptNo || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, receiptNo: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="भरलेले शुल्क" />
          <Input
            type="number"
            value={certificateFormData.amount || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, amount: e.target.value })}
          />
        </div>
      </div>
    );
  };

  const renderStorageDetailsForm = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label text="नाव" required />
          <Input
            value={certificateFormData.name || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, name: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="इमारत क्रमांक" required />
          <Input
            type="number"
            value={certificateFormData.buildingNo || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, buildingNo: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="येथे स्थित" required />
          <Input
            value={certificateFormData.situated || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, situated: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="वस्तूंची संख्या" required />
          <Input
            type="number"
            value={certificateFormData.noOfArticles || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, noOfArticles: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label text="ठेवण्यास परवानगी असलेली कमाल मात्रा" required />
          <Input
            type="number"
            value={certificateFormData.quantity || ""}
            onChange={(e) => setCertificateFormData({ ...certificateFormData, quantity: e.target.value })}
          />
        </div>
      </div>
    );
  };

  const renderCertificateForm = (serviceId) => {
    switch (String(serviceId)) {
      case "22":
        return renderChangeUsageForm();
      case "341":
        return renderChangeConnSizeForm();
      case "18":
        return renderChangeOwnershipForm();
      case "21":
        return renderReconnectionForm();
      case "24":
        return renderPlumberForm();
      case "26":
        return renderNoDuesForm();
      case "27":
        return renderFaultyMeterForm();
      case "28":
        return renderUnauthorisedConnForm();
      case "29":
        return renderWaterPressureForm();
      case "30":
        return renderWaterQualityForm();
      case "161":
        return renderDisconnectionForm();
      default:
        return <p>Certificate form not available for this service</p>;
    }
  };

  const renderTradeForm = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <Label text="Trade Type" />
          <Select
            value={tradeType}
            onValueChange={setTradeType}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="T">Trade</SelectItem>
              <SelectItem value="S">Storage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {tradeType === "T" ? renderTradeDetailsForm() : renderStorageDetailsForm()}
      </div>
    );
  };

  const handlePreviewCertificate = async () => {
    try {
      const applidata = buildCertificateData(certificateServiceId);

      const payload = {
        userId: user?.userId,
        applino: selectedData.applino,
        serviceid: certificateServiceId,
        applidata: applidata,
      };

      const response = await axios.post(
        `${BASE_URL}/api/frmAppAuth/certificate-preview`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.ok) {
        window.open(response.data.data.certificateUrl, '_blank');
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      Swal.fire({
        text: "Error generating certificate",
        confirmButtonColor: "#1e3a8a",
      });
    }
  };

  const handleSubmitTrade = async () => {
    try {
      const tradeData = collectTradeFormData();
      const response = await axios.post(
        `${BASE_URL}/api/frmAppAuth/trade-certificate`,
        {
          userId: user?.userId,
          applino: selectedData.applino,
          serviceid: selectedData.servicid,
          tradeType: tradeType,
          tradeData: tradeData,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.ok) {
        Swal.fire({
          text: "Trade certificate generated successfully",
          confirmButtonColor: "#1e3a8a",
        });
        setShowTradePopup(false);
      }
    } catch (error) {
      console.error("Error submitting trade:", error);
      Swal.fire({
        text: "Error submitting trade certificate",
        confirmButtonColor: "#1e3a8a",
      });
    }
  };

  const renderApplicationDetails = () => {
    const {
      SERVICNAME,
      ZONENAME,
      APLINO,
      APLIDT,
      APLINM,
      MOBNO,
      EMAIL,
      AADHARNO,
      ADDRESS,
      PROPERTYNO,
      PURPOSE,
      CONS_NAME,
      METER_NAME,
      SECTOR_NAME,
      VILLAGE_NAME,
      LOCALITY,
      LANDMARK,
      PINCODE,
      REFNO,
      var_wtreg_consno,
      applilname,
      usagetype,
      connsize,
      conaddress,
      curconsize,
      zonename,
      connno,
      var_wtregister_appliname,
      var_usagetype_name,
      num_connsize_size,
      var_wtregister_conaddresssrch,
      var_wtregister_curconsizesrch,
    } = applicationData;

    const formattedDate = APLIDT
      ? new Date(APLIDT).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      : "";

    const serviceId = selectedData.servicid;

    const isWaterService = ["341", "21", "22", "161"].includes(String(serviceId));
    const isFaultyService = ["27", "28", "29", "30"].includes(String(serviceId));
    const isWaterBillService = String(serviceId) === "23";
    const isSectorService = ["62", "60"].includes(String(serviceId));
    const isComplaintService = ["41", "461"].includes(String(serviceId));

    const connectionNo = var_wtreg_consno || connno || PROPERTYNO || "";
    const applicantName = applilname || var_wtregister_appliname || APLINM || "";
    const waterMobileNo = MOBNO || "";
    const waterEmail = EMAIL || "";
    const waterAadharNo = AADHARNO || "";
    const waterUsageType = usagetype || var_usagetype_name || "";
    const waterConnectionSize = connsize || num_connsize_size || "";
    const waterAddress = conaddress || var_wtregister_conaddresssrch || ADDRESS || "";
    const zoneName = zonename || ZONENAME || "";

    const showConnectionInMain = isFaultyService || isWaterService || isWaterBillService;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text="Service" />
            <span>:</span>
          </div>
          <span className="min-w-0 break-all flex-1">{SERVICNAME || ""}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text="Zone" />
            <span>:</span>
          </div>
          <span className="min-w-0 break-all flex-1">{zoneName || ""}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text="Application No" />
            <span>:</span>
          </div>
          <span className="min-w-0 break-all flex-1">{APLINO || ""}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text="Application Date" />
            <span>:</span>
          </div>
          <span className="min-w-0 break-all flex-1">{formattedDate}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text="Applicant Name" />
            <span>:</span>
          </div>
          <span className="min-w-0 break-all flex-1">{applicantName || ""}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text="Mobile No" />
            <span>:</span>
          </div>
          <span className="min-w-0 break-all flex-1">{waterMobileNo || ""}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text="Email" />
            <span>:</span>
          </div>
          <span className="min-w-0 break-all flex-1">{waterEmail || ""}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text="Aadhar No" />
            <span>:</span>
          </div>
          <span className="min-w-0 break-all flex-1">{waterAadharNo || ""}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text="Area" />
            <span>:</span>
          </div>
          <span className="min-w-0 break-all flex-1">{waterAddress || ""}</span>
        </div>

        {showConnectionInMain && connectionNo && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="Connection No" />
              <span>:</span>
            </div>
            <span className="min-w-0 break-all flex-1">{connectionNo}</span>
          </div>
        )}

        {PURPOSE && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
              <Label text="Purpose" />
              <span>:</span>
            </div>
            <span className="min-w-0 break-all flex-1">{PURPOSE}</span>
          </div>
        )}

        {isWaterBillService && CONS_NAME && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                <Label text="Consumer Type" />
                <span>:</span>
              </div>
              <span className="min-w-0 break-all flex-1">{CONS_NAME}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                <Label text="Meter Type" />
                <span>:</span>
              </div>
              <span className="min-w-0 break-all flex-1">{METER_NAME}</span>
            </div>
          </>
        )}

        {isSectorService && SECTOR_NAME && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                <Label text="Sector" />
                <span>:</span>
              </div>
              <span className="min-w-0 break-all flex-1">{SECTOR_NAME}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                <Label text="Village" />
                <span>:</span>
              </div>
              <span className="min-w-0 break-all flex-1">{VILLAGE_NAME}</span>
            </div>
          </>
        )}

        {isComplaintService && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                <Label text="Locality" />
                <span>:</span>
              </div>
              <span className="min-w-0 break-all flex-1">{LOCALITY || ""}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                <Label text="LandMark" />
                <span>:</span>
              </div>
              <span className="min-w-0 break-all flex-1">{LANDMARK || ""}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                <Label text="Pincode" />
                <span>:</span>
              </div>
              <span className="min-w-0 break-all flex-1">{PINCODE || ""}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                <Label text="तक्रारीचे स्वरूप" />
                <span>:</span>
              </div>
              <span className="min-w-0 break-all flex-1">{REFNO || ""}</span>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderServicePanels = () => {
    const serviceId = String(selectedData.servicid);

    const {
      panno: plumpanno,
      applilname: plumapplilname,
      mobno: plummobno,
      email: plumemail,
      appliaddhar: plumappliaddhar,
      address: plumaddress,
      connno: wtconnno,
      applilname: wtapplilname,
      mobno: wtmobno,
      email: wtemail,
      appliaddhar: wtappliaddhar,
      appliaddress: wtappliaddress,
      currname: wtcurrname,
      newname: wtnewname,

      applilname: entryapplilname,
      mobno: entrymobno,
      email: entryemail,
      appliaddhar: entryappliaddhar,
      usagetype: entryusagetype,
      connsize: entryconnsize,

      var_wtreg_consno: wtregconsno,
      applilname: wtregapplilname,
      mobno: wtregmobno,
      email: wtregemail,
      appliaddhar: wtregappliaddhar,
      usagetype: wtregusagetype,
      connsize: wtregconnsize,
      conaddress: wtregconaddress,
      curconsize: wtregcurconsize,
      zonename: wtregzonename,

      oldlicencno,
      shopnameeng,
      shopnamemar,
      panno: mktpanno,
      contactno,
      email: mktemail,
      address: mktaddress,
      arreasamt,
      fromdt,
      todt,
      amount: mktamount,
      placeownername,
      placeowneraddress,
      area,
      licensetype_name,
      jalanshil_name,
      illegal_name,
      propno,
      trdbusinesstype,

      licenseno,
      applname,
      mobile,
      email: catemail,
      aadhar,
      propno: catpropno,
      address: cataddress,
      licowner,
      licensetype,
      licfromdt,
      lictodt,
      businame,
      busitype,
      busiaddress,
      gender,
      jalanshil_name: catjalanshil,

      newbusiname,

      remark: expireRemark,
      relation_name,

      relation: cancelRel,
      licensetype_name: cancelLicType,
      jalanshil: cancelJwalan,
      adhikrutta,
      tradecategory,
      closedt,
    } = applicationData;

    return (
      <>
        {showPlumberDetails && (
          <div className="border rounded-lg p-4 mt-4">
            <div className="font-semibold text-md mb-4">Plumber License Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Pan No" />
                  <span>:</span>
                </div>
                <span>{plumpanno || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Applicant Name" />
                  <span>:</span>
                </div>
                <span>{plumapplilname || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Mobile No" />
                  <span>:</span>
                </div>
                <span>{plummobno || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Email" />
                  <span>:</span>
                </div>
                <span>{plumemail || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Aadhaar No" />
                  <span>:</span>
                </div>
                <span>{plumappliaddhar || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Address" />
                  <span>:</span>
                </div>
                <span>{plumaddress || ""}</span>
              </div>
            </div>
          </div>
        )}

        {showWaterAppDetail && (
          <div className="border rounded-lg p-4 mt-4">
            <div className="font-semibold text-md mb-4">Water Application Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Conn No" />
                  <span>:</span>
                </div>
                <span>{wtconnno || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Applicant Name" />
                  <span>:</span>
                </div>
                <span>{wtapplilname || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Mobile No" />
                  <span>:</span>
                </div>
                <span>{wtmobno || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Email" />
                  <span>:</span>
                </div>
                <span>{wtemail || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Aadhaar No" />
                  <span>:</span>
                </div>
                <span>{wtappliaddhar || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Address" />
                  <span>:</span>
                </div>
                <span>{wtappliaddress || ""}</span>
              </div>
            </div>
          </div>
        )}

        {showWaterAppEntry && (
          <div className="border rounded-lg p-4 mt-4">
            <div className="font-semibold text-md mb-4">Water Application Entry</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Applicant Name" />
                  <span>:</span>
                </div>
                <span>{entryapplilname || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Mobile No" />
                  <span>:</span>
                </div>
                <span>{entrymobno || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Email" />
                  <span>:</span>
                </div>
                <span>{entryemail || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Aadhaar No" />
                  <span>:</span>
                </div>
                <span>{entryappliaddhar || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Usage Type" />
                  <span>:</span>
                </div>
                <span>{entryusagetype || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Connection Size" />
                  <span>:</span>
                </div>
                <span>{entryconnsize || ""}</span>
              </div>
            </div>
          </div>
        )}

        {showWaterRegDetail && (
          <div className="border rounded-lg p-4 mt-4">
            <div className="font-semibold text-md mb-4">Water Registration Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Connection No" />
                  <span>:</span>
                </div>
                <span>{wtregconsno || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Applicant Name" />
                  <span>:</span>
                </div>
                <span>{wtregapplilname || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Mobile No" />
                  <span>:</span>
                </div>
                <span>{wtregmobno || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Email" />
                  <span>:</span>
                </div>
                <span>{wtregemail || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Aadhaar No" />
                  <span>:</span>
                </div>
                <span>{wtregappliaddhar || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Usage Type" />
                  <span>:</span>
                </div>
                <span>{wtregusagetype || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Connection Size" />
                  <span>:</span>
                </div>
                <span>{wtregconnsize || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Address" />
                  <span>:</span>
                </div>
                <span>{wtregconaddress || ""}</span>
              </div>
              {wtregcurconsize && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                    <Label text="Current Size" />
                    <span>:</span>
                  </div>
                  <span>{wtregcurconsize}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Zone" />
                  <span>:</span>
                </div>
                <span>{wtregzonename || ""}</span>
              </div>
            </div>
          </div>
        )}

        {showMarketNew && (
          <div className="border rounded-lg p-4 mt-4">
            <div className="font-semibold text-md mb-4">Market / Trade License Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="परवाना क्रमांक" />
                  <span>:</span>
                </div>
                <span>{oldlicencno || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="दुकानाचे नाव (Eng)" />
                  <span>:</span>
                </div>
                <span>{shopnameeng || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="दुकानाचे नाव (Mar)" />
                  <span>:</span>
                </div>
                <span>{shopnamemar || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="पॅन कार्ड" />
                  <span>:</span>
                </div>
                <span>{mktpanno || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="संपर्क क्र." />
                  <span>:</span>
                </div>
                <span>{contactno || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="ई-मेल" />
                  <span>:</span>
                </div>
                <span>{mktemail || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="पत्ता" />
                  <span>:</span>
                </div>
                <span>{mktaddress || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="थकबाकी" />
                  <span>:</span>
                </div>
                <span>{arreasamt || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="दिनांका पासून" />
                  <span>:</span>
                </div>
                <span>{fromdt ? new Date(fromdt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="दिनांका पर्यंत" />
                  <span>:</span>
                </div>
                <span>{todt ? new Date(todt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="रक्कम" />
                  <span>:</span>
                </div>
                <span>{mktamount || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Property No" />
                  <span>:</span>
                </div>
                <span>{propno || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="अर्जदाराचे नाव" />
                  <span>:</span>
                </div>
                <span>{placeownername || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="अर्जदाराचा पत्ता" />
                  <span>:</span>
                </div>
                <span>{placeowneraddress || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Area Sq.ft" />
                  <span>:</span>
                </div>
                <span>{area || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="व्यवसाय ची जागा" />
                  <span>:</span>
                </div>
                <span>{licensetype_name || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="व्यवसायाचे स्वरूप" />
                  <span>:</span>
                </div>
                <span>{trdbusinesstype || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="ज्वलनशील" />
                  <span>:</span>
                </div>
                <span>{jalanshil_name || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Illegal Property" />
                  <span>:</span>
                </div>
                <span>{illegal_name || ""}</span>
              </div>
            </div>
          </div>
        )}

        {showMarketCategory && (
          <div className="border rounded-lg p-4 mt-4">
            <div className="font-semibold text-md mb-4">Market Category Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="License No" />
                  <span>:</span>
                </div>
                <span>{licenseno || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Applicant Name" />
                  <span>:</span>
                </div>
                <span>{applname || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Mobile Number" />
                  <span>:</span>
                </div>
                <span>{mobile || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Email" />
                  <span>:</span>
                </div>
                <span>{catemail || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Aadhar Number" />
                  <span>:</span>
                </div>
                <span>{aadhar || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Property Number" />
                  <span>:</span>
                </div>
                <span>{catpropno || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Residential Address" />
                  <span>:</span>
                </div>
                <span>{cataddress || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="परवाना धारकाचे नाव" />
                  <span>:</span>
                </div>
                <span>{licowner || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="परवाना प्रकार" />
                  <span>:</span>
                </div>
                <span>{licensetype || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="परवाना दिनांका पासून" />
                  <span>:</span>
                </div>
                <span>{licfromdt ? new Date(licfromdt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="परवाना दिनांका पर्यंत" />
                  <span>:</span>
                </div>
                <span>{lictodt ? new Date(lictodt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="व्यवसायाचे नाव" />
                  <span>:</span>
                </div>
                <span>{businame || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="व्यवसायाचे स्वरूप" />
                  <span>:</span>
                </div>
                <span>{busitype || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="व्यवसायाचा पत्ता" />
                  <span>:</span>
                </div>
                <span>{busiaddress || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="लिंग" />
                  <span>:</span>
                </div>
                <span>{gender || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="ज्वलनशील" />
                  <span>:</span>
                </div>
                <span>{catjalanshil || ""}</span>
              </div>
            </div>
          </div>
        )}

        {showCPTradeName && (
          <div className="border rounded-lg p-4 mt-4">
            <div className="font-semibold text-md mb-4">CP Trade Name</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="लिंग" />
                  <span>:</span>
                </div>
                <span>{gender || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="New Business Name" />
                  <span>:</span>
                </div>
                <span>{newbusiname || ""}</span>
              </div>
            </div>
          </div>
        )}

        {showAddOwn && (
          <div className="border rounded-lg p-4 mt-4">
            <div className="font-semibold text-md mb-4">Add Owner/Director</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="लिंग" />
                  <span>:</span>
                </div>
                <span>{gender || ""}</span>
              </div>
            </div>
          </div>
        )}

        {showTransfer && (
          <div className="border rounded-lg p-4 mt-4">
            <div className="font-semibold text-md mb-4">Transfer Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="नाते" />
                  <span>:</span>
                </div>
                <span>{cancelRel || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Reason" />
                  <span>:</span>
                </div>
                <span>{expireRemark || ""}</span>
              </div>
            </div>
          </div>
        )}

        {showNameTrade && (
          <div className="border rounded-lg p-4 mt-4">
            <div className="font-semibold text-md mb-4">Name Trade</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="लिंग" />
                  <span>:</span>
                </div>
                <span>{gender || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="New Business Name" />
                  <span>:</span>
                </div>
                <span>{newbusiname || ""}</span>
              </div>
            </div>
          </div>
        )}

        {showMarketExpire && (
          <div className="border rounded-lg p-4 mt-4">
            <div className="font-semibold text-md mb-4">License Expire Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="नाते" />
                  <span>:</span>
                </div>
                <span>{relation_name || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="Reason" />
                  <span>:</span>
                </div>
                <span>{expireRemark || ""}</span>
              </div>
            </div>
          </div>
        )}

        {showLicenseCancel && (
          <div className="border rounded-lg p-4 mt-4">
            <div className="font-semibold text-md mb-4">License Cancel Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="लिंग" />
                  <span>:</span>
                </div>
                <span>{gender || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="नाते" />
                  <span>:</span>
                </div>
                <span>{cancelRel || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="परवानाचा प्रकार" />
                  <span>:</span>
                </div>
                <span>{cancelLicType || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="ज्वलनशील" />
                  <span>:</span>
                </div>
                <span>{cancelJwalan || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="अधिकृत मालमत्ता" />
                  <span>:</span>
                </div>
                <span>{adhikrutta || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="व्यवसायाचा प्रकार" />
                  <span>:</span>
                </div>
                <span>{tradecategory || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="बंद केल्याचा दिनांक" />
                  <span>:</span>
                </div>
                <span>{closedt ? new Date(closedt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""}</span>
              </div>
            </div>
          </div>
        )}

        {showFaultyMeter && (
          <div className="border rounded-lg p-4 mt-4">
            <div className="font-semibold text-md mb-4">Faulty Meter Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="नळ जोडणी धारकाचे नाव" />
                  <span>:</span>
                </div>
                <span>{applicationData.txtfltname || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="मोबाईल नंबर" />
                  <span>:</span>
                </div>
                <span>{applicationData.txtfltMobileno || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="संपूर्ण पत्ता" />
                  <span>:</span>
                </div>
                <span>{applicationData.txtfltfulladdress || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="प्रभाग क्रमांक" />
                  <span>:</span>
                </div>
                <span>{applicationData.txtfltPrabhagno || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="पाण्याचा वापर" />
                  <span>:</span>
                </div>
                <span>{applicationData.txtfltwaterusage || ""}</span>
              </div>
            </div>
          </div>
        )}

        {showUnauthorisedConn && (
          <div className="border rounded-lg p-4 mt-4">
            <div className="font-semibold text-md mb-4">Unauthorised Connection Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="विषय" />
                  <span>:</span>
                </div>
                <span>{applicationData.txtUnathrzVishay || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="संदर्भ" />
                  <span>:</span>
                </div>
                <span>{applicationData.txtUnathrzShandarb || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label text="विभागाचा पडताळणी अहवाल" />
                  <span>:</span>
                </div>
                <span>{applicationData.txtUnathrzDeptverf || ""}</span>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-semibold boxHead">
            {headerText}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="border rounded-lg p-4">
            <div className="font-semibold text-md mb-4">Application Details</div>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
              </div>
            ) : (
              renderApplicationDetails()
            )}
          </div>

          {renderServicePanels()}

          {documents.length > 0 && (
            <div className="border rounded-lg p-4">
              <div className="font-semibold text-md mb-4">Documents</div>
              <div className="overflow-x-auto">
                <ShadCNTable
                  headers={docHeaders}
                  data={tableData}
                  keyMapping={docKeyMapping}
                  pagination={false}
                  className="max-md:min-w-380"
                />
              </div>
            </div>
          )}

          {showVerificationGrid && (
            <div className="border rounded-lg p-4">
              <div className="font-semibold text-md mb-4">Upload Documents</div>
              <div className="overflow-x-auto">
                <ShadCNTable
                  headers={verifyHeaders}
                  data={verificationDocs.map((doc, index) => {
                    // const isAutoMode = Number(departId) === 7 || Number(departId) === 290;
                    const isAutoMode = Number(departId) === 290;
                    return {
                      docName: (
                        <Input
                          type="text"
                          placeholder="Enter document name..."
                          className="w-full h-8 text-sm"
                          value={doc.docName || ""}
                          onChange={(e) => handleDocNameChange(index, e.target.value)}
                          disabled={index === 0 && doc.docName === "CertificateORG"}
                        />
                      ),
                      upload: (
                        <div className="flex flex-row gap-1">
                          <Input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="w-full h-9"
                            onChange={(e) => handleFileUpload(e, index)}
                            disabled={isAutoMode && index === 0}
                          />
                          {/* {doc.fileName && doc.fileName !== "No file chosen" && (
                          <span className="text-xs text-gray-500 truncate max-w-[80px]">
                            {doc.fileName}
                          </span>
                        )} */}
                          {isAutoMode && index === 0 && (
                            <Button
                              type="button"
                              size="sm"
                              className="bg-green-700 hover:bg-green-800 text-white whitespace-nowrap h-9"
                              onClick={handleGenerateCertificate}
                              disabled={manualCertificateGenerating}
                            >
                              {manualCertificateGenerating ? "Generating..." : "Generate Certificate"}
                            </Button>
                          )}
                        </div>
                      ),
                      // action: (
                      //   <Button
                      //     variant="link"
                      //     size="sm"
                      //     className={`px-0 ${index === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
                      //     onClick={() => {
                      //       if (index === 0 && doc.docName === "CertificateORG") {
                      //         return;
                      //       }
                      //       removeVerificationRow(index);
                      //     }}
                      //     disabled={index === 0 && doc.docName === "CertificateORG"}
                      //   >
                      //     Remove
                      //   </Button>
                      // ),

                      // For View Button Procedure
                      action: (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="link"
                            size="sm"
                            className={`px-0 ${(isAutoMode && index === 0) || (index === 0 && doc.docName === "CertificateORG")
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-800'
                              }`}
                            onClick={() => {
                              if (isAutoMode && index === 0) return;
                              if (index === 0 && doc.docName === "CertificateORG") {
                                return;
                              }
                              removeVerificationRow(index);
                            }}
                            disabled={(isAutoMode && index === 0) || (index === 0 && doc.docName === "CertificateORG")}
                          >
                            Remove
                          </Button>

                          {isAutoMode && index === 0 && (
                            <Button
                              variant="link"
                              size="sm"
                              className={`px-0 ${manualCertificateGenerated
                                ? 'text-blue-700 hover:text-blue-900'
                                : 'text-gray-400 cursor-not-allowed'
                                }`}
                              onClick={viewManualCertificate}
                              disabled={!manualCertificateGenerated}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      ),
                    }
                  })}
                  keyMapping={verifyKeyMapping}
                  pagination={false}
                  className="max-md:min-w-380"
                />
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  className="bg-blue-900 hover:bg-blue-800 text-white"
                  onClick={addVerificationRow}
                >
                  Add New Record
                </Button>
              </div>
            </div>
          )}

          {/* {showCertificateInfo && (
            <div className="border rounded-lg p-4">
              <div className="flex justify-start">
                <Button
                  type="button"
                  className="bg-blue-900 hover:bg-blue-800 text-white"
                  onClick={handleCertificateInfo}
                >
                  Certificate Info
                </Button>
              </div>
            </div>
          )} */}

          {/* {showTradeCertificateInfo && (
            <div className="border rounded-lg p-4">
              <div className="flex justify-start">
                <Button
                  type="button"
                  className="bg-blue-900 hover:bg-blue-800 text-white"
                  onClick={handleTradeCertificateInfo}
                >
                  Trade Certificate Info
                </Button>
              </div>
            </div>
          )} */}

          {/* {showCertificatePopup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Certificate Info</h3>
                  <Button variant="ghost" onClick={() => setShowCertificatePopup(false)}>✕</Button>
                </div>

                {renderCertificateForm(certificateServiceId)}

                <div className="flex justify-end gap-3 mt-4">
                  <Button
                    className="bg-blue-900 hover:bg-blue-800 text-white"
                    onClick={handlePreviewCertificate}
                  >
                    Preview Certificate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCertificatePopup(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )} */}

          {/* {showTradePopup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Trade Certificate Details</h3>
                  <Button variant="ghost" onClick={() => setShowTradePopup(false)}>✕</Button>
                </div>

                {renderTradeForm()}

                <div className="flex justify-end gap-3 mt-4">
                  <Button
                    className="bg-blue-900 hover:bg-blue-800 text-white"
                    onClick={handleSubmitTrade}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowTradePopup(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )} */}

          <div className="border rounded-lg p-4">
            <div className="font-semibold text-md mb-4">Authorization</div>

            {authMode === "HO" && (applicationData.HOAUTH === null || applicationData.HOAUTH === undefined) && hoClerkRemark && (
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 mb-4">
                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label className="font-medium" text="Clerk Remark" />
                  <span>:</span>
                </div>
                <span className="font-medium">{hoClerkRemark}</span>
              </div>
            )}

            {hoRejectRemark && (
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 mb-4">
                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label className="font-medium" text="HOD Returned Remark" />
                  <span>:</span>
                </div>
                <span className="font-medium">{hoRejectRemark}</span>
              </div>
            )}

            {showClerkSelect && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label required className="font-medium" text="Clerk" />
                  <span>:</span>
                </div>
                <Select
                  value={selectedClerk}
                  onValueChange={setSelectedClerk}
                  disabled={authAction !== "Accept"}
                >
                  <SelectTrigger className="w-full sm:w-64 h-9">
                    <SelectValue placeholder="-- Select Clerk --" />
                  </SelectTrigger>
                  <SelectContent>
                    {clerkList.map((clerk) => (
                      <SelectItem key={clerk.userid} value={clerk.userid}>
                        {clerk.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showAmount && (authAction != "Reject") && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label required className="font-medium" text="Enter Amount" />
                  <span>:</span>
                </div>
                <Input
                  // type="number"
                  value={amount}
                  // onChange={(e) => setAmount(e.target.value)}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    amountManuallyEdited.current = true;
                    setAmount(value);
                  }}
                  className="w-full sm:w-64 h-9"
                  min="0"
                  maxLength={10}
                />
              </div>
            )}

            {(authAction === "Accept" || authAction === "Return") && (
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 mb-4">
                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label required className="font-medium" text="Enter Remark" />
                  <span>:</span>
                </div>
                <Input
                  type="text"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full sm:w-64 h-9"
                  placeholder="Enter remark..."
                />
              </div>
            )}


            <div className="flex flex-wrap items-center gap-6 mb-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  id="accept"
                  name="authAction"
                  value="Accept"
                  checked={authAction === "Accept"}
                  onChange={(e) => setAuthAction(e.target.value)}
                />
                <Label htmlFor="accept">Accept</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  id="reject"
                  name="authAction"
                  value="Reject"
                  checked={authAction === "Reject"}
                  onChange={(e) => setAuthAction(e.target.value)}
                />
                <Label htmlFor="reject">Reject</Label>
              </div>
              {showReturnOption && (
                <div className="flex items-center space-x-2">
                  <Input
                    type="radio"
                    id="return"
                    name="authAction"
                    value="Return"
                    checked={authAction === "Return"}
                    onChange={(e) => setAuthAction(e.target.value)}
                  />
                  <Label htmlFor="return">Return</Label>
                </div>
              )}
            </div>

            {authAction === "Reject" && (
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 mb-4">
                <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                  <Label required text="Enter Reason" />
                  <span>:</span>
                </div>
                <Input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full sm:w-64 h-9"
                  placeholder="Enter reject reason..."
                />
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button
                className="bg-blue-900 hover:bg-blue-800 text-white px-8"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="px-8"
                onClick={() => navigate(`/app/FrmAppAuthorisationList?@=${authMode}`)}
              >
                Back
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmAppAuthorisationMst;