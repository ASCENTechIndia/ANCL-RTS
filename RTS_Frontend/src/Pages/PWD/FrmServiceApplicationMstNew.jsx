import { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import Swal from "sweetalert2";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import config from "@/utils/config";

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
import { serviceApplicationValidationSchema } from "@/validations/global.validation";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AUTO_PRABHAG_SERVICES = ["60", "62", "41", "461"];
const AUTO_PRABHAG_WARD_ID = "12";
const SECTOR_SERVICES = ["60", "62"];

const initialValues = {
  appName: "",
  address: "",
  mobile: "",
  email: "",
  aadharNo: "",
  refNo: "",
  zoneId: "",
  sectorId: "",
  villageId: "",
  locality: "",
  landmark: "",
  pincode: "",
  documents: [],
};

const FrmServiceApplicationMstNew = () => {
  const location = useLocation();
  const { user, token } = useAuth();

  const locationState = location.state || {};

  const ulbId = locationState.ulbId || user?.ulbId || "";
  const userId = locationState.userId || user?.userId || "";
  const serviceId = locationState.serviceId || user?.serviceId || "";
  const serviceName = locationState.serviceName || "Service Application";

  const serviceIdString = String(serviceId);

  const isSectorService = SECTOR_SERVICES.includes(serviceIdString);
  const isAutoPrabhagService = AUTO_PRABHAG_SERVICES.includes(serviceIdString);

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [villageLoading, setVillageLoading] = useState(false);

  const [wards, setWards] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [villages, setVillages] = useState([]);
  const [documents, setDocuments] = useState([]);

  const documentHeaders = ["Sr No.", "Document Name", "Image(jpg,png,pdf)"];

  const documentKeyMapping = {
    "Sr No.": "srNo",
    "Document Name": "documentName",
    "Image(jpg,png,pdf)": "fileUpload",
  };

  const documentColumnStyles = {
    "Sr No.": {
      width: "100px",
      textAlign: "center",
    },
    "Document Name": {
      width: "560px",
    },
    "Image(jpg,png,pdf)": {
      width: "340px",
    },
  };

  const showLoader = (title) => {
    Swal.fire({
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  };

  useEffect(() => {
    if ( !ulbId || !serviceId) {
      return;
    }

    loadInitialData();
  }, [ ulbId, serviceId]);

  const getHeaders = () => ({
    headers: {
      Authorization: `Bearer ${token || localStorage.getItem("token") || ""}`,
    },
  });

  const loadInitialData = async () => {
    try {
      setLoading(true);

      showLoader("Loading Application Details...");

      const apiCalls = [loadWards(), loadDocuments()];

      if (isSectorService) {
        apiCalls.push(loadSectors());
      }

      const results = await Promise.allSettled(apiCalls);

      const failedResults = results.filter(
        (result) => result.status === "rejected",
      );

      failedResults.forEach((result, index) => {
        console.error(`Initial API ${index + 1} failed:`, result.reason);
      });

      if (failedResults.length === results.length) {
        throw new Error("Unable to load application details.");
      }
    } catch (error) {
      console.error("Initial application load error:", error);

      await Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to load application details.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  const loadWards = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmServiceApplicationMst/wardlist`,
        {
          ulbId: Number(ulbId),
        },
        getHeaders(),
      );

      if (!response?.data?.ok) {
        throw new Error(response?.data?.message || "Unable to load Prabhag.");
      }

      const wardData = response?.data?.data?.data || [];

      if (!Array.isArray(wardData)) {
        throw new Error("Invalid Prabhag response.");
      }

      setWards(wardData);

      return wardData;
    } catch (error) {
      console.error("Ward list API error:", error);
      setWards([]);
      throw error;
    }
  };

  const loadSectors = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmServiceApplicationMst/sectorlist`,
        {
          serviceId: Number(serviceId),
        },
        getHeaders(),
      );

      if (!response?.data?.ok) {
        throw new Error(response?.data?.message || "Unable to load Sector.");
      }

      const sectorData = response?.data?.data?.data || [];

      if (!Array.isArray(sectorData)) {
        throw new Error("Invalid Sector response.");
      }

      setSectors(sectorData);

      return sectorData;
    } catch (error) {
      console.error("Sector list API error:", error);
      setSectors([]);
      throw error;
    }
  };

  const loadVillages = async (selectedSectorId) => {
    if (!selectedSectorId || selectedSectorId === "0") {
      setVillages([]);
      return [];
    }

    try {
      setVillageLoading(true);

      const response = await axios.post(
        `${BASE_URL}/api/FrmServiceApplicationMst/villages`,
        {
          sectorId: Number(selectedSectorId),
        },
        getHeaders(),
      );

      if (!response?.data?.ok) {
        throw new Error(response?.data?.message || "Unable to load Village.");
      }

      const villageData = response?.data?.data?.data || [];

      if (!Array.isArray(villageData)) {
        throw new Error("Invalid Village response.");
      }

      setVillages(villageData);

      return villageData;
    } catch (error) {
      console.error("Village list API error:", error);

      setVillages([]);

      await Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to load Village.",
        confirmButtonText: "OK",
      });

      return [];
    } finally {
      setVillageLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      setDocumentLoading(true);

      const response = await axios.post(
        `${BASE_URL}/api/FrmServiceApplicationMst/documentlist`,
        {
          serviceId: Number(serviceId),
          ulbId: Number(ulbId),
        },
        getHeaders(),
      );

      if (!response?.data?.ok) {
        throw new Error(response?.data?.message || "Unable to load documents.");
      }

      const documentData = response?.data?.data?.data || [];

      if (!Array.isArray(documentData)) {
        throw new Error("Invalid document response.");
      }

      const mappedDocuments = documentData.map((item, index) => ({
        id: item?.DOCID ?? `document-${index + 1}`,
        docId: item?.DOCID ?? "",
        documentName: item?.DOCNAME || "",
        engDocDesc: item?.ENGDOCDESC || "",
        docType: item?.DOCTYPE || "",
        nocNew: item?.NOC_NEW,
        nocRenewal: item?.NOC_RENEWAL,
        active: item?.ACTIVE || "",
        file: null,
        fileName: "",
        srNo: index + 1,
      }));

      setDocuments(mappedDocuments);

      return mappedDocuments;
    } catch (error) {
      console.error("Document list API error:", error);
      setDocuments([]);
      throw error;
    } finally {
      setDocumentLoading(false);
    }
  };

  const validateFile = (file) => {
    if (!file) {
      return "Please select a file.";
    }

    if (file.size > 5 * 1024 * 1024) {
      return "Document Size Should Be <5 mb";
    }

    const extension = file.name?.split(".").pop()?.toUpperCase();

    const allowedExtensions = ["JPEG", "JPG", "PNG", "PDF"];

    if (!allowedExtensions.includes(extension)) {
      return "Document Should Be Acceptable In JPEG/JPG/PNG/PDF Format Only";
    }

    return null;
  };

  const handleFileChange = (documentId, event, setFieldValue) => {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      return;
    }

    const validationMessage = validateFile(file);

    if (validationMessage) {
      Swal.fire({
        title: "Invalid Document",
        text: validationMessage,
        confirmButtonText: "OK",
      });

      event.target.value = "";
      return;
    }

    const updatedDocuments = documents.map((document) =>
      String(document.id) === String(documentId)
        ? {
            ...document,
            file,
            fileName: file.name,
          }
        : document,
    );

    setDocuments(updatedDocuments);
    setFieldValue("documents", updatedDocuments);
  };

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      setIsSubmitting(true);
      setSubmitting(true);

      showLoader("Submitting Application...");

      let zoneId = 0;
      let sectorId = 0;
      let villageId = 0;

      let locality = "";
      let landmark = "";
      let pincode = 0;

      if (isSectorService) {
        sectorId = Number(values.sectorId) || 0;
        villageId = Number(values.villageId) || 0;

        zoneId =
          Number(
            wards.find((ward) => String(ward?.WARDID) === AUTO_PRABHAG_WARD_ID)
              ?.WARDID,
          ) || 0;
      } else if (["41", "461"].includes(serviceIdString)) {
        zoneId =
          Number(
            wards.find((ward) => String(ward?.WARDID) === AUTO_PRABHAG_WARD_ID)
              ?.WARDID,
          ) || 0;

        locality = values.locality?.trim() || "";
        landmark = values.landmark?.trim() || "";
        pincode = Number(values.pincode) || 0;
      } else {
        zoneId = Number(values.zoneId) || 0;
      }

      const payload = {
        ulbId: Number(ulbId),
        userId: String(userId),
        serviceId: Number(serviceId),
        applicationName: values.appName?.trim() || "",
        address: values.address?.trim() || "",
        mobile: values.mobile?.trim() || "",
        email: values.email?.trim() || "",
        aadharNo: values.aadharNo?.trim() || "",
        refNo: values.refNo?.trim() || "",
        zoneId,
        sectorId,
        villageId,
        locality,
        landmark,
        pincode,
        source: config.source || "RW",
      };

      console.log("FrmServiceApplicationMst/save payload:", payload);

      const response = await axios.post(
        `${BASE_URL}/api/FrmServiceApplicationMst/save`,
        payload,
        getHeaders(),
      );

      if (!response?.data?.success) {
        throw new Error(
          response?.data?.message || "Unable to submit application.",
        );
      }

      const applicationNo = response?.data?.applicationNo || "";

      Swal.close();

      await Swal.fire({
        title: "Success",
        text:
          response?.data?.message ||
          `Your Application has been successfully Submitted, Your Application No is ${applicationNo}`,
        confirmButtonText: "OK",
      });

      resetForm({
        values: {
          ...initialValues,
          zoneId: isAutoPrabhagService ? AUTO_PRABHAG_WARD_ID : "",
          documents: [],
        },
      });

      setDocuments((currentDocuments) =>
        currentDocuments.map((document, index) => ({
          ...document,
          file: null,
          fileName: "",
          srNo: index + 1,
        })),
      );
    } catch (error) {
      Swal.close();

      console.error("Save application error:", error);

      await Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to submit application.",
        confirmButtonText: "OK",
      });
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full border shadow-[0px_5px_10px_10px_rgba(0,0,0,0.2)]">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800">
          {serviceName}
        </CardTitle>
      </CardHeader>

   <Formik
  initialValues={{
    ...initialValues,
    zoneId: isAutoPrabhagService
      ? AUTO_PRABHAG_WARD_ID
      : "",
  }}
  enableReinitialize
  validateOnChange={false}
  validateOnBlur={false}
  onSubmit={async (values, formikHelpers) => {
    const result =
      serviceApplicationValidationSchema(serviceId).safeParse(values);

    if (!result.success) {
      const firstError = result.error.issues[0];

      const fieldName = firstError.path?.[0];
      const errorMessage = firstError.message;

      if (fieldName) {
        formikHelpers.setFieldTouched(fieldName, true, false);
        formikHelpers.setFieldError(fieldName, errorMessage);
      }

      await Swal.fire({
        text: errorMessage,
        confirmButtonText: "OK",
      });

      return;
    }

    await handleSubmit(values, formikHelpers);
  }}
>
        {({ values, handleChange, setFieldValue }) => {
          const transformedTableData = documents.map((document) => ({
            ...document,
            fileUpload: (
              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                 maxFileSize={5 * 1024 * 1024}

                onChange={(event) =>
                  handleFileChange(document.id, event, setFieldValue)
                }
                className="h-9 w-full min-w-[280px] cursor-pointer bg-white text-xs"
              />
            ),
          }));

          return (
            <Form className="w-full">
              <CardContent className="space-y-5 px-4 py-2 sm:px-5">
                <div className="rounded-md border border-slate-200 bg-white">
                  <div className="border-b px-4 py-1.5">
                    <h2 className="text-sm font-semibold">
                      Application Details
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-x-8 gap-y-3 p-3 lg:grid-cols-2">
                    <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[180px_minmax(0,1fr)]">
                      <Label
                        text="Applicant Name :"
                        required
                        className="whitespace-nowrap text-sm font-medium text-black sm:text-right"
                      />

                      <Input
                        name="appName"
                        value={values.appName}
                        onChange={handleChange}
                        className="h-9 rounded-md bg-white text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[180px_minmax(0,1fr)]">
                      <Label
                        text="Area :"
                        required
                        className="whitespace-nowrap text-sm font-medium text-black sm:text-right"
                      />

                      <Input
                        name="address"
                        value={values.address}
                        onChange={handleChange}
                        className="h-9"
                      />
                    </div>

                    {["41", "461"].includes(serviceIdString) && (
                      <>
                        <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[180px_minmax(0,1fr)]">
                          <Label
                            text="Locality :"
                            required
                            className="whitespace-nowrap text-sm font-medium text-black sm:text-right"
                          />

                          <Input
                            name="locality"
                            value={values.locality}
                            onChange={handleChange}
                            className="h-9"
                          />
                        </div>

                        <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[180px_minmax(0,1fr)]">
                          <Label
                            text="Landmark :"
                            required
                            className="whitespace-nowrap text-sm font-medium text-black sm:text-right"
                          />

                          <Input
                            name="landmark"
                            value={values.landmark}
                            onChange={handleChange}
                            className="h-9"
                          />
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[180px_minmax(0,1fr)]">
                      <Label
                        text="Mobile No. :"
                        required
                        className="whitespace-nowrap text-sm font-medium text-black sm:text-right"
                      />

                      <Input
                        name="mobile"
                        value={values.mobile}
                        maxLength={10}
                        inputMode="numeric"
                        onChange={(event) =>
                          setFieldValue(
                            "mobile",
                            event.target.value.replace(/\D/g, "").slice(0, 10),
                          )
                        }
                        className="h-9"
                      />
                    </div>

                    <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[180px_minmax(0,1fr)]">
                      <Label
                        text="Email ID :"
                        required
                        className="whitespace-nowrap text-sm font-medium text-black sm:text-right"
                      />

                      <Input
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        className="h-9"
                      />
                    </div>

                    <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[180px_minmax(0,1fr)]">
                      <Label
                        text="Aadhar No. :"
                        className="whitespace-nowrap text-sm font-medium text-black sm:text-right"
                      />

                      <Input
                        name="aadharNo"
                        value={values.aadharNo}
                        maxLength={12}
                        inputMode="numeric"
                        onChange={(event) =>
                          setFieldValue(
                            "aadharNo",
                            event.target.value.replace(/\D/g, "").slice(0, 12),
                          )
                        }
                        className="h-9"
                      />
                    </div>

                    {isSectorService && (
                      <>
                        <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[180px_minmax(0,1fr)]">
                          <Label
                            text="Sector :"
                            required
                            className="whitespace-nowrap text-sm font-medium text-black sm:text-right"
                          />

                          <Select
                            value={
                              values.sectorId ? String(values.sectorId) : ""
                            }
                            onValueChange={(value) => {
                              setFieldValue("sectorId", value);
                              setFieldValue("villageId", "");
                              setVillages([]);
                              loadVillages(value);
                            }}
                          >
                            <SelectTrigger className="h-9 w-full rounded-md">
                              <SelectValue placeholder="Select Sector" />
                            </SelectTrigger>

                            <SelectContent>
                              {sectors.map((sector) => (
                                <SelectItem
                                  key={sector.SECTORID}
                                  value={String(sector.SECTORID)}
                                >
                                  {sector.SECTORNAME}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[180px_minmax(0,1fr)]">
                          <Label
                            text="Village :"
                            required
                            className="whitespace-nowrap text-sm font-medium text-black sm:text-right"
                          />

                          <Select
                            value={
                              values.villageId ? String(values.villageId) : ""
                            }
                            onValueChange={(value) =>
                              setFieldValue("villageId", value)
                            }
                            disabled={!values.sectorId || villageLoading}
                          >
                            <SelectTrigger className="h-9 w-full rounded-md">
                              <SelectValue
                                placeholder={
                                  villageLoading
                                    ? "Loading Village..."
                                    : "Select Village"
                                }
                              />
                            </SelectTrigger>

                            <SelectContent>
                              {villages.map((village) => (
                                <SelectItem
                                  key={village.VILLAGEID}
                                  value={String(village.VILLAGEID)}
                                >
                                  {village.VILLAGENAME}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[180px_minmax(0,1fr)]">
                      <Label
                        text="Prabhag :"
                        required
                        className="whitespace-nowrap text-sm font-medium text-black sm:text-right"
                      />

                      <Select
                        value={values.zoneId ? String(values.zoneId) : ""}
                        onValueChange={(value) => {
                          if (isAutoPrabhagService) {
                            return;
                          }

                          setFieldValue("zoneId", value);
                        }}
                      >
                        <SelectTrigger className="h-9 w-full rounded-md">
                          <SelectValue placeholder="Select Prabhag" />
                        </SelectTrigger>

                        <SelectContent>
                          {wards.map((ward) => (
                            <SelectItem
                              key={ward.WARDID}
                              value={String(ward.WARDID)}
                            >
                              {ward.WARDNAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {["41", "461"].includes(serviceIdString) && (
                      <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[180px_minmax(0,1fr)]">
                        <Label
                          text="Pincode :"
                          required
                          className="whitespace-nowrap text-sm font-medium text-black sm:text-right"
                        />

                        <Input
                          name="pincode"
                          value={values.pincode}
                          maxLength={6}
                          inputMode="numeric"
                          onChange={(event) =>
                            setFieldValue(
                              "pincode",
                              event.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          className="h-9"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-md border bg-white">
                  <div className="border-b px-4 py-1.5">
                    <h2 className="text-sm font-semibold">Document Details</h2>
                  </div>

                  <div className="p-4">
                    {documentLoading ? (
                      <div className="py-6 text-center text-sm">
                        Loading documents...
                      </div>
                    ) : documents.length === 0 ? (
                      <div className="py-6 text-center text-sm">
                        No documents available.
                      </div>
                    ) : (
                      <div className="mx-auto w-full max-w-[1000px] overflow-x-auto">
                        <ShadCNTable
                          headers={documentHeaders}
                          data={transformedTableData}
                          keyMapping={documentKeyMapping}
                          columnStyles={documentColumnStyles}
                          pagination={false}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 border-t pt-4">
                  <Button type="submit" disabled={isSubmitting || loading}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    path="/"
                  >
                    Back
                  </Button>
                </div>
              </CardContent>
            </Form>
          );
        }}
      </Formik>
    </Card>
  );
};

export default FrmServiceApplicationMstNew;
