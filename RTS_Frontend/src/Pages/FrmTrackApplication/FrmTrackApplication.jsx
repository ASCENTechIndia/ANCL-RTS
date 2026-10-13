import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ShadCNTable from "@/components/ui/table";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import config from "@/utils/config";

const STATUS_COLORS = {
  Done: "bg-green-500 text-white",
  Completed: "bg-green-500 text-white",
  Rejected: "bg-red-500 text-white",
  Pending: "bg-yellow-500 text-white",
  "N/A": "bg-gray-400 text-white",
};

const FrmTrackApplication = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  console.log(user);

  console.log("user", user);

  const userId = user?.userId;
  const ulbId = user?.ulbId;
  const serviceUrl = user?.serviceUrl || "/";

  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTrackingView, setShowTrackingView] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [trackingSteps, setTrackingSteps] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [appAuth, setAppAuth] = useState("");
  const [appealDetails, setAppealDetails] = useState({
    firstAppealAvailable: false,
    secondAppealAvailable: false,
    firstAppealExists: false,
    secondAppealExists: false,
  });

  const appHeaders = [
    "Serial No",
    "Service Name",
    "Application Number",
    "Applicant Name",
    "Mobile No.",
    "Email",
    "Applicant Date",
    "Select",
  ];

  const appKeyMapping = {
    "Serial No": "srNo",
    "Service Name": "serviceName",
    "Application Number": "applicationNo",
    "Applicant Name": "applicantName",
    "Mobile No.": "mobileNo",
    "Email": "email",
    "Applicant Date": "applicationDate",
    "Select": "select",
  };

  const stepsHeaders = [
    "Serial No",
    "Step",
    "Date",
    "Status",
    "Action",
  ];

  const stepsKeyMapping = {
    "Serial No": "srNo",
    "Step": "step",
    "Date": "date",
    "Status": "status",
    "Action": "action",
  };

  const docHeaders = [
    "Document Name",
    // "File Type",
    "Uploaded Date",
    "Download",
  ];

  const docKeyMapping = {
    "Document Name": "documentName",
    // "File Type": "fileType",
    "Uploaded Date": "uploadedDate",
    "Download": "download",
  };

  const formatDateToIndian = (dateValue) => {
    if (!dateValue) return "-";

    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "-";

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    } catch (error) {
      return "-";
    }
  };

  const formatStatusLabel = (status) => {
    if (status === "Done") return "Completed";
    return status;
  };

  const fetchApplications = async () => {
    setLoading(true);

    Swal.fire({
      title: "Loading Applications...",
      text: "Please wait while we fetch your applications.",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmTrackApplication/getapplicationdetails`,
        { userId, ulbId },
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      console.log("response", response);

      if (response.data.success) {
        const data = response.data.data.map((app, index) => ({
          srNo: index + 1,
          applId: app.APPLID,
          ulbId: app.ULBID,
          serviceId: app.SERVICEID,
          serviceName: app.SERVICNAME,
          applicationNo: app.APPNO,
          applicantName: app.NAME,
          mobileNo: app.MOBNO,
          email: app.EMAIL,
          applicationDate: formatDateToIndian(app.APLIDT),
          status: app.APPLISTATUS,
        }));
        setApplications(data);
        setFilteredApps(data);
        Swal.close();
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      Swal.close();
      Swal.fire({
        text: error?.response?.data?.error || "Error fetching applications. Please try again.",
        confirmButtonColor: '#1e3a8a',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackingSteps = async (applino, ulbId, serviceId) => {
    setLoading(true);
    Swal.fire({
      title: "Loading Application Details...",
      text: "Please wait while we fetch your application data.",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmTrackApplication/getapplicationsteps`,
        { ulbId, applino, serviceId },
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      console.log("fetchTrackingSteps", response);

      if (response.data.ok || response.data.data.success) {
        const steps = response.data.data.data.steps.map((step, index) => ({
          srNo: index + 1,
          stageId: step.STAGEID,
          step: step.STEP,
          description: step.DESCRIPTION,
          date: step.DATETIME,
          status: step.STATUS || "Pending",
        }));
        setTrackingSteps(steps);
        setAppAuth(response.data.data.appAuth || "");

        const departmentId = response.data.data.data?.departmentId ||
          response.data.data?.departmentId;

        setSelectedApp(prev => ({
          ...prev,
          departmentId: departmentId
        }));

        const appealData = await getAppealDetails(applino);
        if (appealData) {
          setAppealDetails(appealData);
        }

        await fetchDocuments(applino);
        Swal.close();
      }
    } catch (error) {
      console.error("Error fetching tracking steps:", error);
      Swal.fire({
        text: error?.response?.data?.error || "Error fetching tracking details. Please try again.",
        confirmButtonColor: '#1e3a8a',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (applino) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmTrackApplication/getapplicationdocuments`,
        { applino },
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        const docs = response.data.data.map((doc, index) => ({
          srNo: index + 1,
          docId: doc.DOCID,
          documentName: doc.DOCNAME,
          fileType: doc.FILETYPE || "-",
          uploadedDate: formatDateToIndian(doc.DOCDATE) || "-",
          fileBytes: doc.filebytes,
        }));
        setDocuments(docs);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const checkPaymentEligibility = async (applino, serviceId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmTrackApplication/checkpayment`,
        { applino, serviceId },
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      return response.data.success && response.data.data;
    } catch (error) {
      console.error("Error checking payment:", error);
      return false;
    }
  };

  const getAppealDetails = async (appno) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmTrackApplication/getappealdetails`,
        { appno },
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching appeal details:", error);
      return null;
    }
  };

  const getReApplyServiceDetails = async (serviceId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmTrackApplication/getreapplyservicedetails`,
        { serviceId },
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching re-apply details:", error);
      return null;
    }
  };

  const getCertificateData = async (serviceId, appNo, ulbId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmTrackApplication/getcertificatedata`,
        { serviceId, appNo, ulbId },
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching certificate data:", error);
      return null;
    }
  };

  const downloadCertificate = async (applino, serviceId, userId, ulbId) => {
    try {
      debugger;
      Swal.fire({
        title: "Generating Certificate...",
        text: "Please wait while your certificate is being prepared.",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      console.log({
        serviceId: serviceId,
        appNo: applino,
        ulbId: ulbId
      });

      const response = await axios.post(
        `${BASE_URL}/api/FrmTrackApplication/generate-certificate-report`,
        {
          serviceId: String(serviceId),
          appNo: applino,
          ulbId: ulbId,
        },
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      console.log("Response: ", response);

      Swal.close();

      if (response.data.success && response.data.pdfUrl) {
        window.open(response.data.pdfUrl, '_blank');

        Swal.fire({
          text: "Certificate generated successfully!",
          confirmButtonColor: '#1e3a8a',
        });

        return true;
      } else {
        Swal.fire({
          text: response.data.message || "Failed to generate certificate.",
          confirmButtonColor: '#1e3a8a',
        });
        return false;
      }
    } catch (error) {
      console.error("Error downloading certificate:", error);
      console.log("Error Response:", error.response);
      console.log("Error Response:", error.response.data);
      console.log("Error Response:", error.response.data.message);
      Swal.close();

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Error downloading certificate. Please try again.";

      Swal.fire({
        text: errorMessage,
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }
  };

  const downloadReceipt = async (applino, serviceId, ulbId) => {
    try {
      Swal.fire({
        title: "Generating Receipt...",
        text: "Please wait while your payment receipt is being prepared.",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post(
        `${BASE_URL}/api/FrmAfterTransactionTMC/paymentacknowledgement`,
        {
          serviceId: String(serviceId),
          appNo: String(applino),
          ulbId: String(ulbId),
        },
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      Swal.close();

      const result = response?.data;

      if (result?.success && result?.pdfUrl) {
        window.open(result.pdfUrl, "_blank", "noopener,noreferrer");

        Swal.fire({
          text: "Payment receipt generated successfully!",
          confirmButtonColor: "#1e3a8a",
          timer: 2000,
        });

        return true;
      } else {
        Swal.fire({
          text: result?.message || "Unable to generate payment receipt.",
          confirmButtonColor: "#1e3a8a",
        });
        return false;
      }
    } catch (error) {
      console.error("Error downloading receipt:", error);
      Swal.close();

      let errorMessage = "Unable to generate payment receipt.";

      if (error?.response?.data instanceof Blob) {
        try {
          const errorText = await error.response.data.text();
          const errorData = JSON.parse(errorText);
          errorMessage = errorData?.message || errorData?.data?.message || errorMessage;
        } catch {
          errorMessage = "Unable to generate payment receipt.";
        }
      } else {
        errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          errorMessage;
      }

      Swal.fire({
        text: errorMessage,
        confirmButtonColor: "#1e3a8a",
      });
      return false;
    }
  };

  const fetchExistingCertificate = async (applino) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmTrackApplication/getapplicationcertificate`,
        { applino },
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const certData = response.data.data[0];

        if (certData.fileBytes) {
          let base64Data = certData.fileBytes;
          if (base64Data.includes("base64,")) {
            base64Data = base64Data.split("base64,")[1];
          }

          const byteCharacters = atob(base64Data);
          const byteNumbers = new Uint8Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
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
          }

          const blob = new Blob([byteNumbers], { type: mimeType });
          const url = window.URL.createObjectURL(blob);

          window.open(url, '_blank');

          setTimeout(() => window.URL.revokeObjectURL(url), 5000);

          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error fetching existing certificate:", error);
      return false;
    }
  };

  const downloadDocument = async (doc) => {
    try {
      console.log("doc: ", doc);

      let base64Data = doc.fileBytes || doc.filebytes;
      const fileExtension = doc.fileExtension || doc.FileExtension;
      if (base64Data.includes("base64,")) {
        base64Data = base64Data.split("base64,")[1];
      }

      if (!base64Data) {
        Swal.fire({
          text: "Document data not available.",
          confirmButtonColor: '#1e3a8a',
        });
        return;
      }

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
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

      const byteArray = new Uint8Array(byteNumbers);

      const blob = new Blob([byteNumbers], { type: mimeType });
      const url = window.URL.createObjectURL(blob);

      window.open(url, '_blank');

      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error("Error opening document:", error);
      Swal.fire({
        text: "Error opening document. Please try again.",
        confirmButtonColor: '#1e3a8a',
      });
    }
  };

  useEffect(() => {
    fetchApplications();
    document.title = "Tracking Application";
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredApps(applications);
    } else {
      const filtered = applications.filter(app =>
        app.applicationNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredApps(filtered);
    }
  }, [searchTerm, applications]);

  const handleSelectApplication = async (app) => {
    setSelectedApp(app);
    setShowTrackingView(true);
    await fetchTrackingSteps(app.applicationNo, app.ulbId, app.serviceId);
  };

  const handleBack = () => {
    setShowTrackingView(false);
    setSelectedApp(null);
    setTrackingSteps([]);
    setDocuments([]);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStepAction = async (step, action) => {
    const stepName = step.step;
    const status = step.status;
    const appNo = selectedApp?.applicationNo;
    const serviceId = selectedApp?.serviceId;

    console.log("selectedApp", selectedApp);

    if (stepName === "Application Entry" && status === "Done") {
      if (action === "First Appeal") {
        navigate("/app/FrmFirstAppeal", {
          state: {
            appNo: appNo,
            serviceId: serviceId,
            ulbId: ulbId,
            corpId: user?.corpId,
            userUniqueId: userId,
            trackId: user?.trackId,
            userIdMahaOnline: user?.mahaOnlineUserId || "MAHA123",
            username: user?.username || user?.email,
            userFullName: selectedApp?.applicantName,
            serviceName: selectedApp?.serviceName
          }
        });
        return;
      }

      if (action === "Second Appeal") {
        navigate("/app/FrmSecondAppeal", {
          state: {
            appNo: appNo,
            serviceId: serviceId,
            ulbId: ulbId,
            corpId: user?.corpId,
            userUniqueId: userId,
            trackId: user?.trackId,
            userIdMahaOnline: user?.mahaOnlineUserId || "MAHA123",
            username: user?.username || user?.email,
            userFullName: selectedApp?.applicantName,
            serviceName: selectedApp?.serviceName,
          }
        });
        return;
      }
    }

    if (stepName === "Payment Entry" && status !== "Done") {
      Swal.fire({
        text: "Checking payment eligibility...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const eligible = await checkPaymentEligibility(appNo, serviceId);

      Swal.close();

      if (eligible) {
        navigate("/app/FrmAppliFee", {
          state: {
            appNo: appNo,
            serviceId: serviceId,
            ulbId: ulbId,
            corpId: user?.corpId,
            userUniqueId: userId,
            trackId: user?.trackId,
            userIdMahaOnline: user?.mahaOnlineUserId || "MAHA123",
            username: user?.username || user?.email,
            userFullName: selectedApp?.applicantName,
            serviceName: selectedApp?.serviceName,
          }
        });
      } else {
        Swal.fire({
          text: "Application verification pending. Please wait for approval.",
          confirmButtonColor: '#1e3a8a',
        });
      }
      return;
    }

    if (stepName === "Payment Entry" && status === "Done") {
      Swal.fire({
        text: "Generating payment receipt...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const success = await downloadReceipt(appNo, serviceId, ulbId);

      Swal.close();

      if (success) {
        Swal.fire({
          text: "Receipt downloaded successfully!",
          confirmButtonColor: "#1e3a8a",
          timer: 2000,
        });
      }
      return;
    }

    if (stepName === "Application Authorization" && status === "Rejected") {
      setRejectRemark(step.description || "No remark available");
      setShowModal(true);
      return;
    }

    // if (stepName === "Certificate Generated") {
    //   if (status === "Done" || appAuth === "Done") {
    //     Swal.fire({
    //       text: "Generating certificate...",
    //       allowOutsideClick: false,
    //       showConfirmButton: false,
    //       didOpen: () => Swal.showLoading(),
    //     });

    //     const success = await downloadCertificate(appNo, serviceId, userId, ulbId);

    //     Swal.close();

    //     if (success) {
    //       Swal.fire({
    //         text: "Certificate downloaded successfully!",
    //         confirmButtonColor: '#1e3a8a',
    //         timer: 2000,
    //       });
    //     } else {
    //       Swal.fire({
    //         text: "Error downloading certificate. Please try again.",
    //         confirmButtonColor: '#1e3a8a',
    //       });
    //     }
    //     return;
    //   }

    //   if (appAuth === "Rejected") {
    //     Swal.fire({
    //       text: "Application was rejected. Certificate cannot be generated.",
    //       confirmButtonColor: '#1e3a8a',
    //     });
    //     return;
    //   }
    // }

    if (stepName === "Certificate Generated") {
      if (status === "Done" || appAuth === "Done") {
        const departmentId = selectedApp?.departmentId;

        if (departmentId === 7 || departmentId === 290) {
          Swal.fire({
            text: "Generating certificate...",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
          });

          const success = await downloadCertificate(appNo, serviceId, userId, ulbId);

          Swal.close();

          if (success) {
            Swal.fire({
              text: "Certificate downloaded successfully!",
              confirmButtonColor: '#1e3a8a',
              timer: 2000,
            });
          } else {
            Swal.fire({
              text: "Error downloading certificate. Please try again.",
              confirmButtonColor: '#1e3a8a',
            });
          }
        }
        else {
          Swal.fire({
            text: "Fetching certificate...",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
          });

          const success = await fetchExistingCertificate(appNo);

          Swal.close();

          if (success) {
            Swal.fire({
              text: "Certificate downloaded successfully!",
              confirmButtonColor: '#1e3a8a',
              timer: 2000,
            });
          } else {
            Swal.fire({
              text: "Certificate not found.",
              confirmButtonColor: '#1e3a8a',
            });
          }
        }
        return;
      }

      if (appAuth === "Rejected") {
        Swal.fire({
          text: "Application was rejected. Certificate cannot be generated.",
          confirmButtonColor: '#1e3a8a',
        });
        return;
      }
    }

    Swal.fire({
      text: `Action "${action}" for step "${stepName}"`,
      confirmButtonColor: '#1e3a8a',
    });
  };

  const handleReApply = async () => {
    setShowModal(false);
    Swal.fire({
      text: "Loading re-application details...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    const serviceDetails = await getReApplyServiceDetails(selectedApp?.serviceId);

    Swal.close();

    if (serviceDetails && serviceDetails.redirectUrl) {
      let cleanUrl = serviceDetails.redirectUrl;
      cleanUrl = cleanUrl.replace(/^~\/?/, "");

      // Remove .aspx extension
      cleanUrl = cleanUrl.replace(/\.aspx(?=($|\?))/, "");

      // Ensure URL starts with /
      if (!cleanUrl.startsWith("/")) {
        cleanUrl = `/${cleanUrl}`;
      }

      console.log("Original URL:", serviceDetails.redirectUrl);
      console.log("Cleaned URL:", cleanUrl);


      navigate(cleanUrl, {
        state: {
          ulbId: ulbId,
          serviceId: serviceDetails.serviceId,
          deptId: selectedApp?.departmentId,
          serviceName: serviceDetails.serviceName,
          appNo: selectedApp?.applicationNo,
          userId: userId,
          corpId: user?.corpId,
          userUniqueId: userId,
          trackId: user?.trackId,
          username: user?.username || user?.email,
          userFullName: selectedApp?.applicantName,
        }
      });
    } else {
      Swal.fire({
        text: "Unable to load re-application form. Please try again.",
        confirmButtonColor: '#1e3a8a',
      });
    }
  };

  const handleDocumentDownload = async (doc) => {
    await downloadDocument(doc);
  };

  const getTransformedAppData = () => {
    return filteredApps.map(app => ({
      ...app,
      select: (
        <Button
          variant="link"
          className="text-blue-700 hover:text-blue-900 px-0"
          onClick={() => handleSelectApplication(app)}
        >
          Select
        </Button>
      ),
    }));
  };

  const getTransformedStepsData = () => {

    const isAuthRejected = appAuth === "Rejected" ||
      trackingSteps.some(s => s.step === "Application Authorization" && s.status === "Rejected");

    return trackingSteps.map(step => {
      let actionElement = null;
      const isPendingAfterRejection = isAuthRejected && step.status === "Pending";

      if (step.step === "Application Entry" && step.status === "Done") {
        const { firstAppealAvailable, secondAppealAvailable, firstAppealExists, secondAppealExists } = appealDetails;

        let appealButtons = [];

        if (firstAppealAvailable && !firstAppealExists) {
          appealButtons.push(
            <Button
              key="first"
              type="button"
              className="bg-blue-900 hover:bg-blue-800 text-white text-xs px-2 py-0.5 h-7 w-35"
              onClick={() => handleStepAction(step, "First Appeal")}
            >
              First Appeal
            </Button>
          );
        }
        if (secondAppealAvailable && !secondAppealExists) {
          appealButtons.push(
            <Button
              key="second"
              type="button"
              className="bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-0.5 h-7 w-35"
              onClick={() => handleStepAction(step, "Second Appeal")}
            >
              Second Appeal
            </Button>
          );
        }
        if (appealButtons.length > 0) {
          actionElement = (
            <div className="flex flex-wrap items-center justify-center gap-1">
              {appealButtons}
            </div>
          );
        }
      }
      else if (step.step === "Payment Entry" && step.status !== "Done") {
        actionElement = (
          <Button
            type="button"
            disabled={isAuthRejected}
            className={
              isAuthRejected
                ? "bg-gray-300 text-gray-900 text-xs px-3 py-1 cursor-not-allowed w-35"
                : "bg-blue-900 hover:bg-blue-800 text-white text-xs px-3 py-1 w-35"
            }
            onClick={() => !isAuthRejected && handleStepAction(step, "Make Payment")}
          >
            Make Payment
          </Button>
        );
      }
      else if (step.step === "Payment Entry" && step.status === "Done") {
        actionElement = (
          <Button
            type="button"
            className="bg-blue-700 hover:bg-blue-800 text-white text-xs px-3 py-1 w-35"
            onClick={() => handleStepAction(step, "Download Receipt")}
          >
            Download Receipt
          </Button>
        );
      }
      else if (step.step === "Application Authorization" && step.status === "Rejected") {
        actionElement = (
          <Button
            type="button"
            className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 w-35"
            onClick={() => handleStepAction(step, "View")}
          >
            View
          </Button>
        );
      }
      else if (step.step === "Certificate Generated") {
        if (step.status === "Done") {
          actionElement = (
            <Button
              type="button"
              className="bg-green-700 hover:bg-green-800 text-white text-xs px-3 py-1 w-35"
              onClick={() => handleStepAction(step, "Certificate Download")}
            >
              Download Certificate
            </Button>
          );
        } else if (appAuth === "Done") {
          actionElement = (
            <Button
              type="button"
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 w-35"
              onClick={() => handleStepAction(step, "Certificate Download")}
            >
              Check Status
            </Button>
          );
        }
      }

      let statusBadgeClass = STATUS_COLORS[step.status] || STATUS_COLORS.Pending;

      if (isPendingAfterRejection) {
        statusBadgeClass = "bg-gray-300 text-gray-600";
      }

      return {
        ...step,
        action: actionElement,
        status: (
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadgeClass}`}>
            {formatStatusLabel(step.status)}
          </span>
        ),
        date: step.date ? new Date(step.date).toLocaleString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) : '-',
      };
    });
  };

  const getTransformedDocumentsData = () => {
    return documents.map(doc => ({
      ...doc,
      download: (
        <Button
          variant="link"
          className="text-blue-700 hover:text-blue-900 px-0"
          onClick={() => handleDocumentDownload(doc)}
        >
          Download
        </Button>
      ),
    }));
  };

  const renderTimeline = () => {
    const getStatusColor = (status) => {
      if (status === "Done") return "border-green-500 bg-green-500";
      if (status === "Rejected") return "border-red-500 bg-red-500";
      return "border-yellow-500 bg-yellow-500";
    };

    const getCardBgColor = (status) => {
      if (status === "Done") return "bg-green-100 border-green-300";
      if (status === "Rejected") return "bg-red-100 border-red-300";
      return "bg-gray-50 border-gray-300";
    };

    const getTextColor = (status) => {
      if (status === "Done") return "text-green-800";
      if (status === "Rejected") return "text-red-800";
      return "text-gray-800";
    };

    const timelineSteps = ["Application Entry", "Payment Entry", "Application Authorization", "Certificate Generated"];
    const filteredSteps = trackingSteps.filter(s => timelineSteps.includes(s.step));

    return (
      <div className="relative max-w-3xl mx-auto">
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-blue-700"></div>

        {filteredSteps.map((item, index) => {
          const isLast = index === filteredSteps.length - 1;

          return (
            <div key={index} className={`relative flex items-start mb-10 ${isLast ? 'mb-0' : ''}`}>
              <div className="absolute left-[34px] transform -translate-x-1/2 flex items-center justify-center">
                <div className={`w-6 h-6 rounded-full border-4 ${getStatusColor(item.status)} bg-white z-10 shadow-md`} />
              </div>

              <div className="ml-16 w-full">
                <div className={`p-4 rounded-lg shadow-md border ${getCardBgColor(item.status)}`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className={`font-medium ${getTextColor(item.status)}`}>
                      {item.step}
                    </span>
                    {item.date ? (
                      <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded shadow-sm">
                        {new Date(item.date).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false
                        })}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        Pending
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderApplicationListView = () => {
    const appData = getTransformedAppData();

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className=" px-4 py-2">
        <Card className="border shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-semibold">
              Tracking Application
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Label required text="Application No" className="font-medium whitespace-nowrap" />
                <span>:</span>
                <Input
                  placeholder="Search Here.."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-64 h-9"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="bg-gray-100 hover:bg-gray-200"
                // onClick={() => navigate(serviceUrl)}
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
            </div>

            <div>
              {/* <h4 className="font-medium text-lg text-gray-800">Application Details</h4> */}
            </div>

            <div className="overflow-x-auto">
              <ShadCNTable
                headers={appHeaders}
                data={appData}
                keyMapping={appKeyMapping}
                pagination={false}
                className="max-md:min-w-380"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderTrackingView = () => {
    const stepsData = getTransformedStepsData();
    const docsData = getTransformedDocumentsData();

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto px-4 py-6">
        <Card className="border shadow-sm">
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle className="text-lg font-semibold">
                Application Details &gt; Track Application No : {selectedApp?.applicationNo}
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                className="bg-gray-100 hover:bg-gray-200"
                onClick={handleBack}
              >
                Back
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-6">
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <ShadCNTable
                  headers={stepsHeaders}
                  data={stepsData}
                  keyMapping={stepsKeyMapping}
                  pagination={false}
                  className="max-md:min-w-380"
                />
              </div>

              <div className="p-6">
                {renderTimeline()}
              </div>
            </div>

            {documents.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-3 text-gray-800">Uploaded Documents</h3>
                <div className="overflow-x-auto">
                  <ShadCNTable
                    headers={docHeaders}
                    data={docsData}
                    keyMapping={docKeyMapping}
                    pagination={false}
                    className="max-md:min-w-380"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderRejectModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">HO Reject Remark</h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="mb-6 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-gray-700">{rejectRemark}</p>
          </div>
          <div className="flex justify-center">
            <Button
              type="button"
              className="bg-blue-900 hover:bg-blue-800 text-white px-6"
              onClick={handleReApply}
            >
              Re-Apply
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {showTrackingView ? renderTrackingView() : renderApplicationListView()}
      {renderRejectModal()}
    </>
  );
};

export default FrmTrackApplication;