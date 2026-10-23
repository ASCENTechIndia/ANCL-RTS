import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Formik, Form } from "formik";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { waterApplicationValidationSchema } from "@/validations/global.validation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import ShadCNTable from "@/components/ui/table";

import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";

const baseUrl = import.meta.env.VITE_BASE_URL;

function FrmWaterAppliEntry() {
  const { user, token } = useAuth();
  const location = useLocation();

  const [zones, setZones] = useState([]);
  const [connectionTypes, setConnectionTypes] = useState([]);
  const [connectionSizes, setConnectionSizes] = useState([]);
  const [usageTypes, setUsageTypes] = useState([]);
  const [usageSubTypes, setUsageSubTypes] = useState([]);
  const [connectionStatuses, setConnectionStatuses] = useState([]);
  const [businessCertificates, setBusinessCertificates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [paymentFlag, setPaymentFlag] = useState("N");

  const serviceId =
    location?.state?.serviceId ||
    location?.state?.serviceid ||
    location?.state?.service?.serviceId;

  const corpId =
    user?.corpId ||
    user?.corpid ||
    user?.corpID ||
    location?.state?.corpId ||
    location?.state?.corpid ||
    "10001";

  const ulbId =
    user?.ulbId || user?.ulbid || user?.ULBID || location?.state?.ulbId || "3";

  const axiosConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token],
  );

  const initialValues = {
    zoneId: "",

    applicantFirstName: "",
    applicantMiddleName: "",
    applicantLastName: "",

    applicantFirstNameMarathi: "",
    applicantMiddleNameMarathi: "",
    applicantLastNameMarathi: "",

    mobileNumber: "",
    email: "",
    aadharCardNo: "",
    propertyNumber: "",
    residentialNumber: "",
    address: "",
    addressMarathi: "",

    consumerFirstName: "",
    consumerMiddleName: "",
    consumerLastName: "",

    consumerFirstNameMarathi: "",
    consumerMiddleNameMarathi: "",
    consumerLastNameMarathi: "",

    consumerMobileNumber: "",
    consumerEmail: "",
    consumerAadharCardNo: "",
    consumerPropertyNumber: "",
    consumerResidentialNumber: "",

    includeCoOwner: "No",

    coOwnerFirstName: "",
    coOwnerMiddleName: "",
    coOwnerLastName: "",

    coOwnerFirstNameMarathi: "",
    coOwnerMiddleNameMarathi: "",
    coOwnerLastNameMarathi: "",

    coOwnerAddress: "",
    coOwnerAddressMarathi: "",

    remark: "",
    reason: "",

    connectionType: "",
    connectionSize: "",
    usageType: "",
    usageSubType: "",

    noOfPerson: "",
    noOfFamily: "",
    noOfConnection: "",

    connectionStatus: "",
    businessCertificate: "",
    billingType: "",

    isGovtProperty: "No",
  };

  const getRows = (result) => {
    if (result?.status !== "fulfilled") return [];

    return result?.value?.data?.data?.rows || [];
  };

  const loadMasters = async () => {
    Swal.fire({
      title: "Loading...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const results = await Promise.allSettled([
        axios.post(
          `${baseUrl}/api/FrmWaterAppliEntry/zones`,
          {
            ulbId,
          },
          axiosConfig,
        ),

        axios.post(
          `${baseUrl}/api/FrmWaterAppliEntry/connection-types`,
          {},
          axiosConfig,
        ),

        axios.post(
          `${baseUrl}/api/FrmWaterAppliEntry/connection-sizes`,
          {},
          axiosConfig,
        ),

        axios.post(
          `${baseUrl}/api/FrmWaterAppliEntry/usage-types`,
          {},
          axiosConfig,
        ),

        axios.post(
          `${baseUrl}/api/FrmWaterAppliEntry/connection-statuses`,
          {},
          axiosConfig,
        ),

        axios.post(
          `${baseUrl}/api/FrmWaterAppliEntry/business-certificates`,
          {},
          axiosConfig,
        ),

        axios.post(
          `${baseUrl}/api/FrmWaterAppliEntry/document-definitions`,
          {
            corpId,
            serviceId,
            ulbId,
          },
          axiosConfig,
        ),

        axios.post(
          `${baseUrl}/api/FrmWaterAppliEntry/payment-flag`,
          {
            serviceId,
          },
          axiosConfig,
        ),
      ]);

      const failedResult = results.find(
        (result) => result.status === "rejected",
      );

      if (failedResult) {
        throw failedResult.reason;
      }

      setZones(getRows(results[0]));
      setConnectionTypes(getRows(results[1]));
      setConnectionSizes(getRows(results[2]));
      setUsageTypes(getRows(results[3]));
      setConnectionStatuses(getRows(results[4]));
      setBusinessCertificates(getRows(results[5]));

      const documentRows = getRows(results[6]).map((item) => ({
        ...item,
        id: item.NUM_DOCUMENT_ID,
        documentName: item.VAR_DOCUMENT_NAME,
      }));

      setDocuments(documentRows);

      const paymentRows = getRows(results[7]);

      setPaymentFlag(paymentRows?.[0]?.VAR_SERVICE_PAYFLAG || "N");
    } catch (error) {
      await Swal.fire({
        icon: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to load application master data.",
      });
    } finally {
      Swal.close();
    }
  };

  useEffect(() => {
    if (ulbId && serviceId) {
      loadMasters();
    }
  }, [ulbId, serviceId, corpId]);

  const loadUsageSubTypes = async (usageTypeId) => {
    if (!usageTypeId) {
      setUsageSubTypes([]);
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/FrmWaterAppliEntry/usage-subtypes`,
        {
          usageTypeId,
        },
        axiosConfig,
      );

      setUsageSubTypes(response?.data?.data?.rows || []);
    } catch (error) {
      setUsageSubTypes([]);

      await Swal.fire({
        icon: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to load usage sub-types.",
      });
    }
  };

  const handleCopyApplicantToConsumer = (values, setFieldValue) => {
    setFieldValue("consumerFirstName", values.applicantFirstName);

    setFieldValue("consumerMiddleName", values.applicantMiddleName);

    setFieldValue("consumerLastName", values.applicantLastName);

    setFieldValue("consumerFirstNameMarathi", values.applicantFirstNameMarathi);

    setFieldValue(
      "consumerMiddleNameMarathi",
      values.applicantMiddleNameMarathi,
    );

    setFieldValue("consumerLastNameMarathi", values.applicantLastNameMarathi);

    setFieldValue("consumerMobileNumber", values.mobileNumber);

    setFieldValue("consumerEmail", values.email);

    setFieldValue("consumerAadharCardNo", values.aadharCardNo);

    setFieldValue("consumerPropertyNumber", values.propertyNumber);

    setFieldValue("consumerResidentialNumber", values.residentialNumber);

    Swal.fire({
      icon: "success",
      title: "Copied Successfully",
      text: "Applicant information has been added to Consumer Details.",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleFileChange = (documentId, file) => {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "warning",
        text: "Only JPG, JPEG, PNG and PDF files are allowed.",
      });

      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        text: "Document size should not exceed 15 MB.",
      });

      return;
    }

    setSelectedFiles((previous) => ({
      ...previous,
      [documentId]: file,
    }));
  };

  const handleDocumentSelect = (documentId, checked) => {
    if (!checked) {
      setSelectedFiles((previous) => {
        const updatedFiles = { ...previous };

        delete updatedFiles[documentId];

        return updatedFiles;
      });
    }
  };

  const documentHeaders = ["Select", "Document Name", "Upload Document"];

  const documentKeyMapping = {
    Select: "select",
    "Document Name": "documentName",
    "Upload Document": "upload",
  };

  const tableData = documents.map((document, index) => {
    const documentId = document.NUM_DOCUMENT_ID || document.id || index;

    return {
      id: documentId,

      select: (
        <Input
          type="checkbox"
          checked={Boolean(selectedFiles[documentId])}
          onChange={(event) =>
            handleDocumentSelect(documentId, event.target.checked)
          }
        />
      ),

      documentName: document.VAR_DOCUMENT_NAME || document.documentName || "",

      upload: (
        <Input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(event) =>
            handleFileChange(documentId, event.target.files?.[0])
          }
        />
      ),
    };
  });

  const checkPayment = async (applicationNo) => {
    const response = await axios.post(
      `${baseUrl}/api/FrmWaterAppliEntry/check-payment`,
      {
        serviceId,
        applicationNo,
      },
      axiosConfig,
    );

    return response?.data?.data;
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result || "";

        const base64String = String(result).includes(",")
          ? String(result).split(",")[1]
          : result;

        resolve(base64String);
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    });

  const handleSubmit = async (values, { resetForm }) => {
    try {
      // Validate and get transformed values
      const validationResult =
        waterApplicationValidationSchema.safeParse(values);

      if (!validationResult.success) {
        const firstError = validationResult.error.issues?.[0];

        await Swal.fire({
          icon: "warning",
          text:
            firstError?.message || "Please fill all required fields correctly.",
        });

        return;
      }

      const validatedValues = validationResult.data;

      const selectedDocumentIds = Object.keys(selectedFiles);

      if (selectedDocumentIds.length === 0) {
        await Swal.fire({
          icon: "warning",
          text: "Please upload at least one document.",
        });

        return;
      }

      Swal.fire({
        title: "Submitting...",
        text: "Please wait while your application is being submitted.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const documentsPayload = await Promise.all(
        selectedDocumentIds.map(async (documentId) => {
          const file = selectedFiles[documentId];

          const document = documents.find(
            (item) =>
              String(item.NUM_DOCUMENT_ID || item.id) === String(documentId),
          );

          const fileExtension =
            file?.name?.split(".").pop()?.toUpperCase() || "";

          const fileBuffer = await fileToBase64(file);

          return {
            docId: String(documentId),

            docName:
              document?.VAR_DOCUMENT_NAME ||
              document?.documentName ||
              file?.name ||
              "",

            fileExtension,

            checked: true,

            fileBuffer,
          };
        }),
      );

      const payload = {
        ulbId: String(ulbId),

        corpId: String(corpId),

        userId: String(
          user?.userId || user?.userid || user?.USERID || user?.id || "",
        ),

        serviceId: String(serviceId),

        zoneId: String(validatedValues.zoneId),

        appSource: "WEB",

        afName: validatedValues.applicantFirstName || "",

        amName: validatedValues.applicantMiddleName || "",

        alName: validatedValues.applicantLastName || "",

        mobileNo: validatedValues.mobileNumber || "",

        // Uses normalized email from Zod
        email: validatedValues.email || "",

        aadharNo: validatedValues.aadharCardNo || "",

        propNo: validatedValues.propertyNumber || "",

        resNo: validatedValues.residentialNumber || "",

        address: validatedValues.address || "",

        afNameMr: validatedValues.applicantFirstNameMarathi || "",

        amNameMr: validatedValues.applicantMiddleNameMarathi || "",

        alNameMr: validatedValues.applicantLastNameMarathi || "",

        addressMr: validatedValues.addressMarathi || "",

        conFName: validatedValues.consumerFirstName || "",

        conMName: validatedValues.consumerMiddleName || "",

        conLName: validatedValues.consumerLastName || "",

        conMobNo: validatedValues.consumerMobileNumber || "",

        // Uses normalized consumer email from Zod
        conEmail: validatedValues.consumerEmail || "",

        conAadharNo: validatedValues.consumerAadharCardNo || "",

        conPropNo: validatedValues.consumerPropertyNumber || "",

        conResNo: validatedValues.consumerResidentialNumber || "",

        conFNameMr: validatedValues.consumerFirstNameMarathi || "",

        conMNameMr: validatedValues.consumerMiddleNameMarathi || "",

        conLNameMr: validatedValues.consumerLastNameMarathi || "",

        cooFlag: validatedValues.includeCoOwner === "Yes" ? "Y" : "N",

        cooFName1:
          validatedValues.includeCoOwner === "Yes"
            ? validatedValues.coOwnerFirstName || ""
            : "",

        cooMName1:
          validatedValues.includeCoOwner === "Yes"
            ? validatedValues.coOwnerMiddleName || ""
            : "",

        cooLName1:
          validatedValues.includeCoOwner === "Yes"
            ? validatedValues.coOwnerLastName || ""
            : "",

        cooFName2:
          validatedValues.includeCoOwner === "Yes"
            ? validatedValues.coOwnerFirstNameMarathi || ""
            : "",

        cooMName2:
          validatedValues.includeCoOwner === "Yes"
            ? validatedValues.coOwnerMiddleNameMarathi || ""
            : "",

        cooLName2:
          validatedValues.includeCoOwner === "Yes"
            ? validatedValues.coOwnerLastNameMarathi || ""
            : "",

        cooAddress:
          validatedValues.includeCoOwner === "Yes"
            ? validatedValues.coOwnerAddress || ""
            : "",

        cooAddressMr:
          validatedValues.includeCoOwner === "Yes"
            ? validatedValues.coOwnerAddressMarathi || ""
            : "",

        connType: String(validatedValues.connectionType),

        connSize: String(validatedValues.connectionSize),

        usageType: String(validatedValues.usageType),

        usageSubType: String(validatedValues.usageSubType),

        noOfPerson: String(validatedValues.noOfPerson),

        noOfFamily: String(validatedValues.noOfFamily),

        noOfConn: String(validatedValues.noOfConnection),

        connStatus: String(validatedValues.connectionStatus),

        busiCert: String(validatedValues.businessCertificate),

        billingType: validatedValues.billingType,

        govPropFlag: validatedValues.isGovtProperty === "Yes" ? "Y" : "N",

        remark: validatedValues.remark,

        reason: validatedValues.reason,

        documents: documentsPayload,
      };

      console.log("Water Application Submit Payload:", payload);

      const response = await axios.post(
        `${baseUrl}/api/FrmWaterAppliEntry/submit`,
        payload,
        axiosConfig,
      );

      Swal.close();

      const responseData = response?.data;

      if (!responseData?.ok) {
        throw new Error(
          responseData?.message || "Unable to submit water application.",
        );
      }

      const submitData = responseData?.data || {};

      if (!submitData?.success) {
        throw new Error(
          submitData?.message || "Unable to submit water application.",
        );
      }

      await Swal.fire({
        icon: "success",
        title: "Success",
        text:
          submitData?.message ||
          responseData?.message ||
          "Application submitted successfully.",
      });

      resetForm();

      setSelectedFiles({});

      setUsageSubTypes([]);
    } catch (error) {
      Swal.close();

      await Swal.fire({
        icon: "error",
        text:
          error?.response?.data?.data?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Unable to submit water application.",
      });
    }
  };

  return (
    <div className="w-full p-4">
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ values, handleChange, setFieldValue, resetForm }) => (
          <Form className="space-y-4">
            <Card>
              <CardHeader className="border-b py-3">
                <CardTitle className="text-start text-xl">
                  Applicant Details
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-5">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 items-center gap-x-6 gap-y-4 md:grid-cols-2">
                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-center gap-4">
                      <Label
                        text="Zone ID"
                        className="text-black !w-full whitespace-nowrap"
                        required
                      />

                      <Select
                        value={values.zoneId}
                        onValueChange={(value) =>
                          setFieldValue("zoneId", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Zone" />
                        </SelectTrigger>

                        <SelectContent>
                          {zones.map((item) => (
                            <SelectItem
                              key={item.WARDID}
                              value={String(item.WARDID)}
                            >
                              {item.WARDNAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 items-center gap-x-6 gap-y-4 lg:grid-cols-2">
                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-center gap-4">
                      <Label
                        text="Applicant Name"
                        className="text-black !w-full whitespace-nowrap"
                        required
                      />

                      <Input
                        name="applicantFirstName"
                        placeholder="First Name"
                        value={values.applicantFirstName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        name="applicantMiddleName"
                        placeholder="Middle Name"
                        value={values.applicantMiddleName}
                        onChange={handleChange}
                      />

                      <Input
                        name="applicantLastName"
                        placeholder="Last Name"
                        value={values.applicantLastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 items-center gap-x-6 gap-y-4 lg:grid-cols-2">
                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-center gap-4">
                      <Label
                        text="अर्जदाराचे नाव मराठी"
                        className="text-black !w-full whitespace-nowrap"
                        required
                      />

                      <Input
                        name="applicantFirstNameMarathi"
                        placeholder="पहिले नाव"
                        value={values.applicantFirstNameMarathi}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        name="applicantMiddleNameMarathi"
                        placeholder="मधले नाव"
                        value={values.applicantMiddleNameMarathi}
                        onChange={handleChange}
                      />

                      <Input
                        name="applicantLastNameMarathi"
                        placeholder="आडनाव"
                        value={values.applicantLastNameMarathi}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2">
                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-center gap-4">
                      <Label
                        text="Mobile Number"
                        className="text-black !w-full whitespace-nowrap"
                        required
                      />
                      <Input
                        name="mobileNumber"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="Enter Mobile Number"
                        value={values.mobileNumber}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          setFieldValue("mobileNumber", value);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-center gap-4">
                      <Label
                        text="Email"
                        className="text-black !w-full whitespace-nowrap"
                        required
                      />

                      <Input
                        type="email"
                        name="email"
                        placeholder="Enter Email"
                        value={values.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2">
                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-center gap-4">
                      <Label
                        text="Aadhar Card No"
                        className="text-black !w-full whitespace-nowrap"
                        required
                      />

                      <Input
                        name="aadharCardNo"
                        type="text"
                        inputMode="numeric"
                        maxLength={12}
                        placeholder="Enter Aadhar Card Number"
                        value={values.aadharCardNo}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 12);
                          setFieldValue("aadharCardNo", value);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-center gap-4">
                      <Label
                        text="Property Number"
                        className="text-black !w-full whitespace-nowrap"
                        required
                      />

                      <Input
                        name="propertyNumber"
                        placeholder="Enter Property Number"
                        value={values.propertyNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2">
                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-start gap-4">
                      <Label
                        text="Residential Number"
                        className="text-black !w-full pt-2 whitespace-nowrap"
                        required
                      />

                      <textarea
                        name="residentialNumber"
                        placeholder="Enter Residential Number"
                        value={values.residentialNumber}
                        onChange={handleChange}
                        className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-start gap-4">
                      <Label
                        text="Address"
                        className="text-black !w-full pt-2 whitespace-nowrap"
                        required
                      />

                      <textarea
                        name="address"
                        placeholder="Enter Address"
                        value={values.address}
                        onChange={handleChange}
                        className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2">
                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-start gap-4 lg:col-start-2">
                      <Label
                        text="Address Marathi"
                        className="text-black !w-full pt-2 whitespace-nowrap"
                      />

                      <textarea
                        name="addressMarathi"
                        placeholder="पत्ता मराठी"
                        value={values.addressMarathi}
                        onChange={handleChange}
                        className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-4 px-2">
              <Label className="text-base">Copy as Above</Label>

              <Button
                type="button"
                onClick={() =>
                  handleCopyApplicantToConsumer(values, setFieldValue)
                }
              >
                Add
              </Button>
            </div>

            <Card>
              <CardHeader className="border-b py-3">
                <CardTitle className="text-start text-xl">
                  Consumer Details
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-5">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 items-center gap-x-6 gap-y-4 lg:grid-cols-2">
                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-center gap-4">
                      <Label
                        text="Consumer Name"
                        className="text-black !w-full whitespace-nowrap"
                        required
                      />

                      <Input
                        name="consumerFirstName"
                        placeholder="First Name"
                        value={values.consumerFirstName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        name="consumerMiddleName"
                        placeholder="Middle Name"
                        value={values.consumerMiddleName}
                        onChange={handleChange}
                      />

                      <Input
                        name="consumerLastName"
                        placeholder="Last Name"
                        value={values.consumerLastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 items-center gap-x-6 gap-y-4 lg:grid-cols-2">
                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-center gap-4">
                      <Label
                        text="ग्राहकाचे नाव मराठी"
                        className="text-black !w-full whitespace-nowrap"
                        required
                      />

                      <Input
                        name="consumerFirstNameMarathi"
                        placeholder="पहिले नाव"
                        value={values.consumerFirstNameMarathi}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        name="consumerMiddleNameMarathi"
                        placeholder="मधले नाव"
                        value={values.consumerMiddleNameMarathi}
                        onChange={handleChange}
                      />

                      <Input
                        name="consumerLastNameMarathi"
                        placeholder="आडनाव"
                        value={values.consumerLastNameMarathi}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2">
                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-center gap-4">
                      <Label
                        text="Consumer Mobile Number"
                        className="text-black !w-full whitespace-nowrap"
                        required
                      />

                      <Input
                        name="consumerMobileNumber"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="Enter Consumer Mobile Number"
                        value={values.consumerMobileNumber}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          setFieldValue("consumerMobileNumber", value);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-center gap-4">
                      <Label
                        text="Consumer Email"
                        className="text-black !w-full whitespace-nowrap"
                        required
                      />

                      <Input
                        type="email"
                        name="consumerEmail"
                        placeholder="Enter Consumer Email"
                        value={values.consumerEmail}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2">
                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-center gap-4">
                      <Label
                        text="Consumer Aadhar Card No"
                        className="text-black !w-full whitespace-nowrap"
                      />

                      <Input
                        name="consumerAadharCardNo"
                        type="text"
                        inputMode="numeric"
                        maxLength={12}
                        placeholder="Enter Consumer Aadhar Card Number"
                        value={values.consumerAadharCardNo}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 12);
                          setFieldValue("consumerAadharCardNo", value);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-center gap-4">
                      <Label
                        text="Consumer Property Number"
                        className="text-black !w-full whitespace-nowrap"
                      />

                      <Input
                        name="consumerPropertyNumber"
                        placeholder="Enter Consumer Property Number"
                        value={values.consumerPropertyNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2">
                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-center gap-4">
                      <Label
                        text="Consumer Residential Number"
                        className="text-black !w-full whitespace-nowrap"
                        required
                      />

                      <Input
                        name="consumerResidentialNumber"
                        placeholder="Enter Consumer Residential Number"
                        value={values.consumerResidentialNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b py-3">
                <CardTitle className="text-start text-xl">
                  Co-Owner Details
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-5">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[250px_1fr]">
                    <Label
                      text="Other Co-Owner names to include"
                      className="text-black !w-full"
                      required
                    />

                    <div className="flex items-center gap-6">
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-black">
                        <input
                          type="radio"
                          name="includeCoOwner"
                          value="Yes"
                          checked={values.includeCoOwner === "Yes"}
                          onChange={handleChange}
                          className="h-4 w-4 cursor-pointer"
                        />
                        Yes
                      </label>

                      <label className="flex cursor-pointer items-center gap-2 text-sm text-black">
                        <input
                          type="radio"
                          name="includeCoOwner"
                          value="No"
                          checked={values.includeCoOwner === "No"}
                          onChange={handleChange}
                          className="h-4 w-4 cursor-pointer"
                        />
                        No
                      </label>
                    </div>
                  </div>

                  {/* Co-Owner Name */}
                  <div className="grid grid-cols-1 items-center gap-x-6 gap-y-4 lg:grid-cols-[250px_1fr]">
                    <Label
                      text="Co-Owner Name"
                      className="text-black !w-full whitespace-nowrap"
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Input
                        name="coOwnerFirstName"
                        placeholder="First Name"
                        value={values.coOwnerFirstName}
                        onChange={handleChange}
                        disabled={values.includeCoOwner === "No"}
                      />

                      <Input
                        name="coOwnerMiddleName"
                        placeholder="Middle Name"
                        value={values.coOwnerMiddleName}
                        onChange={handleChange}
                        disabled={values.includeCoOwner === "No"}
                      />

                      <Input
                        name="coOwnerLastName"
                        placeholder="Last Name"
                        value={values.coOwnerLastName}
                        onChange={handleChange}
                        disabled={values.includeCoOwner === "No"}
                      />
                    </div>
                  </div>

                  {/* Co-Owner Name Marathi */}
                  <div className="grid grid-cols-1 items-center gap-x-6 gap-y-4 lg:grid-cols-[250px_1fr]">
                    <Label
                      text="Co-Owner Name Marathi"
                      className="text-black !w-full whitespace-nowrap"
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Input
                        name="coOwnerFirstNameMarathi"
                        placeholder="पहिले नाव"
                        value={values.coOwnerFirstNameMarathi}
                        onChange={handleChange}
                        disabled={values.includeCoOwner === "No"}
                      />

                      <Input
                        name="coOwnerMiddleNameMarathi"
                        placeholder="मधले नाव"
                        value={values.coOwnerMiddleNameMarathi}
                        onChange={handleChange}
                        disabled={values.includeCoOwner === "No"}
                      />

                      <Input
                        name="coOwnerLastNameMarathi"
                        placeholder="आडनाव"
                        value={values.coOwnerLastNameMarathi}
                        onChange={handleChange}
                        disabled={values.includeCoOwner === "No"}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2">
                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-start gap-4">
                      <Label
                        text="Address"
                        className="text-black !w-full pt-2 whitespace-nowrap"
                      />

                      <textarea
                        name="coOwnerAddress"
                        placeholder="Enter Address"
                        value={values.coOwnerAddress}
                        onChange={handleChange}
                        className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        disabled={values.includeCoOwner === "No"}
                      />
                    </div>

                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-start gap-4">
                      <Label
                        text="Address Marathi"
                        className="text-black !w-full pt-2 whitespace-nowrap"
                      />

                      <textarea
                        name="coOwnerAddressMarathi"
                        placeholder="पत्ता मराठी"
                        value={values.coOwnerAddressMarathi}
                        onChange={handleChange}
                        className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        disabled={values.includeCoOwner === "No"}
                      />
                    </div>
                  </div>

                  {/* Remark and Reason */}
                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2">
                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-center gap-4">
                      <Label
                        text="Remark"
                        className="text-black !w-full whitespace-nowrap"
                      />

                      <Input
                        name="remark"
                        placeholder="Enter Remark"
                        value={values.remark}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="grid grid-cols-[250px_minmax(0,1fr)] items-center gap-4">
                      <Label
                        text="Reason"
                        className="text-black !w-full whitespace-nowrap"
                      />

                      <Input
                        name="reason"
                        placeholder="Enter Reason"
                        value={values.reason}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b py-3">
                <CardTitle className="text-start text-xl">
                  Connection Details
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label
                      text="Connection Type"
                      className="text-black !w-full"
                    />

                    <Select
                      value={values.connectionType}
                      onValueChange={(value) =>
                        setFieldValue("connectionType", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- Select Option --" />
                      </SelectTrigger>

                      <SelectContent>
                        {connectionTypes.map((item) => (
                          <SelectItem
                            key={item.NUM_CONNTYPE_ID}
                            value={String(item.NUM_CONNTYPE_ID)}
                          >
                            {item.VAR_CONNTYPE_NAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Connection Size"
                      className="text-black !w-full"
                    />

                    <Select
                      value={values.connectionSize}
                      onValueChange={(value) =>
                        setFieldValue("connectionSize", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- Select Option --" />
                      </SelectTrigger>

                      <SelectContent>
                        {connectionSizes.map((item) => (
                          <SelectItem
                            key={item.NUM_CONNSIZE_ID}
                            value={String(item.NUM_CONNSIZE_ID)}
                          >
                            {item.VAR_CONNSIZE_NAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label text="Usage Type" className="text-black !w-full" />

                    <Select
                      value={values.usageType}
                      onValueChange={(value) => {
                        setFieldValue("usageType", value);
                        setFieldValue("usageSubType", "");
                        setUsageSubTypes([]);
                        loadUsageSubTypes(value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- Select Option --" />
                      </SelectTrigger>

                      <SelectContent>
                        {usageTypes.map((item) => (
                          <SelectItem
                            key={item.NUM_USAGETYPE_ID}
                            value={String(item.NUM_USAGETYPE_ID)}
                          >
                            {item.VAR_USAGETYPE_NAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Usage Sub-Type"
                      className="text-black !w-full"
                    />

                    <Select
                      value={values.usageSubType}
                      onValueChange={(value) =>
                        setFieldValue("usageSubType", value)
                      }
                      disabled={!values.usageType}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- Select Option --" />
                      </SelectTrigger>

                      <SelectContent>
                        {usageSubTypes.map((item) => (
                          <SelectItem
                            key={item.NUM_USAGESUBTYPE_ID}
                            value={String(item.NUM_USAGESUBTYPE_ID)}
                          >
                            {item.VAR_USAGESUBTYPE_NAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="No. Of Person"
                      className="text-black !w-full"
                    />

                    <Input
                      type="number"
                      name="noOfPerson"
                      value={values.noOfPerson}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="No. Of Family"
                      className="text-black !w-full"
                    />

                    <Input
                      type="number"
                      name="noOfFamily"
                      value={values.noOfFamily}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="No. Of Connection"
                      className="text-black !w-full"
                    />

                    <Input
                      type="number"
                      name="noOfConnection"
                      value={values.noOfConnection}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Connection Status"
                      className="text-black !w-full"
                    />

                    <Select
                      value={values.connectionStatus}
                      onValueChange={(value) =>
                        setFieldValue("connectionStatus", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- Select Option --" />
                      </SelectTrigger>

                      <SelectContent>
                        {connectionStatuses.map((item) => (
                          <SelectItem
                            key={item.NUM_CONNSTATUS_ID}
                            value={String(item.NUM_CONNSTATUS_ID)}
                          >
                            {item.VAR_CONNSTATUS_NAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Business Certificate"
                      className="text-black !w-full"
                    />

                    <Select
                      value={values.businessCertificate}
                      onValueChange={(value) =>
                        setFieldValue("businessCertificate", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- Select Option --" />
                      </SelectTrigger>

                      <SelectContent>
                        {businessCertificates.map((item) => (
                          <SelectItem
                            key={item.NUM_BUSINESSCERTI_ID}
                            value={String(item.NUM_BUSINESSCERTI_ID)}
                          >
                            {item.VAR_BUSINESSCERTI_NAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label text="Billing Type" className="text-black !w-full" />

                    <Input
                      name="billingType"
                      value={values.billingType}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      text="Is this Govt. Property?"
                      className="text-black !w-full"
                    />

                    <div className="flex items-center gap-5 pt-2">
                      <label className="flex cursor-pointer items-center gap-2 text-black">
                        <Input
                          type="radio"
                          name="isGovtProperty"
                          value="Yes"
                          checked={values.isGovtProperty === "Yes"}
                          onChange={handleChange}
                        />
                        Yes
                      </label>

                      <label className="flex cursor-pointer items-center gap-2 text-black">
                        <Input
                          type="radio"
                          name="isGovtProperty"
                          value="No"
                          checked={values.isGovtProperty === "No"}
                          onChange={handleChange}
                        />
                        No
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <ShadCNTable
                  headers={documentHeaders}
                  data={tableData}
                  keyMapping={documentKeyMapping}
                />
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4 py-4">
              <Button type="submit" className="min-w-[140px]">
                Submit
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="min-w-[140px]"
                onClick={() => {
                  resetForm();
                  setSelectedFiles({});
                  setUsageSubTypes([]);
                }}
              >
                Reset
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default FrmWaterAppliEntry;
