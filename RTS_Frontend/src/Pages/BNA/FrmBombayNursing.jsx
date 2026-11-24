import React, { useMemo, useRef, useState, useEffect } from "react";
import { Formik, Form } from "formik";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

// Oracle returns lowercase aliases (displayname, num_service_serviceid,
// wardname, wardid) but we keep the dual-case helper for safety.
const col = (row, upper, lower) => row?.[upper] ?? row?.[lower] ?? "";

const EMAIL_REGEX = /^([\w.\-]+)@([\w\-]+)((\.(\w){2,3})+)$/;

const initialValues = {
  appliFname: "",
  appliMname: "",
  appliFLname: "",
  appliMobNo: "",
  appliEmailId: "",
  appliAAdNo: "",
  appliPropNo: "",
  appliResNo: "",
  instName: "",
  instAddr: "",
  zoneId: "",
  serviceId: "",
  hospName: "",
  hospMob: "",
  hosEmail: "",
  ptaxno: "Y",
  wtTaxno: "Y",
  firenoc: "P", // Provisional / Final
  nocDoc: "",
  address: "",
};

const FieldRow = ({ label, required, children, colSpan }) => (
  <div
    className={`flex flex-col sm:flex-row sm:items-center gap-2 ${
      colSpan ? `md:col-span-${colSpan}` : ""
    }`}
  >
    <div className="sm:w-44 w-full shrink-0 whitespace-nowrap flex items-center justify-between">
      <Label text={label} required={required} />
      <span className="hidden sm:inline text-gray-500">:</span>
    </div>
    {children}
  </div>
);

const RadioGroup = ({ name, value, options, onChange, disabled }) => (
  <div className="flex items-center gap-6 h-9 flex-wrap">
    {options.map((opt) => (
      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name={name}
          value={opt.value}
          checked={String(value) === String(opt.value)}
          onChange={(e) => onChange(name, e.target.value)}
          disabled={disabled}
          className="h-4 w-4 accent-blue-900"
        />
        <span className="text-sm">{opt.label}</span>
      </label>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

const FrmBombayNursing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const didInit = useRef(false);

  const state = location.state || {};
  const ulbId = Number(
    state.ulbId ?? user?.ulbId ?? sessionStorage.getItem("ulbID")
  );
  const userId = String(
    state.userId ?? user?.userId ?? sessionStorage.getItem("UserUniqueId") ?? ""
  );
  const deptId = state.deptId ?? sessionStorage.getItem("DepartmentId");
  const serviceId = state.serviceId ?? sessionStorage.getItem("ServiceId");
  const corpId = state.corpId ?? user?.corpId ?? sessionStorage.getItem("CorpId");
  const mahaUlbId = sessionStorage.getItem("MAHAULBID");
  const trackId = sessionStorage.getItem("TrackId");
  const ulbDistrict = sessionStorage.getItem("ULBDistrict");
  const userIdMaha = sessionStorage.getItem("UserIDMahaOnline");
  const isChatbot = !!sessionStorage.getItem("Chatbot");

  const appSource = mahaUlbId ? "MAHA" : isChatbot ? "CBOT" : "WEB";

  /* ---------- API setup ---------- */
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const API = `${BASE_URL}/api/BombayNursingAct`; // ✅ matches app.use(...)

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token || localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  const unwrap = (res) => res?.data?.data?.data ?? res?.data?.data ?? [];

  // ✅ POST (controller reads req.body)
  const getServiceList = (ulbID) =>
    axios.post(`${API}/get-service-list`, { ulbID }, { headers: authHeaders });

  // ✅ POST (already correct)
  const getWardList = (ulbID) =>
    axios.post(`${API}/get-ward-list`, { ulbID }, { headers: authHeaders });

  // ✅ Correct route name
  const insertNursingApplication = (payload) =>
    axios.post(`${API}/insert-nursing-application`, payload, {
      headers: authHeaders,
    });

  // MahaOnline follow-up — will need a route on your side if you enable it
  const mahaOnlineInsert = (payload) =>
    axios.post(`${BASE_URL}/api/MahaOnline/insert`, payload, {
      headers: authHeaders,
    });

  /* ---------- state ---------- */
  const [zones, setZones] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageTitle, setPageTitle] = useState("");

  /* ---------- boot ---------- */
  useEffect(() => {
    if (!ulbId || didInit.current) return;
    didInit.current = true;

    if (String(ulbId) === "1670") {
      Swal.fire({
        text: "You are not allowed to apply from this ULB.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (!deptId) {
      Swal.fire({
        text: "Please select a department first.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    loadMasters();
  }, [ulbId, deptId]);

  const loadMasters = async () => {
    try {
      const [wardRes, svcRes] = await Promise.all([
        getWardList(ulbId),
        getServiceList(ulbId),
      ]);

      const wardData = unwrap(wardRes);
      const svcData = unwrap(svcRes);

      setZones(
        String(ulbId) === "2"
          ? wardData.filter((w) => String(col(w, "WARDID", "wardid")) !== "1281")
          : wardData
      );
      setServices(svcData);

      // Title comes from DB (service list returns `displayname`)
      const match = svcData.find(
        (s) =>
          String(col(s, "NUM_SERVICE_SERVICEID", "num_service_serviceid")) ===
          String(serviceId)
      );
      if (match) {
        setPageTitle(col(match, "DISPLAYNAME", "displayname"));
      }
    } catch (err) {
      console.error("Load masters failed:", err);
      Swal.fire({
        text:
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load form data.",
        confirmButtonColor: "#1e3a8a",
      });
    }
  };

  /* ---------- computed initial values ---------- */
  const computedInitialValues = useMemo(() => {
    const serviceInList =
      !serviceId ||
      services.length === 0 ||
      services.some(
        (s) =>
          String(col(s, "NUM_SERVICE_SERVICEID", "num_service_serviceid")) ===
          String(serviceId)
      );
    return {
      ...initialValues,
      serviceId: serviceInList ? String(serviceId || "") : "",
    };
  }, [serviceId, services]);

  /* ---------- validation (mirrors service-level checks) ---------- */
  const validateFields = (values) => {
    const fail = (msg) => {
      Swal.fire({ text: msg, confirmButtonColor: "#1e3a8a" });
      return false;
    };

    if (!values.zoneId || values.zoneId === "0")
      return fail("Please Select valid Zone from the list");
    if (!values.serviceId || values.serviceId === "0")
      return fail("Please Select Service Type");

    if (!values.appliFname?.trim()) return fail("Please Enter First Name");
    if (!values.appliMname?.trim()) return fail("Please Enter Middle Name");
    if (!values.appliFLname?.trim()) return fail("Please Enter Last Name");

    if (!values.appliMobNo?.trim()) return fail("Please Enter Mobile Number");
    if (!/^\d{10}$/.test(values.appliMobNo.trim()))
      return fail("Invalid Mobile No.");

    if (!values.appliEmailId?.trim())
      return fail("Please Enter Email Address");
    if (!EMAIL_REGEX.test(values.appliEmailId))
      return fail("Invalid Email Address");

    if (!values.appliAAdNo?.trim())
      return fail("Please Enter Adhar Card Number");
    if (!values.appliPropNo?.trim())
      return fail("Please Enter Property Number");
    if (!values.appliResNo?.trim())
      return fail("Please Enter Residential Number");

    if (!values.hospName?.trim()) return fail("Please Enter Hospital Name");

    if (!values.hospMob?.trim()) return fail("Please Enter Mobile Number");
    if (!/^\d{10}$/.test(values.hospMob.trim()))
      return fail("Invalid Mobile No.");

    if (!values.hosEmail?.trim()) return fail("Please Enter Email Address");
    if (!EMAIL_REGEX.test(values.hosEmail)) return fail("Invalid Email Address");

    if (!values.nocDoc?.trim()) return fail("Please Enter Document Number");
    if (!values.address?.trim()) return fail("Please Enter Address");

    return true;
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (!validateFields(values)) return;

    setLoading(true);
    Swal.fire({
      text: "Submitting Application...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // ✅ Field names match controller destructuring exactly
      const payload = {
        userId,
        ulbID: ulbId,
        servId: Number(values.serviceId),
        appliFName: values.appliFname.trim(),
        appliMName: values.appliMname.trim(),
        appliLName: values.appliFLname.trim(),
        appliMobNo: values.appliMobNo.trim(),
        appliEmailId: values.appliEmailId.trim(),
        appliAadNo: values.appliAAdNo.trim(),
        appliPropNo: values.appliPropNo.trim(),
        appliResNo: values.appliResNo.trim(),
        instName: values.instName.trim(),
        instAddr: values.instAddr.trim(),
        zoneId: Number(values.zoneId),
        hospName: values.hospName.trim(),
        hospMob: values.hospMob.trim(),
        hosEmail: values.hosEmail.trim(),
        ptaxno: values.ptaxno,
        wtTaxno: values.wtTaxno,
        firenoc: values.firenoc,
        nocDoc: values.nocDoc.trim(),
        address: values.address.trim(),
        appSource,
      };

      const res = await insertNursingApplication(payload);

      // Backend: ok(res, { appNo, errorCode }, message)
      // → res.data = { status, message, data: { appNo, errorCode } }
      const appNo = res?.data?.data?.appNo ?? "";
      const errorCode = Number(res?.data?.data?.errorCode);
      const message = res?.data?.message ?? "";

      if (errorCode === 9999 && mahaUlbId) {
        try {
          await mahaOnlineInsert({
            ulbId,
            corpId: Number(corpId),
            trackId,
            serviceId: Number(serviceId),
            appNo,
            userIdMahaOnline: userIdMaha,
            mahaUlbId: Number(mahaUlbId),
            ulbDistrict: Number(ulbDistrict),
          });
        } catch (mahaErr) {
          console.error("MahaOnline insert failed:", mahaErr);
        }
      }

      Swal.close();

      if (errorCode === 9999) {
        Swal.fire({
          icon: "success",
          text: message || `Application submitted successfully. App No: ${appNo}`,
          confirmButtonColor: "#1e3a8a",
        }).then((r) => {
          if (r.isConfirmed) {
            navigate("/Step1", {
              state: {
                ...state,
                ...values,
                appNo,
                serviceId,
                ulbId,
                userId,
                corpId,
              },
            });
          }
        });
      } else {
        // Backend returns 200 with success:false for business errors,
        // so this branch fires when the stored proc returned errcode != 9999.
        Swal.fire({
          icon: "error",
          text: message || "Unable to save application.",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: "error",
        text:
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Error submitting application.",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  /* ---------- reset ---------- */
  const handleReset = (resetForm) => {
    Swal.fire({
      text: "Want to Reset?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#1e3a8a",
    }).then((r) => r.isConfirmed && resetForm());
  };

  /* ---------- render (unchanged from your version) ---------- */
  return (
    <Formik
      initialValues={computedInitialValues}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ values, handleChange, setFieldValue, isSubmitting, resetForm }) => {
        const serviceLocked = !!serviceId;

        return (
          <Form>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg font-semibold">
                    {pageTitle}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-4">
                  {/* Zone + Service */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldRow label="Zone Id" required>
                      <Select
                        value={values.zoneId}
                        onValueChange={(v) => setFieldValue("zoneId", v)}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="-- Select Zone --" />
                        </SelectTrigger>
                        <SelectContent>
                          {zones.length > 0 ? (
                            zones.map((z) => {
                              const id = col(z, "WARDID", "wardid");
                              const nm = col(z, "WARDNAME", "wardname");
                              return (
                                <SelectItem key={id} value={String(id)}>
                                  {nm}
                                </SelectItem>
                              );
                            })
                          ) : (
                            <SelectItem value="0">No Zone available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FieldRow>

                    <FieldRow label="NOC Type" required>
                      <Select
                        value={values.serviceId}
                        onValueChange={(v) => setFieldValue("serviceId", v)}
                        disabled={serviceLocked}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="-- Select Service --" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.length > 0 ? (
                            services.map((s) => {
                              const id = col(
                                s,
                                "NUM_SERVICE_SERVICEID",
                                "num_service_serviceid"
                              );
                              const nm = col(s, "DISPLAYNAME", "displayname");
                              return (
                                <SelectItem key={id} value={String(id)}>
                                  {nm}
                                </SelectItem>
                              );
                            })
                          ) : (
                            <SelectItem value="0">
                              No services available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FieldRow>
                  </div>

                  <div className="my-2 border-t" />

                  {/* Applicant Name */}
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:col-span-2">
                      <div className="sm:w-44 shrink-0 whitespace-nowrap">
                        <Label text="Applicant Name" required />
                      </div>
                      <Input
                        name="appliFname"
                        placeholder="First Name"
                        value={values.appliFname}
                        onChange={handleChange}
                        className="w-full h-9"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        name="appliMname"
                        placeholder="Middle Name"
                        value={values.appliMname}
                        onChange={handleChange}
                        className="w-full h-9"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        name="appliFLname"
                        placeholder="Last Name"
                        value={values.appliFLname}
                        onChange={handleChange}
                        className="w-full h-9"
                      />
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldRow label="Mobile Number" required>
                      <Input
                        name="appliMobNo"
                        maxLength={10}
                        inputMode="numeric"
                        value={values.appliMobNo}
                        onChange={(e) =>
                          setFieldValue(
                            "appliMobNo",
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                        className="w-full h-9"
                      />
                    </FieldRow>
                    <FieldRow label="Email Id" required>
                      <Input
                        type="email"
                        name="appliEmailId"
                        maxLength={50}
                        value={values.appliEmailId}
                        onChange={handleChange}
                        className="w-full h-9"
                      />
                    </FieldRow>
                    <FieldRow label="Aadhar Number" required>
                      <Input
                        name="appliAAdNo"
                        maxLength={12}
                        inputMode="numeric"
                        value={values.appliAAdNo}
                        onChange={(e) =>
                          setFieldValue(
                            "appliAAdNo",
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                        className="w-full h-9"
                      />
                    </FieldRow>
                    <FieldRow label="Property Number" required>
                      <Input
                        name="appliPropNo"
                        value={values.appliPropNo}
                        onChange={handleChange}
                        className="w-full h-9"
                      />
                    </FieldRow>
                    <FieldRow label="Residential Number" required>
                      <Input
                        name="appliResNo"
                        value={values.appliResNo}
                        onChange={handleChange}
                        className="w-full h-9"
                      />
                    </FieldRow>
                  </div>

                  {/* Institute */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldRow label="Name of Institution">
                      <Input
                        name="instName"
                        value={values.instName}
                        onChange={handleChange}
                        className="w-full h-9"
                      />
                    </FieldRow>
                    <FieldRow label="Institute Address">
                      <Input
                        name="instAddr"
                        value={values.instAddr}
                        onChange={handleChange}
                        className="w-full h-9"
                      />
                    </FieldRow>
                  </div>

                  {/* Hospital details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldRow label="Hospital Name" required>
                      <Input
                        name="hospName"
                        value={values.hospName}
                        onChange={handleChange}
                        className="w-full h-9"
                      />
                    </FieldRow>
                    <FieldRow label="Mobile Number" required>
                      <Input
                        name="hospMob"
                        maxLength={10}
                        inputMode="numeric"
                        value={values.hospMob}
                        onChange={(e) =>
                          setFieldValue(
                            "hospMob",
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                        className="w-full h-9"
                      />
                    </FieldRow>
                    <FieldRow label="Hospital Email" required>
                      <Input
                        type="email"
                        name="hosEmail"
                        value={values.hosEmail}
                        onChange={handleChange}
                        className="w-full h-9"
                      />
                    </FieldRow>
                  </div>

                  <div className="my-2 border-t" />

                  {/* Yes/No + Provisional/Final Radio groups */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldRow label="Property Tax Number">
                      <RadioGroup
                        name="ptaxno"
                        value={values.ptaxno}
                        onChange={setFieldValue}
                        options={[
                          { value: "Y", label: "Yes" },
                          { value: "N", label: "No" },
                        ]}
                      />
                    </FieldRow>

                    <FieldRow label="Water Connection Number">
                      <RadioGroup
                        name="wtTaxno"
                        value={values.wtTaxno}
                        onChange={setFieldValue}
                        options={[
                          { value: "Y", label: "Yes" },
                          { value: "N", label: "No" },
                        ]}
                      />
                    </FieldRow>

                    <FieldRow label="Fire NOC">
                      <RadioGroup
                        name="firenoc"
                        value={values.firenoc}
                        onChange={setFieldValue}
                        options={[
                          { value: "P", label: "Provisional" },
                          { value: "F", label: "Final" },
                        ]}
                      />
                    </FieldRow>

                    <FieldRow label="NOC Document Number" required>
                      <Input
                        name="nocDoc"
                        value={values.nocDoc}
                        onChange={handleChange}
                        className="w-full h-9"
                      />
                    </FieldRow>

                    <FieldRow label="Hospital Address" required colSpan={2}>
                      <Textarea
                        name="address"
                        value={values.address}
                        onChange={handleChange}
                        className="min-h-16 w-full"
                      />
                    </FieldRow>
                  </div>

                  {/* Buttons */}
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
        );
      }}
    </Formik>
  );
};

export default FrmBombayNursing;