import React, { useState, useEffect, useRef } from "react";
import { Formik, Form } from "formik";
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
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import config from "@/utils/config";

const initialValues = {
  zoneId: "",
  prabhag: "",
  firstName: "",
  middleName: "",
  lastName: "",
  mobileNo: "",
  emailId: "",
  aadharNo: "",
  propertyNo: "",
  residentialNo: "",
  roadType: "",
  roadLength: "",
  roadWidth: "",
  roadArea: "",
  excavationSize: "",
  startPoint: "",
  endPoint: "",
  vcStartPoint: "",
  vcEndPoint: "",
  latitude: "",
  longitude: "",
  roadCutType: "",
  roadCutReason: "",
};

const FrmRoadCutting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const isFirstRender = useRef(true);

  const locationState = location.state || {};
  
  const ulbId = locationState.ulbId || user?.ulbId;
  const userId = locationState.userId || user?.userId;
  const serviceId = locationState.serviceId || sessionStorage.getItem("ServiceId");
  const serviceName = locationState.serviceName || sessionStorage.getItem("ServEngName");

  const [loading, setLoading] = useState(false);
  const [pageTitle, setPageTitle] = useState(serviceName || "Road Cutting Application");
  const [zoneList, setZoneList] = useState([]);
  const [prabhagList, setPrabhagList] = useState([]);
  const [roadTypeList, setRoadTypeList] = useState([]);
  const [roadCutTypeList, setRoadCutTypeList] = useState([]);
  const [showPrabhag, setShowPrabhag] = useState(false);
  const [showRoadCutType, setShowRoadCutType] = useState(false);
  const [showRoadCutReason, setShowRoadCutReason] = useState(false);
  const [showSMKCStartEnd, setShowSMKCStartEnd] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const specialUlbIds = [870, 1690];
    if (ulbId && specialUlbIds.includes(Number(ulbId))) {
      setShowPrabhag(true);
      setShowRoadCutType(true);
      setShowRoadCutReason(true);
      setShowSMKCStartEnd(true);
    } else {
      setShowPrabhag(false);
      setShowRoadCutType(false);
      setShowRoadCutReason(false);
      setShowSMKCStartEnd(false);
    }
  }, [ulbId]);

  useEffect(() => {
    const title = serviceName || "Road Cutting Application";
    setPageTitle(title);
    document.title = title;
    
    if (ulbId && isFirstRender.current) {
      isFirstRender.current = false;
      fetchAllData();
    }
  }, [ulbId, serviceName]);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchZones(),
        fetchPrabhags(),
        fetchRoadTypes(),
        fetchRoadCutTypes(),
      ]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const fetchZones = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/FrmRoadCutting/wardlist`,
        {
          params: { ulbid: Number(ulbId) },
          headers: { 
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
        const wardData = response.data.data.data;
        const mappedData = wardData.map(item => ({
          wardId: item.wardId || item.WARDID,
          wardName: item.wardName || item.WARDNAME
        }));
        setZoneList(mappedData);
      } else {
        setZoneList([]);
      }
    } catch (error) {
      console.error("Error fetching zones:", error);
      setZoneList([]);
    }
  };

  const fetchPrabhags = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/FrmRoadCutting/prabhag-samiti-list`,
        {
          params: { ulbid: Number(ulbId) },
          headers: { 
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response?.data?.data?.data) {
        const mappedData = response.data.data.data.map(item => ({
          prabhagId: item.prabhagId || item.PRABHAGID,
          prabhagName: item.prabhagName || item.PRABHAGNAME
        }));
        setPrabhagList(mappedData);
      } else {
        setPrabhagList([]);
      }
    } catch (error) {
      console.error("Error fetching prabhags:", error);
      setPrabhagList([]);
    }
  };

  const fetchRoadTypes = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/FrmRoadCutting/road-types`,
        {
          params: { ulbid: Number(ulbId) },
          headers: { 
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response?.data?.data?.data) {
        const mappedData = response.data.data.data.map(item => ({
          roadTypeId: item.roadTypeId || item.ROADTYPEID,
          roadTypeName: item.roadTypeName || item.ROADTYPENAME
        }));
        setRoadTypeList(mappedData);
      } else {
        setRoadTypeList([]);
      }
    } catch (error) {
      console.error("Error fetching road types:", error);
      setRoadTypeList([]);
    }
  };

  const fetchRoadCutTypes = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/FrmRoadCutting/road-cutting-types`,
        {
          params: { ulbid: Number(ulbId) },
          headers: { 
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response?.data?.data?.data) {
        const mappedData = response.data.data.data.map(item => ({
          roadCuttingTypeId: item.roadCuttingTypeId || item.ROADCUTTINGTYPEID,
          roadCuttingTypeName: item.roadCuttingTypeName || item.ROADCUTTINGTYPENAME
        }));
        setRoadCutTypeList(mappedData);
      } else {
        setRoadCutTypeList([]);
      }
    } catch (error) {
      console.error("Error fetching road cut types:", error);
      setRoadCutTypeList([]);
    }
  };

  const validateFields = (values) => {

    if (!values.zoneId || values.zoneId === "0" || values.zoneId === "") {
      Swal.fire({
        text: "Please Select Zone Id",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (showPrabhag && (!values.prabhag || values.prabhag === "0" || values.prabhag === "")) {
      Swal.fire({
        text: "Please Select Prabhag",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (!values.firstName?.trim()) {
      Swal.fire({
        text: "Please Enter First Name",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (!values.middleName?.trim()) {
      Swal.fire({
        text: "Please Enter Middle Name",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (!values.lastName?.trim()) {
      Swal.fire({
        text: "Please Enter Last Name",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (!values.mobileNo?.trim()) {
      Swal.fire({
        text: "Please Enter Mobile Number",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (values.mobileNo.length !== 10 || !/^\d+$/.test(values.mobileNo)) {
      Swal.fire({
        text: "Invalid Mobile No - must be 10 digits",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (!values.emailId?.trim()) {
      Swal.fire({
        text: "Please Enter Email ID",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    const emailRegex = /^([\w\.\-\+]+)@([\w\-]+)((\.(\w){2,3})+)$/;
    if (!emailRegex.test(values.emailId)) {
      Swal.fire({
        text: "Invalid Email Address",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (!values.aadharNo?.trim()) {
      Swal.fire({
        text: "Please Enter Aadhar Number",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (values.aadharNo.length !== 12 || !/^\d+$/.test(values.aadharNo)) {
      Swal.fire({
        text: "Please enter valid Aadhar No.",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (!values.residentialNo?.trim()) {
      Swal.fire({
        text: "Please Enter Residential Number",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (!values.roadType || values.roadType === "0" || values.roadType === "") {
      Swal.fire({
        text: "Please Select रस्त्याचे प्रकार",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (values.roadLength === "" || values.roadLength === null || values.roadLength === undefined) {
      Swal.fire({
        text: "Please Enter रस्त्याची लांबी (मीटर)",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    const roadLengthNum = Number(values.roadLength);
    if (isNaN(roadLengthNum) || roadLengthNum <= 0) {
      Swal.fire({
        text: "Please Enter a Valid रस्त्याची लांबी ",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (values.roadWidth === "" || values.roadWidth === null || values.roadWidth === undefined) {
      Swal.fire({
        text: "Please Enter रस्त्याची रुंदी (मीटर)",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    const roadWidthNum = Number(values.roadWidth);
    if (isNaN(roadWidthNum) || roadWidthNum <= 0) {
      Swal.fire({
        text: "Please Enter a Valid रस्त्याची रुंदी",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (values.roadArea === "" || values.roadArea === null || values.roadArea === undefined) {
      Swal.fire({
        text: "Please Enter रस्त्याची लांबीरुंदी (चो.मीटर)",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    const roadAreaNum = Number(values.roadArea);
    if (isNaN(roadAreaNum) || roadAreaNum <= 0) {
      Swal.fire({
        text: "Please Enter a Valid रस्त्याची लांबीरुंदी",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (values.excavationSize === "" || values.excavationSize === null || values.excavationSize === undefined) {
      Swal.fire({
        text: "Please Enter खोदण्याचे आकार (मीटर)",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    const excavationSizeNum = Number(values.excavationSize);
    if (isNaN(excavationSizeNum) || excavationSizeNum <= 0) {
      Swal.fire({
        text: "Please Enter a Valid खोदण्याचे आकार",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (values.startPoint === "" || values.startPoint === null || values.startPoint === undefined) {
      Swal.fire({
        text: "Please Enter खोदाईचा प्रारंभिक बिंदू",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    const excavationStartPoint = Number(values.startPoint);
    if (isNaN(excavationStartPoint)) {
      Swal.fire({
        text: "Please Enter a Valid खोदाईचा प्रारंभिक बिंदू",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (values.endPoint === "" || values.endPoint === null || values.endPoint === undefined) {
      Swal.fire({
        text: "Please Enter खोदाईचा अंतिम बिंदू",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    const excavationEndPoint = Number(values.endPoint);
    if (isNaN(excavationEndPoint)) {
      Swal.fire({
        text: "Please Enter a Valid खोदाईचा अंतिम बिंदू",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (values.latitude === "" || values.latitude === null || values.latitude === undefined) {
      Swal.fire({
        text: "Please Enter अक्षांश",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    const latitudeNum = Number(values.latitude);
    if (isNaN(latitudeNum)) {
      Swal.fire({
        text: "Please Enter a Valid अक्षांश",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (values.longitude === "" || values.longitude === null || values.longitude === undefined) {
      Swal.fire({
        text: "Please Enter रेखांश",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    const longitudeNum = Number(values.longitude);
    if (isNaN(longitudeNum)) {
      Swal.fire({
        text: "Please Enter a Valid रेखांश",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (showRoadCutType && (!values.roadCutType || values.roadCutType === "0" || values.roadCutType === "")) {
      Swal.fire({
        text: "Please Select Road Cutting Type",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (showRoadCutReason && !values.roadCutReason?.trim()) {
      Swal.fire({
        text: "Please Enter Road Cutting Reason",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
  setLoading(true);
  
  try {
    if (!validateFields(values)) {
      setLoading(false);
      setSubmitting(false);
      return;
    }

    const loader = Swal.fire({
      title: "",
      text: "Submitting Application...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    const savePayload = {
      userId: String(userId),
      serviceId: String(serviceId || "RC001"),
      roadCuttingId: "0",
      ulbId: Number(ulbId),
      appliFName: values.firstName?.trim() || "",
      appliMName: values.middleName?.trim() || "",
      appliLName: values.lastName?.trim() || "",
      mobile: values.mobileNo?.trim() || "",
      email: values.emailId?.trim() || "",
      aadharNo: values.aadharNo?.trim() || "",
      propNo: values.propertyNo?.trim() || "",
      resNo: values.residentialNo?.trim() || "",
      roadType: Number(values.roadType),
      roadLength: Number(values.roadLength),
      roadWidth: Number(values.roadWidth),
      roadLengthWidth: Number(values.roadArea) || (Number(values.roadLength) * Number(values.roadWidth)),
      excavationSize: Number(values.excavationSize),
      // excavationStart: Number(values.vcStartPoint) || Number(values.startPoint) || "0",
      // excavationEnd: Number(values.vcEndPoint) || Number(values.endPoint) || "0",
      excavationStart: values.startPoint ? Number(values.startPoint) : null,
      excavationEnd:   values.endPoint   ? Number(values.endPoint)   : null,
      vcStartPoint:    values.vcStartPoint ? String(values.vcStartPoint) : null,
      vcEndPoint:      values.vcEndPoint   ? String(values.vcEndPoint)   : null,
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
      zoneId: Number(values.zoneId),
      source: config.source,
      ...(showPrabhag && { prabhagId: Number(values.prabhag) }),
      ...(showRoadCutType && { roadCutTypeId: Number(values.roadCutType) }),
      ...(showRoadCutReason && { roadCutReason: values.roadCutReason?.trim() || "" }),
    };

    const response = await axios.post(
      `${BASE_URL}/api/FrmRoadCutting/saveRoadCutting`,
      savePayload,
      {
        headers: { 
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          'Content-Type': 'application/json',
        },
      }
    );

    loader.close();

    const responseData = response.data;
    const isSuccess = responseData?.ok === true && responseData?.data?.errCode === 9999;
    
    if (isSuccess) {
      const applicationNo = responseData.data?.applicationNo || "RC" + Date.now();
      const successMessage = responseData.data?.message || responseData.message || "Application submitted successfully";
      
      Swal.fire({
        text: `${successMessage}, Your Application No is ${applicationNo}`,
        confirmButtonText: "OK",
        confirmButtonColor: '#1e3a8a',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/app/FrmTrackApplication", { 
            state: { 
              applicationNo: applicationNo,
              serviceName: pageTitle,
              ulbId: ulbId
            } 
          });
        }
      });
    } else {
      const errorMessage = responseData?.data?.message || 
                          responseData?.message || 
                          responseData?.data?.errMsg || 
                          "Application submission failed";
      
      Swal.fire({
        title: "Error",
        text: errorMessage,
        confirmButtonText: "OK",
        confirmButtonColor: '#1e3a8a',
      });
    }
  } catch (error) {
    console.error("Error submitting application:", error);
    
    let errorMessage = "Error submitting application. Please try again.";
    
    if (error.response) {
      errorMessage = error.response.data?.message || 
                     error.response.data?.data?.errMsg ||
                     error.response.data?.data?.message ||
                     error.response.data?.error || 
                     errorMessage;
    } else if (error.request) {
      errorMessage = "No response from server. Please check your connection.";
    } else {
      errorMessage = error.message;
    }
    
    Swal.fire({
      text: errorMessage,
      confirmButtonText: "OK",
      confirmButtonColor: '#1e3a8a',
    });
  } finally {
    setLoading(false);
    setSubmitting(false);
  }
};

  const handleReset = (resetForm) => {
    Swal.fire({
      text: "Want to Reset?",
      showCancelButton: true,
      confirmButtonColor: '#1e3a8a',
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        resetForm();
      }
    });
  };

  const handleRoadLengthWidth = (values, setFieldValue) => {
    const length = parseFloat(values.roadLength);
    const width = parseFloat(values.roadWidth);
    if (!isNaN(length) && !isNaN(width) && length > 0 && width > 0) {
      let area = length * width;
      if (area > 99999999) area = 99999999;
      setFieldValue("roadArea", String(Math.floor(area)));
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      {({ values, handleChange, setFieldValue, isSubmitting, resetForm }) => (
        <Form>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">
                  {pageTitle}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 w-full shrink-0 flex justify-start items-center whitespace-nowrap">
                      <Label required text="Zone Id" />
                    </div>
                    <Select
                      value={values.zoneId}
                      onValueChange={(value) => setFieldValue("zoneId", value)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="-- Select Zone --" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(zoneList) && zoneList.length > 0 ? (
                          zoneList.map((zone) => (
                            <SelectItem 
                              key={zone.wardId || zone.WARDID || Math.random()} 
                              value={String(zone.wardId || zone.WARDID)}
                            >
                              {zone.wardName || zone.WARDNAME || "Unknown"}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="0">No Zone available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {showPrabhag && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 w-full shrink-0 flex justify-start items-center whitespace-nowrap">
                        <Label required text="प्रभाग" />
                      </div>
                      <Select
                        value={values.prabhag}
                        onValueChange={(value) => setFieldValue("prabhag", value)}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="-- Select Prabhag --" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(prabhagList) && prabhagList.length > 0 ? (
                            prabhagList.map((prabhag) => (
                              <SelectItem 
                                key={prabhag.prabhagId || Math.random()} 
                                value={String(prabhag.prabhagId)}
                              >
                                {prabhag.prabhagName || "Unknown"}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="0">No Prabhag available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-14">
                    <div className="sm:w-24 w-full shrink-0 flex justify-start items-center whitespace-nowrap">
                      <Label required text="Applicant Name" />
                    </div>
                    <Input
                      name="firstName"
                      value={values.firstName}
                      onChange={handleChange}
                      className="w-full h-9"
                      placeholder="First Name"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <Input
                      name="middleName"
                      value={values.middleName}
                      onChange={handleChange}
                      className="w-full h-9"
                      placeholder="Middle Name"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Input
                      name="lastName"
                      value={values.lastName}
                      onChange={handleChange}
                      className="w-full h-9"
                      placeholder="Last Name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 w-full shrink-0 flex justify-start items-center whitespace-nowrap">
                      <Label required text="Mobile Number" />
                    </div>
                    <Input
                      name="mobileNo"
                      value={values.mobileNo}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setFieldValue("mobileNo", value);
                      }}
                      className="w-full h-9"
                      type="text"
                      maxLength={10}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 w-full shrink-0 flex justify-start items-center whitespace-nowrap">
                      <Label required text="Email Id" />
                    </div>
                    <Input
                      name="emailId"
                      value={values.emailId}
                      onChange={handleChange}
                      className="w-full h-9"
                      type="email"
                      maxLength={30}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 w-full shrink-0 flex justify-start items-center whitespace-nowrap">
                      <Label required text="Aadhar Number" />
                    </div>
                    <Input
                      name="aadharNo"
                      value={values.aadharNo}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 12);
                        setFieldValue("aadharNo", value);
                      }}
                      className="w-full h-9"
                      type="text"
                      maxLength={12}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 w-full shrink-0 flex justify-start items-center whitespace-nowrap">
                      <Label text="Property Number" />
                    </div>
                    <Input
                      name="propertyNo"
                      value={values.propertyNo}
                      onChange={handleChange}
                      className="w-full h-9"
                      type="text"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="sm:w-36 w-full shrink-0 flex justify-start items-center whitespace-nowrap">
                    <Label required text="Residential Number" />
                  </div>
                  <Input
                    name="residentialNo"
                    value={values.residentialNo}
                    onChange={handleChange}
                    className="w-full h-9"
                    type="text"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 w-full shrink-0 flex justify-start items-center whitespace-nowrap">
                      <Label required text="रस्त्याचे प्रकार" />
                    </div>
                    <Select
                      value={values.roadType}
                      onValueChange={(value) => setFieldValue("roadType", value)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="-- Select Road Type --" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(roadTypeList) && roadTypeList.length > 0 ? (
                          roadTypeList.map((type) => (
                            <SelectItem 
                              key={type.roadTypeId || Math.random()} 
                              value={String(type.roadTypeId)}
                            >
                              {type.roadTypeName || "Unknown"}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="0">No road types available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 w-full shrink-0 flex justify-start items-center whitespace-nowrap">
                      <Label required text="रस्त्याची लांबी (मीटर)" />
                    </div>
                    <Input
                      name="roadLength"
                      value={values.roadLength}
                      onInput={(e) => {
                        if (e.target.value.length > 8) {
                          e.target.value = e.target.value.slice(0, 8);
                        }
                      }}
                      onChange={(e) => {
                        handleChange(e);
                        setTimeout(() => handleRoadLengthWidth(values, setFieldValue), 100);
                      }}
                      className="w-full h-9"
                      type="number"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 w-full shrink-0 flex justify-start items-center whitespace-nowrap">
                      <Label required text="रस्त्याची रुंदी (मीटर)" />
                    </div>
                    <Input
                      name="roadWidth"
                      value={values.roadWidth}
                      onInput={(e) => {
                        if (e.target.value.length > 8) {
                          e.target.value = e.target.value.slice(0, 8);
                        }
                      }}
                      onChange={(e) => {
                        handleChange(e);
                        setTimeout(() => handleRoadLengthWidth(values, setFieldValue), 100);
                      }}
                      className="w-full h-9"
                      type="number"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 w-full shrink-0 flex justify-start items-center">
                      <Label text="रस्त्याची लांबीरुंदी (चो.मीटर)" /> <span><font color="red"> * </font></span>
                    </div>
                    <Input
                      name="roadArea"
                      value={values.roadArea}
                      onInput={(e) => {
                        if (e.target.value.length > 8) {
                          e.target.value = e.target.value.slice(0, 8);
                        }
                      }}
                      onChange={handleChange}
                      className="w-full h-9"
                      type="number"
                      step="0.01"
                      min="0"
                      maxLength={10}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 w-full shrink-0 flex justify-start items-center">
                      <Label text="खोदण्याचे आकार (मीटर)" /> <span><font color="red"> * </font></span>
                    </div>
                    <Input
                      name="excavationSize"
                      value={values.excavationSize}
                      onInput={(e) => {
                        if (e.target.value.length > 8) {
                          e.target.value = e.target.value.slice(0, 8);
                        }
                      }}
                      onChange={handleChange}
                      className="w-full h-9"
                      type="number"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {!showSMKCStartEnd && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 w-full shrink-0 flex justify-start items-center whitespace-nowrap">
                        <Label required text="खोदाईचा प्रारंभिक बिंदू" />
                      </div>
                      <Input
                        name="startPoint"
                        value={values.startPoint}
                        onInput={(e) => {
                          if (e.target.value.length > 8) {
                            e.target.value = e.target.value.slice(0, 8);
                          }
                        }}
                        onChange={handleChange}
                        className="w-full h-9"
                        type="number"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 w-full shrink-0 flex justify-start items-center whitespace-nowrap">
                        <Label required text="खोदाईचा अंतिम बिंदू" />
                      </div>
                      <Input
                        name="endPoint"
                        value={values.endPoint}
                        onInput={(e) => {
                          if (e.target.value.length > 8) {
                            e.target.value = e.target.value.slice(0, 8);
                          }
                        }}
                        onChange={handleChange}
                        className="w-full h-9"
                        type="number"
                      />
                    </div>
                  </div>
                )}

                {showSMKCStartEnd && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 w-full shrink-0 flex justify-start items-center whitespace-nowrap">
                        <Label required text="खोदाईचा प्रारंभिक बिंदू" />
                      </div>
                      <Input
                        name="vcStartPoint"
                        value={values.vcStartPoint}
                        onInput={(e) => {
                          if (e.target.value.length > 8) {
                            e.target.value = e.target.value.slice(0, 8);
                          }
                        }}
                        onChange={handleChange}
                        className="w-full h-9"
                        type="number"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 w-full shrink-0 flex justify-start items-center whitespace-nowrap">
                        <Label required text="खोदाईचा अंतिम बिंदू" />
                      </div>
                      <Input
                        name="vcEndPoint"
                        value={values.vcEndPoint}
                        onInput={(e) => {
                          if (e.target.value.length > 8) {
                            e.target.value = e.target.value.slice(0, 8);
                          }
                        }}
                        onChange={handleChange}
                        className="w-full h-9"
                        type="number"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 w-full shrink-0 flex justify-start items-center whitespace-nowrap">
                      <Label required text="अक्षांश" />
                    </div>
                    <Input
                      name="latitude"
                      value={values.latitude}
                      onInput={(e) => {
                        if (e.target.value.length > 8) {
                          e.target.value = e.target.value.slice(0, 8);
                        }
                      }}
                      onChange={handleChange}
                      className="w-full h-9"
                      type="number"
                      step="any"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 w-full shrink-0 flex justify-start items-center whitespace-nowrap">
                      <Label required text="रेखांश" />
                    </div>
                    <Input
                      name="longitude"
                      value={values.longitude}
                      onInput={(e) => {
                        if (e.target.value.length > 8) {
                          e.target.value = e.target.value.slice(0, 8);
                        }
                      }}
                      onChange={handleChange}
                      className="w-full h-9"
                      type="number"
                      step="any"
                    />
                  </div>
                </div>

                {showRoadCutType && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-48 w-full shrink-0 flex justify-start items-center whitespace-nowrap">
                      <Label required text="रस्ता खोदाई प्रकार / Road Cutting Type" />
                    </div>
                    <Select
                      value={values.roadCutType}
                      onValueChange={(value) => setFieldValue("roadCutType", value)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="-- Select Road Cutting Type --" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(roadCutTypeList) && roadCutTypeList.length > 0 ? (
                          roadCutTypeList.map((type) => (
                            <SelectItem 
                              key={type.roadCuttingTypeId || Math.random()} 
                              value={String(type.roadCuttingTypeId)}
                            >
                              {type.roadCuttingTypeName || "Unknown"}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="0">No types available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {showRoadCutReason && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-48 w-full shrink-0 flex justify-start items-center whitespace-nowrap">
                      <Label required text="रस्ता खोदाई चे कारण / Reason of Road cutting" />
                    </div>
                    <Input
                      name="roadCutReason"
                      value={values.roadCutReason}
                      onChange={handleChange}
                      className="w-full h-9"
                      type="text"
                      placeholder="Enter reason for road cutting"
                    />
                  </div>
                )}

                <div className="flex justify-center items-center gap-3 pt-4 border-t mt-4">
                  <Button
                    type="submit"
                    className="bg-blue-900 hover:bg-blue-800 text-white"
                    disabled={loading || isSubmitting}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-gray-100 hover:bg-gray-200"
                    onClick={() => handleReset(resetForm)}
                  >
                    Reset
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

export default FrmRoadCutting;