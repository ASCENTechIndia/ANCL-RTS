import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, FormikProvider, useFormik } from "formik";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ShadCNTable from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const BND_SERVICES = [14, 15, 342, 343];
const FIRE_SERVICES = [12, 13, 553];
const IMC_ULBS = [590, 670];
const HOARDING_ULBS = [870, 1690];
const MANUAL_BND_ULBS = [2, 1750, 1670, 1630, 1850, 1610, 1890];

const emptyValues = {
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
    zoneId: "",
    wardNo: "",
    propertyNo: "",
    propertyUsage: "",
    sellerName: "",
    transferToWhom: "",
    agreementDate: "",
    waterSewerageTypeId: "",
    nocPurposeId: "",
    villageId: "",
    citySurveyNo: "",
    gatNo: "",
    plotNo: "",
    partPlanSize: "",
    tpScheme: "",
    sanctionedDP: "0",
    ep: "0",
    draftDP: "0",
    hoardingPlaceId: "",
    hoardingTypeId: "",
    advertisementDetails: "",
    hoardingSize: "",
    registrationNo: "",
    bndName: "",
    gender: "",
    bndDate: "",
    motherName: "",
    fatherName: "",
    noOfCopies: "",
    certificateType: "",
    connectionNo: "",
};

const FrmStep0 = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const state = location.state || {};

    const ulbId = Number(state.ulbId ?? user?.ulbId ?? user?.ulbid ?? 0);
    const serviceId = Number(state.serviceId ?? state.serviceID ?? user?.serviceId ?? 0);
    const userId = state.userId ?? user?.userId ?? user?.userid ?? user?.userUniqueId ?? "";
    const corpId = state.corpId ?? state.corporationId ?? user?.corpId ?? user?.corpID ?? "";
    const departmentId = Number(state.departmentId ?? user?.departmentId ?? 0);
    const serviceName = state.serviceName ?? state.service ?? "Application";

    const [zones, setZones] = useState([]);
    const [villages, setVillages] = useState([]);
    const [nocPurposes, setNocPurposes] = useState([]);
    const [hoardingPlaces, setHoardingPlaces] = useState([]);
    const [hoardingTypes, setHoardingTypes] = useState([]);
    const [waterSewerageTypes, setWaterSewerageTypes] = useState([]);
    const [bndRows, setBndRows] = useState([]);
    const [bndSearched, setBndSearched] = useState(false);
    const [selectedBnd, setSelectedBnd] = useState(null);
    const [waterConnection, setWaterConnection] = useState(null);
    const [loading, setLoading] = useState({});
    const [mode, setMode] = useState(1);
    const [prefillLoaded, setPrefillLoaded] = useState(false);

    const isBnd = BND_SERVICES.includes(serviceId);
    const isBirth = [14, 342].includes(serviceId);
    const isFire = FIRE_SERVICES.includes(serviceId);
    const isImc = IMC_ULBS.includes(ulbId);
    const isHoarding = HOARDING_ULBS.includes(ulbId) && serviceId === 433;
    const showWaterSearch = departmentId === 24 && (ulbId === 1630 || (HOARDING_ULBS.includes(ulbId) && serviceId === 573));
    const showPropertyNo = serviceId === 2;
    const showSewerage = serviceId === 16;
    const showBndManual = isBnd && bndSearched && bndRows.length === 0 && MANUAL_BND_ULBS.includes(ulbId);
    const showCertificateType = [14, 15].includes(serviceId) && ulbId === 2;

    const formik = useFormik({
        initialValues: emptyValues,
        enableReinitialize: false,
        validate: (values) => {
            const errors = {};
            if (!(isImc && [7, 8, 580, 620].includes(serviceId)) && !String(values.zoneId ?? "").trim()) errors.zoneId = "Zone is required";
            if (!String(values.firstName ?? "").trim()) errors.firstName = "First name is required";
            if (!String(values.middleName ?? "").trim()) errors.middleName = "Middle name is required";
            if (!String(values.lastName ?? "").trim()) errors.lastName = "Last name is required";
            if (!String(values.firstNameMarathi ?? "").trim()) errors.firstNameMarathi = "First name in Marathi is required";
            if (!String(values.middleNameMarathi ?? "").trim()) errors.middleNameMarathi = "Middle name in Marathi is required";
            if (!String(values.lastNameMarathi ?? "").trim()) errors.lastNameMarathi = "Last name in Marathi is required";
            if (!String(values.mobileNo ?? "").trim()) errors.mobileNo = "Mobile number is required";
            if (!/^\d{10}$/.test(values.mobileNo)) errors.mobileNo = "Enter a valid 10-digit mobile number";
            if (isBnd && !selectedBnd && !String(values.registrationNo ?? "").trim()) errors.registrationNo = "Registration number is required";
            if ([14, 15].includes(serviceId) && ulbId !== 2 && !String(values.email ?? "").trim()) errors.email = "Email is required";
            if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) errors.email = "Enter a valid email address";
            if (!String(values.address ?? "").trim()) errors.address = "Address is required";
            if (!String(values.addressMarathi ?? "").trim()) errors.addressMarathi = "Address in Marathi is required";
            if (!String(values.purpose ?? "").trim()) errors.purpose = "Purpose is required";
            if (!String(values.purposeMarathi ?? "").trim()) errors.purposeMarathi = "Purpose in Marathi is required";
            if (showPropertyNo && !String(values.propertyNo ?? "").trim()) errors.propertyNo = "Property number is required";
            if (showSewerage && !String(values.waterSewerageTypeId ?? "").trim()) errors.waterSewerageTypeId = "Water/sewerage type is required";
            if (isFire && !String(values.nocPurposeId ?? "").trim()) errors.nocPurposeId = "NOC purpose is required";
            if (isHoarding) {
                if (!String(values.hoardingPlaceId ?? "").trim()) errors.hoardingPlaceId = "Hoarding place is required";
                if (!String(values.advertisementDetails ?? "").trim()) errors.advertisementDetails = "Advertisement details is required";
                if (!String(values.hoardingTypeId ?? "").trim()) errors.hoardingTypeId = "Hoarding type is required";
                if (!String(values.hoardingSize ?? "").trim()) errors.hoardingSize = "Hoarding size is required";
            }
            if (isImc && [7, 8].includes(serviceId)) {
                if (["1", "2", "3"].includes(String(values.villageId))) {
                    if (!String(values.citySurveyNo ?? "").trim()) errors.citySurveyNo = "City Survey number is required";
                    if (!String(values.gatNo ?? "").trim()) errors.gatNo = "Gat number is required";
                } else if (!String(values.plotNo ?? "").trim()) errors.plotNo = "Final Plot number is required";
                if (serviceId === 8 && !String(values.partPlanSize ?? "").trim()) errors.partPlanSize = "Size of part plan is required";
                if (values.sanctionedDP === "0" && values.ep === "0" && values.draftDP === "0") {
                    errors.sanctionedDP = "Select at least one type of part plan";
                }
            }
            if (showCertificateType && !String(values.certificateType ?? "").trim()) errors.certificateType = "Certificate type is required";
            if (showBndManual) {
                if (!String(values.bndName ?? "").trim()) errors.bndName = `${isBirth ? "Child name" : "Name of deceased"} is required`;
                if (!String(values.gender ?? "").trim()) errors.gender = "Gender is required";
                if (!String(values.motherName ?? "").trim()) errors.motherName = "Mother name is required";
                if (!String(values.fatherName ?? "").trim()) errors.fatherName = "Father name is required";
                if (!String(values.bndDate ?? "").trim()) errors.bndDate = `${isBirth ? "Birth date" : "Death date"} is required`;
                if (ulbId === 2 && [14, 15].includes(serviceId) && !String(values.noOfCopies ?? "").trim()) errors.noOfCopies = "Number of copies is required";
            }
            return errors;
        },
        onSubmit: async (values) => {
            if (isBnd && bndRows.length && !selectedBnd) {
                await Swal.fire({ text: "Please select one Birth/Death record from the search results." });
                return;
            }
            if (showWaterSearch && !waterConnection) {
                await Swal.fire({ text: "Search and verify the water connection before submitting." });
                return;
            }

            setLoading((prev) => ({ ...prev, submit: true }));
            const baseUrl = import.meta.env.VITE_BASE_URL;
            const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
            const userUniqueId = state.userUniqueId ?? user?.userUniqueId ?? user?.uniqueId ?? userId;
            const appSource = state.appSource || (state.mahaUlbId ? "MAHA" : state.chatbot ? "CBOT" : "WEB");
            const str = (value) => value === null || value === undefined ? "" : String(value);
            const readResult = (response) => {
                const data = response?.data;
                return data?.data?.data && !Array.isArray(data.data.data)
                    ? data.data.data
                    : data?.data && !Array.isArray(data.data) ? data.data : data?.data?.[0] || data?.data || data || {};
            };
            const ensureSuccess = (response, label) => {
                const result = readResult(response);
                const binds = result?.outBinds || result?.outbinds || {};

                const code = Number(result?.out_errcode ?? result?.out_ErrorCode ?? result?.out_Errorcode ?? result?.errorCode ?? result?.errcode ?? binds?.out_errcode ?? binds?.out_ErrorCode ?? binds?.out_Errorcode ?? binds?.OUT_ERRORCODE);

                if (response?.data?.ok === false || result?.success === false || (Number.isFinite(code) && code !== 9999)) {
                    throw new Error(result?.out_ErrMsg || result?.out_ErrorMsg || binds?.out_ErrMsg || binds?.OUT_ERRORMSG || result?.message || response?.data?.message || `${label} failed.`);
                }
                return result;
            };

            try {
                const isBndInsert = [14, 15].includes(serviceId);
                const isWaterApplicantInsert = departmentId === 24 && (
                    ulbId === 1630 || (HOARDING_ULBS.includes(ulbId) && serviceId === 573)
                );
                const isKarjatModule = [1890, 1150].includes(ulbId) && [23, 26, 27, 28, 29, 30, 66].includes(serviceId);
                const isStandardModule = [590, 591, 1630].includes(ulbId);
                const isPropertyModule = departmentId === 7 && isStandardModule;
                const isWaterModule = departmentId === 24 && isStandardModule;
                const isImcPlan = isImc && [7, 8].includes(serviceId);

                // The supplied routes do not include the separate .NET hoarding insert.
                // Stop before creating an applicant record that would remain incomplete.
                if (isHoarding) {
                    throw new Error("Hoarding service requires its separate hoarding insert API. That endpoint is not present in the supplied routes.");
                }

                const selectedRegistrationNo = selectedBnd?.regno ?? selectedBnd?.REGNO ?? selectedBnd?.registrationNo ?? selectedBnd?.RegistrationNo ?? values.registrationNo;
                const selectedUniqueNo = selectedBnd?.uniqueNo ?? selectedBnd?.UniqueNo ?? selectedBnd?.uniqueno ?? selectedBnd?.UNIQUENO ?? null;
                const connection = waterConnection || {};
                const applicantPayload = {
                    ...values,
                    ulbId,
                    corpId,
                    serviceId,
                    userId,
                    userUniqueId,
                    mode,
                    departmentId,
                    appSource,
                    selectedBndRecord: selectedBnd,
                    bndRegistrationNo: selectedRegistrationNo,
                    bndUniqueNo: isImc ? values.plotNo : selectedUniqueNo,
                    sellerName: isImc ? values.citySurveyNo : values.sellerName,
                    transferToWhom: isImc ? values.gatNo : values.transferToWhom,
                    tpScheme: values.tpScheme,
                    bndName: selectedBnd ? "" : values.bndName,
                    bndGender: selectedBnd ? "" : values.gender,
                    bndDate: selectedBnd ? null : values.bndDate,
                    bndMotherName: selectedBnd ? "" : values.motherName,
                    bndFatherName: selectedBnd ? "" : values.fatherName,
                    bndRegNo: selectedRegistrationNo,
                    bndREGNO: selectedRegistrationNo,
                    bndNAME: selectedBnd ? "" : values.bndName,
                    bndGENDER: selectedBnd ? "" : values.gender,
                    bndDATE: selectedBnd ? null : values.bndDate,
                    bndMNAME: selectedBnd ? "" : values.motherName,
                    bndFNAME: selectedBnd ? "" : values.fatherName,
                    CERTISSUETYPE: values.certificateType,
                    certificateType: values.certificateType,
                    bndNoOfCopies: values.noOfCopies,
                    waterConnection: connection,
                    connectionNo: connection.connectionNo ?? connection.CONNNO ?? connection.connno ?? connection.var_wtreg_consno ?? values.connectionNo,
                    usageType: connection.usageType ?? connection.USAGETYPE ?? connection.usagetype ?? connection.var_usagetype_name ?? "",
                    connectionSize: connection.connectionSize ?? connection.CONNSIZE ?? connection.consize ?? connection.num_connsize_size ?? "",
                    builtUpArea: connection.builtUpArea ?? connection.BUILTUPAREA ?? connection.buldupare ?? connection.var_wtregister_curconsizesrch ?? "",
                    waterOwnerName: connection.ownerName ?? connection.OWNERNAME ?? connection.wtrownrname ?? connection.var_wtregister_appliname ?? "",
                    waterAddress: connection.address ?? connection.ADDRESS ?? connection.wtradress ?? connection.var_wtregister_conaddresssrch ?? "",
                    waterSewerageTypeId: values.waterSewerageTypeId,
                    nocPurposeId: values.nocPurposeId,
                    hoardingPlaceId: values.hoardingPlaceId,
                    advertisementDetails: values.advertisementDetails,
                    hoardingTypeId: values.hoardingTypeId,
                    hoardingSize: values.hoardingSize,
                    zoneId: isImc && [7, 8].includes(serviceId) ? 1282 : values.zoneId,
                    insertType: isBndInsert ? "BND" : isWaterApplicantInsert ? "WATER" : "APPLICANT",
                    insertProcedure: isBndInsert ? "aorts_bndapplicant_ins" : isWaterApplicantInsert ? "aorts_applicant_info_wtr_ins" : "aorts_applicant_info_ins",
                    in_conno: connection.connectionNo ?? connection.CONNNO ?? connection.connno ?? connection.var_wtreg_consno ?? values.connectionNo ?? "",
                    in_usagetyp: connection.usageType ?? connection.USAGETYPE ?? connection.usagetype ?? connection.var_usagetype_name ?? "",
                    in_consize: connection.connectionSize ?? connection.CONNSIZE ?? connection.consize ?? connection.num_connsize_size ?? "",
                    in_buiduparea: connection.builtUpArea ?? connection.BUILTUPAREA ?? connection.buldupare ?? "",
                    in_wtrownrname: connection.ownerName ?? connection.OWNERNAME ?? connection.wtrownrname ?? connection.var_wtregister_appliname ?? "",
                    in_wtraddress: connection.address ?? connection.ADDRESS ?? connection.wtradress ?? connection.var_wtregister_conaddresssrch ?? "",
                };

                // Exactly one applicant procedure is called for the current service.
                const basePath = isBndInsert ? "submit-bnd-applicant-info" : isWaterApplicantInsert ? "submit-water-applicant-info" : "submit-applicant-info";

                const baseResponse = await axios.post(`${baseUrl}/api/Step0/${basePath}`, applicantPayload, { headers });
                const baseResult = ensureSuccess(baseResponse, "Applicant insertion");
                const appNo = baseResult?.appNo ?? baseResult?.out_AppNo ?? baseResult?.out_applino ?? baseResult?.applicationNo ?? baseResult?.out_AppliNo ?? baseResult?.out_str ?? baseResult?.outBinds?.out_AppNo ?? baseResult?.outBinds?.OUT_APPNO ?? baseResult?.outBinds?.out_str ?? baseResult?.outbinds?.out_AppNo;

                if (!appNo) {
                    throw new Error("Applicant procedure succeeded but did not return the application number.");
                }

                // IMC is a SECOND procedure. Applicant information is inserted first.
                if (isImcPlan) {
                    const imcResponse = await axios.post(
                        `${baseUrl}/api/Step0/submit-imc-application`,
                        {
                            userId: userUniqueId,
                            serviceId,
                            orgId: corpId,
                            applicationNo: appNo,
                            partPlanSize: values.partPlanSize,
                            tpScheme: values.tpScheme,
                            village: values.villageId,
                            sanctionedDP: values.sanctionedDP,
                            ep: values.ep,
                            draftDP: values.draftDP,
                            rdbPartSize: values.partPlanSize,
                            mode,
                        },
                        { headers }
                    );
                    ensureSuccess(imcResponse, "IMC application insertion");
                }

                const propertyAppliData = [
                    userUniqueId,                         // 1 UserId
                    (isImcPlan ? 1282 : values.zoneId),   // 2 Zone / ward reference
                    serviceId,                            // 3 ServiceId
                    ulbId,                                // 4 ULBId
                    corpId || "10001",                    // 5 CorporationId
                    values.firstName,                     // 6 First name
                    values.firstNameMarathi,              // 7 Marathi first name
                    values.middleName,                    // 8 Middle name
                    values.middleNameMarathi,             // 9 Marathi middle name
                    values.lastName,                      // 10 Last name
                    values.lastNameMarathi,               // 11 Marathi last name
                    values.mobileNo,                      // 12 Mobile
                    values.aadharNo,                      // 13 Aadhaar
                    values.email,                         // 14 Email
                    values.address,                       // 15 Address
                    values.addressMarathi,                // 16 Marathi address
                    values.purpose,                       // 17 Purpose
                    values.purposeMarathi,                // 18 Marathi purpose
                    (isImcPlan ? 1282 : values.zoneId),   // 19 Zone
                    0,                                    // 20 Ward number (legacy procedure payload)
                    values.propertyNo,                    // 21 Property number
                    values.propertyUsage,                 // 22 Property usage
                    values.sellerName,                    // 23 Seller
                    values.transferToWhom,                // 24 Transfer to
                    values.agreementDate,                 // 25 Agreement date
                    appNo,                                // 26 Application number
                    values.waterSewerageTypeId,           // 27 Water/sewerage type
                    values.nocPurposeId,                  // 28 Fire NOC purpose
                    selectedRegistrationNo,               // 29 Registration number
                    selectedUniqueNo,                     // 30 Unique number
                    appSource,                            // 31 Application source
                    "",                                   // 32 Delivery status
                ].map(str).join("~");

                // Department 7 ModuleInsert -> prop.aoms_RTSAppliDetails_ins.
                if (isPropertyModule) {
                    const propertyResponse = await axios.post(`${baseUrl}/api/Step0/insert-property-application-details`,
                        {
                            userId: userUniqueId,
                            appliFlag: "AppliEntry",
                            appliData: propertyAppliData,
                        },
                        { headers }
                    );
                    ensureSuccess(propertyResponse, "Property module insertion");
                }

                // Department 24 .NET WaterModuleInsert -> water.aoms_RTSAppliDetails_ins.
                if (isWaterModule) {
                    const connectionNo = connection.connectionNo ?? connection.CONNNO ?? connection.connno ?? connection.var_wtreg_consno ?? values.connectionNo;

                    const usageType = connection.usageType ?? connection.USAGETYPE ?? connection.usagetype ?? connection.var_usagetype_name ?? "";

                    const connectionSize = connection.connectionSize ?? connection.CONNSIZE ?? connection.consize ?? connection.num_connsize_size ?? "";

                    const builtUpArea = connection.builtUpArea ?? connection.BUILTUPAREA ?? connection.buldupare ?? connection.var_wtregister_curconsizesrch ?? "";

                    const ownerName = connection.ownerName ?? connection.OWNERNAME ?? connection.wtrownrname ?? connection.var_wtregister_appliname ?? "";

                    const waterAddress = connection.address ?? connection.ADDRESS ?? connection.wtradress ?? connection.var_wtregister_conaddresssrch ?? "";

                    const appliDtlsData = [serviceId, ulbId, connectionNo, usageType, connectionSize, builtUpArea, ownerName, waterAddress, userUniqueId].map(str).join("~");

                    const moduleResponse = await axios.post(
                        `${baseUrl}/api/FrmWaterAppliEntry/submit-rts-application-details`,
                        {
                            userId: userUniqueId,
                            appliFlag: "AppliEntry",
                            appliData: propertyAppliData,
                            appliDtlsData,
                        },
                        { headers }
                    );
                    ensureSuccess(moduleResponse, "Water module insertion");
                }

                // Karjat water ModuleInsertKarjatwater -> water.aowt_AppliEnrty_karjat_ins.
                if (isKarjatModule) {
                    const karjatAppliData = [
                        corpId, serviceId, appNo, userUniqueId,
                        values.firstName, values.firstNameMarathi,
                        values.middleName, values.middleNameMarathi,
                        values.lastName, values.lastNameMarathi,
                        values.mobileNo, values.aadharNo, values.email,
                        values.address, values.addressMarathi,
                        values.purpose, values.purposeMarathi,
                        values.zoneId, "", values.propertyNo, "", "", "", "",
                        appNo, values.waterSewerageTypeId || "", values.nocPurposeId || "",
                        "", "", ulbId, appSource, "N",
                    ].map(str).join("~");

                    const moduleResponse = await axios.post(
                        `${baseUrl}/api/FrmWaterAppliEntry/submit-karjat-water-application`,
                        {
                            userId: userUniqueId,
                            appliFlag: "AppliEntry",
                            appliData: karjatAppliData,
                            appliDtlsData: " ",
                        },
                        { headers }
                    );
                    ensureSuccess(moduleResponse, "Karjat water module insertion");
                }

                await Swal.fire({
                    // icon: "success",
                    // title: "Application submitted",
                    text: `${baseResult?.message || baseResult?.out_ErrMsg || "Applicant information saved successfully."} Application No: ${appNo}`,
                    confirmButtonColor: "#083c76",
                });
                if (state.returnTo) navigate(state.returnTo, { state: { appNo, serviceId, ulbId } });
                else navigate("/app/FrmTrackApplication", { state: { appNo, serviceId, ulbId, userId } });
            } catch (error) {
                console.error("Step0 submit error:", error?.response?.data || error);
                Swal.fire({ text: error?.response?.data?.data?.message || error?.response?.data?.message || error.message || "Unable to submit application." });
            } finally {
                setLoading((prev) => ({ ...prev, submit: false }));
            }
        },
    });

    useEffect(() => {
        if (!token || !ulbId || !serviceId) return;
        const common = { ulbId, serviceId, corpId, userId };
        if (!isImc) {
            setLoading((prev) => ({ ...prev, zones: true }));
            axios.post(`${import.meta.env.VITE_BASE_URL}/api/Step0/zones`, common, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } })
                .then((response) => {
                    const rows = response?.data?.data?.data || response?.data?.data?.rows || response?.data?.data || response?.data?.rows || response?.data || [];
                    setZones((Array.isArray(rows) ? rows : []).map((r) => ({
                        value: String(r?.WARDID ?? r?.wardid ?? r?.ZONEID ?? r?.zoneid ?? r?.NUM_ZONE_ID ?? r?.id ?? ""),
                        label: String(r?.WARDNAME ?? r?.wardname ?? r?.ZONENAME ?? r?.zonename ?? r?.VAR_ZONE_NAME ?? r?.name ?? ""),
                    })).filter((r) => r.value && r.label));
                }).catch((error) => { console.error("Step0 zones error:", error?.response?.data || error); setZones([]); })
                .finally(() => setLoading((prev) => ({ ...prev, zones: false })));
        }

        if (isImc && [7, 8].includes(serviceId)) {
            setLoading((prev) => ({ ...prev, villages: true }));
            axios.post(`${import.meta.env.VITE_BASE_URL}/api/Step0/villages`, common, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } })
                .then((response) => {
                    const rows = response?.data?.data?.data || response?.data?.data?.rows || response?.data?.data || response?.data?.rows || response?.data || [];
                    setVillages((Array.isArray(rows) ? rows : []).map((r) => ({
                        value: String(r?.NUM_VILLAGE_UNIQUEID ?? r?.num_village_uniqueid ?? r?.villageId ?? r?.id ?? ""),
                        label: String(r?.VAR_VILLAGE_NAME ?? r?.var_village_name ?? r?.villageName ?? r?.name ?? ""),
                    })).filter((r) => r.value && r.label));
                }).catch((error) => { console.error("Step0 villages error:", error?.response?.data || error); setVillages([]); })
                .finally(() => setLoading((prev) => ({ ...prev, villages: false })));
        }

        if (isFire) {
            setLoading((prev) => ({ ...prev, noc: true }));
            axios.post(`${import.meta.env.VITE_BASE_URL}/api/Step0/noc-purposes`, common, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } })
                .then((response) => {
                    const rows = response?.data?.data?.data || response?.data?.data?.rows || response?.data?.data || response?.data?.rows || response?.data || [];
                    setNocPurposes((Array.isArray(rows) ? rows : []).map((r) => ({
                        value: String(r?.VAR_NOCPURPOSE_ID ?? r?.var_nocpurpose_id ?? r?.NUM_NOCPURPOSE_ID ?? r?.id ?? ""),
                        label: String(r?.VAR_NOCPURPOSE_NAME ?? r?.var_nocpurpose_name ?? r?.name ?? ""),
                    })).filter((r) => r.value && r.label));
                }).catch((error) => { console.error("Step0 noc-purposes error:", error?.response?.data || error); setNocPurposes([]); })
                .finally(() => setLoading((prev) => ({ ...prev, noc: false })));
        }

        if (isHoarding) {
            setLoading((prev) => ({ ...prev, hoardingPlaces: true }));
            axios.post(`${import.meta.env.VITE_BASE_URL}/api/Step0/hoarding-places`, common, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } })
                .then((response) => {
                    const rows = response?.data?.data?.data || response?.data?.data?.rows || response?.data?.data || response?.data?.rows || response?.data || [];
                    setHoardingPlaces((Array.isArray(rows) ? rows : []).map((r) => ({
                        value: String(r?.id ?? r?.NUM_PLACE_ID ?? r?.num_place_id ?? r?.num_hoardingplace_id ?? ""),
                        label: String(r?.name ?? r?.VAR_PLACE_NAME ?? r?.var_place_name ?? r?.var_hoardingplace_name ?? ""),
                    })).filter((r) => r.value && r.label));
                }).catch((error) => { console.error("Step0 hoarding-places error:", error?.response?.data || error); setHoardingPlaces([]); })
                .finally(() => setLoading((prev) => ({ ...prev, hoardingPlaces: false })));

            setLoading((prev) => ({ ...prev, hoardingTypes: true }));
            axios.post(`${import.meta.env.VITE_BASE_URL}/api/Step0/hoarding-types`, common, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } })
                .then((response) => {
                    const rows = response?.data?.data?.data || response?.data?.data?.rows || response?.data?.data || response?.data?.rows || response?.data || [];
                    setHoardingTypes((Array.isArray(rows) ? rows : []).map((r) => ({
                        value: String(r?.id ?? r?.NUM_TYPE_ID ?? r?.num_type_id ?? r?.num_hoardingtype_id ?? ""),
                        label: String(r?.name ?? r?.VAR_TYPE_NAME ?? r?.var_type_name ?? r?.var_hoardingtype_name ?? ""),
                    })).filter((r) => r.value && r.label));
                }).catch((error) => { console.error("Step0 hoarding-types error:", error?.response?.data || error); setHoardingTypes([]); })
                .finally(() => setLoading((prev) => ({ ...prev, hoardingTypes: false })));
        }

        if (showSewerage) {
            setLoading((prev) => ({ ...prev, sewerage: true }));
            axios.post(`${import.meta.env.VITE_BASE_URL}/api/Step0/water-sewerage-types`, common, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } })
                .then((response) => {
                    const rows = response?.data?.data?.data || response?.data?.data?.rows || response?.data?.data || response?.data?.rows || response?.data || [];
                    setWaterSewerageTypes((Array.isArray(rows) ? rows : []).map((r) => ({
                        value: String(r?.id ?? r?.NUM_WTSEWRGTYPE_ID ?? r?.num_wtsewrgtype_id ?? r?.num_type_id ?? ""),
                        label: String(r?.name ?? r?.VAR_WTSEWRGTYPE_NAME ?? r?.var_type_name ?? ""),
                    })).filter((r) => r.value && r.label));
                }).catch((error) => { console.error("Step0 water-sewerage-types error:", error?.response?.data || error); setWaterSewerageTypes([]); })
                .finally(() => setLoading((prev) => ({ ...prev, sewerage: false })));
        }
    }, [token, ulbId, serviceId, corpId, userId, isImc, isFire, isHoarding, showSewerage]);

    useEffect(() => {
        if (!token || !userId || !ulbId || !serviceId) return;
        (async () => {
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}/api/Step0/prefilled-applicant`,
                    { ulbId, serviceId, userId, corpId },
                    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
                );

                const data = (response?.data?.data?.data && !Array.isArray(response.data.data.data) ? response.data.data.data : response?.data?.data && !Array.isArray(response.data.data) ? response.data.data : response?.data || {});

                const applicant = data?.applicant || data?.data || data;
                const mapping = {
                    firstName: ["firstName", "FIRSTNAME", "var_appl_firstname"],
                    middleName: ["middleName", "MIDDLENAME", "var_appl_middlename"],
                    lastName: ["lastName", "LASTNAME", "var_appl_lastname"],
                    firstNameMarathi: ["firstNameMarathi", "FIRSTNAMEM", "var_appl_mfirstname"],
                    middleNameMarathi: ["middleNameMarathi", "MIDDLENAMEM", "var_appl_mmiddlename"],
                    lastNameMarathi: ["lastNameMarathi", "LASTNAMEM", "var_appl_mlastname"],
                    mobileNo: ["mobileNo", "MOBILENO", "var_appl_mobno"],
                    aadharNo: ["aadharNo", "AADHARNO", "var_appl_aadharno"],
                    email: ["email", "EMAIL", "var_appl_email"],
                    address: ["address", "ADDRESS", "var_appl_address"],
                    addressMarathi: ["addressMarathi", "ADDRESSM", "var_appl_maddress"],
                };
                const prefill = {};
                Object.entries(mapping).forEach(([field, keys]) => {
                    const value = (keys.map((key) => applicant?.[key]).find((value) => value !== undefined && value !== null) ?? "");
                    if (value !== "") prefill[field] = String(value);
                });
                if (Object.keys(prefill).length) {
                    formik.setValues((prev) => ({ ...prev, ...prefill }), false);
                    setMode(Number(data?.mode ?? applicant?.mode ?? 1));
                }
            } catch (error) {
                console.error("Step0 prefilled applicant error:", error?.response?.data || error);
            } finally {
                setPrefillLoaded(true);
            }
        })();
    }, [token, userId, ulbId, serviceId, corpId]);

    useEffect(() => {
        if (!token || !userId || !prefillLoaded || formik.values.mobileNo) return;
        (async () => {
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}/api/Step0/user-mobile`,
                    { userId, ulbId },
                    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
                );
                const result = (response?.data?.data?.data && !Array.isArray(response.data.data.data) ? response.data.data.data : response?.data?.data && !Array.isArray(response.data.data) ? response.data.data : response?.data || {});
                const mobile = result?.mobileNo ?? result?.mobile ?? result?.MOBILENO ?? result?.var_usermobile ?? "";
                if (mobile) formik.setFieldValue("mobileNo", String(mobile), false);
            } catch (error) {
                console.error("Step0 user mobile error:", error?.response?.data || error);
            }
        })();
    }, [token, userId, ulbId, prefillLoaded, formik.values.mobileNo]);

    const searchBnd = async () => {
        const values = formik.values;
        if (![values.registrationNo, values.bndDate, values.fatherName, values.motherName].some((v) => String(v || "").trim())) {
            Swal.fire({ text: "Enter registration number, date, father name or mother name." });
            return;
        }
        setLoading((prev) => ({ ...prev, bnd: true }));
        setBndRows([]);
        setSelectedBnd(null);
        setBndSearched(false);
        try {
            const path = [15, 343].includes(serviceId) ? "death-search" : "birth-search";
            const response = await axios.post(`
                ${import.meta.env.VITE_BASE_URL}/api/Step0/${path}`,
                {
                    ulbId, serviceId,
                    registrationNo: values.registrationNo.trim(),
                    eventDate: values.bndDate,
                    fatherName: values.fatherName.trim(),
                    motherName: values.motherName.trim(),
                },
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
            const rows = (Array.isArray(response?.data?.data?.data) ? response.data.data.data : Array.isArray(response?.data?.data?.rows) ? response.data.data.rows : Array.isArray(response?.data?.data) ? response.data.data : Array.isArray(response?.data?.rows) ? response.data.rows : Array.isArray(response?.data) ? response.data : []);
            setBndRows(rows);
            setBndSearched(true);
            if (!rows.length) {
                if (MANUAL_BND_ULBS.includes(ulbId) && [14, 15].includes(serviceId)) {
                    await Swal.fire({ text: "No matching record was found. Enter the certificate details manually." });
                } else {
                    await Swal.fire({ text: "No matching Birth/Death records were found." });
                }
            }
        } catch (error) {
            Swal.fire({ text: error?.response?.data?.message || error.message || "Unable to search Birth/Death details." });
        } finally {
            setLoading((prev) => ({ ...prev, bnd: false }));
        }
    };

    const searchWaterConnection = async () => {
        const connectionNo = formik.values.connectionNo.trim();
        if (!connectionNo) {
            Swal.fire({ text: "Enter water connection number." });
            return;
        }
        setLoading((prev) => ({ ...prev, water: true }));
        setWaterConnection(null);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/api/Step0/water-connection-search`,
                { ulbId, serviceId, connectionNo },
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });

            const result = (response?.data?.data?.data && !Array.isArray(response.data.data.data) ? response.data.data.data : response?.data?.data && !Array.isArray(response.data.data) ? response.data.data : response?.data || {});
            const data = Array.isArray(result) ? result[0] : result?.connection || result?.data || result;
            if (!data || !Object.keys(data).length) throw new Error("Water connection not found.");
            const due = Number(data.payamt ?? data.payAmt ?? data.outstandingAmount ?? 0);
            if (due > 0) {
                setWaterConnection(null);
                Swal.fire({ text: `Water tax payment of ₹${due} is due. Please clear the payment first.` });
                return;
            }
            setWaterConnection(data);
            formik.setFieldValue("propertyNo", data.connno ?? data.connectionNo ?? connectionNo);
            Swal.fire({ text: "Water connection details loaded successfully." });
        } catch (error) {
            setWaterConnection(null);
            Swal.fire({ text: error?.response?.data?.message || error.message || "Unable to fetch water connection." });
        } finally {
            setLoading((prev) => ({ ...prev, water: false }));
        }
    };

    const selectedBndId = selectedBnd?.uniqueNo ?? selectedBnd?.UniqueNo ?? selectedBnd?.uniqueno ?? selectedBnd?.id;

    return (
        <div className="mx-auto w-full space-y-2 p-3">

            <FormikProvider value={formik}>
                <Form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const validationErrors = await formik.validateForm();
                        if (Object.keys(validationErrors).length > 0) {
                            await Swal.fire({
                                // icon: "warning",
                                // title: "Please check the required fields",
                                text: Object.values(validationErrors).join("\n"),
                                confirmButtonColor: "#083c76",
                            });
                            return;
                        }
                        formik.handleSubmit(e);
                    }}
                    className="flex flex-col gap-5"
                >
                    <Card className="border shadow-sm">
                        <CardHeader className="border-b">
                            <CardTitle className="text-base font-semibold">Applicant Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                            <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                <Label text="First Name" htmlFor="firstName" required />

                                <span className="text-center">:</span>
                                <Input id="firstName" name="firstName" type="text" value={formik.values.firstName ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            </div>
                            <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                <Label text="Middle Name" htmlFor="middleName" required />

                                <span className="text-center">:</span>
                                <Input id="middleName" name="middleName" type="text" value={formik.values.middleName ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            </div>
                            <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                <Label text="Last Name" htmlFor="lastName" required />

                                <span className="text-center">:</span>
                                <Input id="lastName" name="lastName" type="text" value={formik.values.lastName ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            </div>
                            <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                <Label text="First Name (Marathi)" htmlFor="firstNameMarathi" required />

                                <span className="text-center">:</span>
                                <Input id="firstNameMarathi" name="firstNameMarathi" type="text" value={formik.values.firstNameMarathi ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            </div>
                            <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                <Label text="Middle Name (Marathi)" htmlFor="middleNameMarathi" required />

                                <span className="text-center">:</span>
                                <Input id="middleNameMarathi" name="middleNameMarathi" type="text" value={formik.values.middleNameMarathi ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            </div>
                            <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                <Label text="Last Name (Marathi)" htmlFor="lastNameMarathi" required />

                                <span className="text-center">:</span>
                                <Input id="lastNameMarathi" name="lastNameMarathi" type="text" value={formik.values.lastNameMarathi ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            </div>
                            <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                <Label text="Mobile Number" htmlFor="mobileNo" required />
                                <span className="text-center">:</span>
                                <Input
                                    id="mobileNo"
                                    name="mobileNo"
                                    type="text"
                                    value={formik.values.mobileNo ?? ""}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                                        formik.setFieldValue("mobileNo", value);
                                    }}
                                    onBlur={formik.handleBlur}
                                    inputMode="numeric"
                                    maxLength={10}
                                />
                            </div>
                            <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                <Label text="Aadhaar Number" htmlFor="aadharNo" />
                                <span className="text-center">:</span>
                                <Input
                                    id="aadharNo"
                                    name="aadharNo"
                                    type="text"
                                    value={formik.values.aadharNo ?? ""}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "").slice(0, 14);
                                        formik.setFieldValue("aadharNo", value);
                                    }}
                                    onBlur={formik.handleBlur}
                                    inputMode="numeric"
                                    maxLength={14}
                                />
                            </div>
                            <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                <Label text="Email" htmlFor="email" required={[14, 15].includes(serviceId) && ulbId !== 2} />

                                <span className="text-center">:</span>
                                <Input id="email" name="email" type="email" value={formik.values.email ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            </div>
                            <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                <Label text="Address" htmlFor="address" required />

                                <span className="text-center">:</span>
                                <Input id="address" name="address" type="text" value={formik.values.address ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            </div>
                            <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                <Label text="Address (Marathi)" htmlFor="addressMarathi" required />

                                <span className="text-center">:</span>
                                <Input id="addressMarathi" name="addressMarathi" type="text" value={formik.values.addressMarathi ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            </div>
                            <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                <Label text="Purpose" htmlFor="purpose" required />

                                <span className="text-center">:</span>
                                <Input id="purpose" name="purpose" type="text" value={formik.values.purpose ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            </div>
                            <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                <Label text="Purpose (Marathi)" htmlFor="purposeMarathi" required />

                                <span className="text-center">:</span>
                                <Input id="purposeMarathi" name="purposeMarathi" type="text" value={formik.values.purposeMarathi ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            </div>
                            {!isImc && (
                                <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                    <Label text="Zone" htmlFor="zoneId" required />

                                    <span className="text-center">:</span>
                                    <Select
                                        className="min-w-full"
                                        value={formik.values.zoneId}
                                        onValueChange={(v) => formik.setFieldValue("zoneId", v)}
                                        disabled={loading.zones}
                                    >
                                        <SelectTrigger id="zoneId">
                                            <SelectValue placeholder={loading.zones ? "Loading..." : "Select"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {zones.map((option, index) => <SelectItem key={`${option.value}-${index}`} value={String(option.value)}>{option.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {showPropertyNo && <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                <Label text="Property Number" htmlFor="propertyNo" required={showPropertyNo} />

                                <span className="text-center">:</span>
                                <Input id="propertyNo" name="propertyNo" type="text" value={formik.values.propertyNo ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            </div>}
                            {showWaterSearch && (
                                <>
                                    <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                        <Label text="Water Connection Number" htmlFor="connectionNo" />

                                        <span className="text-center">:</span>
                                        <Input id="connectionNo" name="connectionNo" type="text" value={formik.values.connectionNo ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                    </div>
                                    <div className="flex items-end">
                                        <Button type="button" onClick={searchWaterConnection} disabled={loading.water}>
                                            {loading.water ? "Searching..." : "Search Connection"}
                                        </Button>
                                    </div>
                                    {waterConnection && (
                                        <div className="col-span-full rounded-md border bg-muted/30 p-3 text-sm md:col-span-2 xl:col-span-3">
                                            <p><b>Connection:</b> {waterConnection.connno ?? waterConnection.connectionNo ?? formik.values.connectionNo}</p>
                                            <p><b>Owner:</b> {waterConnection.ownername ?? waterConnection.ownerName ?? "-"}</p>
                                            <p><b>Usage:</b> {waterConnection.usagetypename ?? waterConnection.usageType ?? "-"}</p>
                                            <p><b>Connection Size:</b> {waterConnection.connsizename ?? waterConnection.connectionSize ?? "-"}</p>
                                            <p><b>Built-up Area:</b> {waterConnection.bulituparea ?? waterConnection.builtUpArea ?? "-"}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent></Card>

                    {isFire && (
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b">
                                <CardTitle className="text-base font-semibold">Fire NOC Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                                <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                    <Label text="NOC Purpose" htmlFor="nocPurposeId" required />

                                    <span className="text-center">:</span>
                                    <Select value={formik.values.nocPurposeId} onValueChange={(v) => formik.setFieldValue("nocPurposeId", v)} disabled={loading.noc}>
                                        <SelectTrigger id="nocPurposeId"><SelectValue placeholder={loading.noc ? "Loading..." : "Select"} /></SelectTrigger>
                                        <SelectContent>
                                            {nocPurposes.map((option, index) => <SelectItem key={`${option.value}-${index}`} value={String(option.value)}>{option.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent></Card>
                    )}

                    {showSewerage && (
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b">
                                <CardTitle className="text-base font-semibold">Water / Sewerage Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                                <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                    <Label text="Water Sewerage Type" htmlFor="waterSewerageTypeId" required />

                                    <span className="text-center">:</span>
                                    <Select value={formik.values.waterSewerageTypeId} onValueChange={(v) => formik.setFieldValue("waterSewerageTypeId", v)} disabled={loading.sewerage}>
                                        <SelectTrigger id="waterSewerageTypeId"><SelectValue placeholder={loading.sewerage ? "Loading..." : "Select"} /></SelectTrigger>
                                        <SelectContent>
                                            {waterSewerageTypes.map((option, index) => <SelectItem key={`${option.value}-${index}`} value={String(option.value)}>{option.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent></Card>
                    )}

                    {isHoarding && (
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b">
                                <CardTitle className="text-base font-semibold">Hoarding Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                                <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                    <Label text="Place of Hoarding" htmlFor="hoardingPlaceId" required />

                                    <span className="text-center">:</span>
                                    <Select value={formik.values.hoardingPlaceId} onValueChange={(v) => formik.setFieldValue("hoardingPlaceId", v)} disabled={loading.hoardingPlaces}>
                                        <SelectTrigger id="hoardingPlaceId"><SelectValue placeholder={loading.hoardingPlaces ? "Loading..." : "Select"} /></SelectTrigger>
                                        <SelectContent>
                                            {hoardingPlaces.map((option, index) => <SelectItem key={`${option.value}-${index}`} value={String(option.value)}>{option.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                    <Label text="Hoarding Type" htmlFor="hoardingTypeId" required />

                                    <span className="text-center">:</span>
                                    <Select value={formik.values.hoardingTypeId} onValueChange={(v) => formik.setFieldValue("hoardingTypeId", v)} disabled={loading.hoardingTypes}>
                                        <SelectTrigger id="hoardingTypeId"><SelectValue placeholder={loading.hoardingTypes ? "Loading..." : "Select"} /></SelectTrigger>
                                        <SelectContent>
                                            {hoardingTypes.map((option, index) => <SelectItem key={`${option.value}-${index}`} value={String(option.value)}>{option.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                    <Label text="Advertisement Details" htmlFor="advertisementDetails" required />

                                    <span className="text-center">:</span>
                                    <Input id="advertisementDetails" name="advertisementDetails" type="text" value={formik.values.advertisementDetails ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                </div>
                                <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                    <Label text="Hoarding Size" htmlFor="hoardingSize" required />

                                    <span className="text-center">:</span>
                                    <Input id="hoardingSize" name="hoardingSize" type="text" value={formik.values.hoardingSize ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                </div>
                            </CardContent></Card>
                    )}

                    {isImc && [7, 8].includes(serviceId) && (
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b">
                                <CardTitle className="text-base font-semibold">
                                    {serviceId === 7 ? "Issuance of Zone Certificate" : "Bhag Nakasha"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                                <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                    <Label text="Village" htmlFor="villageId" required />

                                    <span className="text-center">:</span>
                                    <Select value={formik.values.villageId} onValueChange={(value) => { formik.setFieldValue("villageId", value); formik.setFieldValue("citySurveyNo", ""); formik.setFieldValue("gatNo", ""); formik.setFieldValue("plotNo", ""); }} disabled={loading.villages}>
                                        <SelectTrigger id="villageId"><SelectValue placeholder={loading.villages ? "Loading..." : "Select"} /></SelectTrigger>
                                        <SelectContent>
                                            {villages.map((option, index) => <SelectItem key={`${option.value}-${index}`} value={String(option.value)}>{option.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {["1", "2", "3"].includes(String(formik.values.villageId)) ? (
                                    <>
                                        <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                            <Label text="City Survey Number" htmlFor="citySurveyNo" required />

                                            <span className="text-center">:</span>
                                            <Input id="citySurveyNo" name="citySurveyNo" type="text" value={formik.values.citySurveyNo ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                        </div>
                                        <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                            <Label text="Gat No / Survey No" htmlFor="gatNo" required />

                                            <span className="text-center">:</span>
                                            <Input id="gatNo" name="gatNo" type="text" value={formik.values.gatNo ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                        </div>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                        <Label text="Final Plot No / Plot No" htmlFor="plotNo" required />

                                        <span className="text-center">:</span>
                                        <Input id="plotNo" name="plotNo" type="text" value={formik.values.plotNo ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                    </div>
                                )}
                                {serviceId === 7 && <>
                                    <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                        <Label text="Part Plan Size" htmlFor="partPlanSize" required />

                                        <span className="text-center">:</span>
                                        <Input id="partPlanSize" name="partPlanSize" type="text" value={formik.values.partPlanSize ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                    </div>
                                    <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                        <Label text="TP Scheme" htmlFor="tpScheme" required />

                                        <span className="text-center">:</span>
                                        <Input id="tpScheme" name="tpScheme" type="text" value={formik.values.tpScheme ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                    </div>
                                </>}
                                {serviceId === 8 && <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                    <Label text="Size of Part Plan" htmlFor="partPlanSize" required />

                                    <span className="text-center">:</span>
                                    <Input id="partPlanSize" name="partPlanSize" type="text" value={formik.values.partPlanSize ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                </div>}
                                <div className="col-span-full space-y-3">
                                    <Label text="Type of Part Plan" required />
                                    <div className="flex flex-wrap gap-6">
                                        {[
                                            ["sanctionedDP", "Sanctioned DP"],
                                            ["ep", "EP"],
                                            ["draftDP", "Draft DP"],
                                        ].map(([field, label]) => (
                                            <div key={field} className="flex items-center gap-2 rounded-md border px-3 py-2">
                                                <Input
                                                    id={`plan-${field}`}
                                                    type="checkbox"
                                                    checked={formik.values[field] === "1"}
                                                    onChange={(e) => formik.setFieldValue(field, e.target.checked ? "1" : "0")}
                                                />
                                                <Label text={label} htmlFor={`plan-${field}`} className="w-auto sm:w-auto" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent></Card>
                    )}

                    {isBnd && (
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b">
                                <CardTitle className="text-base font-semibold">
                                    {isBirth ? "Birth Certificate Details" : "Death Certificate Details"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                                <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                    <Label text="Registration Number" htmlFor="registrationNo" />

                                    <span className="text-center">:</span>
                                    <Input id="registrationNo" name="registrationNo" type="text" value={formik.values.registrationNo ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                </div>
                                <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                    <Label text={isBirth ? "Birth Date" : "Death Date"} htmlFor="bndDate" />

                                    <span className="text-center">:</span>
                                    <Input id="bndDate" name="bndDate" type="date" value={formik.values.bndDate ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                </div>
                                <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                    <Label text="Father Name" htmlFor="fatherName" />

                                    <span className="text-center">:</span>
                                    <Input id="fatherName" name="fatherName" type="text" value={formik.values.fatherName ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                </div>
                                <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                    <Label text="Mother Name" htmlFor="motherName" />

                                    <span className="text-center">:</span>
                                    <Input id="motherName" name="motherName" type="text" value={formik.values.motherName ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                </div>
                                <div className="flex items-end">
                                    <Button type="button" onClick={searchBnd} disabled={loading.bnd}>
                                        {loading.bnd ? "Searching..." : isBirth ? "Search Birth Record" : "Search Death Record"}
                                        {/* {loading.bnd ? "Searching..." : "Search Record"} */}
                                    </Button>
                                </div>
                                {bndRows.length > 0 && (
                                    <div className="col-span-full">
                                        <ShadCNTable
                                            headers={[
                                                "Select",
                                                "Registration No",
                                                "Name",
                                                "Gender",
                                                "Date",
                                                "Mother Name",
                                                "Father Name",
                                                "Copies",
                                            ]}
                                            data={bndRows.map((row, index) => {
                                                const rowId = row.uniqueNo ?? row.UniqueNo ?? row.uniqueno ?? row.id ?? index;
                                                const dateValue = row.BNDdate ?? row.bnddate ?? row.date;
                                                return {
                                                    rowId,
                                                    select: <Input type="radio" name="bnd-record" checked={String(selectedBndId) === String(rowId)} onChange={() => setSelectedBnd(row)} />,
                                                    registrationNo: row.regno ?? row.registrationNo ?? row.REGNO ?? "-",
                                                    name: row.name ?? row.NAME ?? "-",
                                                    gender: row.gender ?? row.GENDER ?? "-",
                                                    date: dateValue ? new Date(dateValue).toLocaleDateString("en-IN") : "-",
                                                    motherName: row.mothername ?? row.MOTHERNAME ?? "-",
                                                    fatherName: row.fathername ?? row.FATHERNAME ?? "-",
                                                    copies: row.copies ?? row.COPIES ?? "-",
                                                };
                                            })}
                                            keyMapping={{
                                                Select: "select",
                                                "Registration No": "registrationNo",
                                                Name: "name",
                                                Gender: "gender",
                                                Date: "date",
                                                "Mother Name": "motherName",
                                                "Father Name": "fatherName",
                                                Copies: "copies",
                                            }}
                                            pagination={false}
                                        />
                                    </div>
                                )}
                                {showBndManual && (
                                    <>
                                        <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                            <Label text={isBirth ? "Child Name" : "Name of Deceased"} htmlFor="bndName" required />

                                            <span className="text-center">:</span>
                                            <Input id="bndName" name="bndName" type="text" value={formik.values.bndName ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                        </div>
                                        <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                            <Label text="Gender" htmlFor="gender" required />

                                            <span className="text-center">:</span>
                                            <Select value={formik.values.gender} onValueChange={(value) => formik.setFieldValue("gender", value)}>
                                                <SelectTrigger id="gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="M">Male</SelectItem>
                                                    <SelectItem value="F">Female</SelectItem>
                                                    <SelectItem value="O">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {ulbId === 2 && [14, 15].includes(serviceId) &&
                                            <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                                <Label text="Number of Copies" htmlFor="noOfCopies" required />

                                                <span className="text-center">:</span>
                                                <Input id="noOfCopies" name="noOfCopies" type="number" value={formik.values.noOfCopies ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} min="1" />
                                            </div>}
                                    </>
                                )}
                                {showCertificateType && (
                                    <div className="col-span-full space-y-2">
                                        <Label text="Certificate Issuance Type" required />
                                        <div className="flex flex-wrap gap-6">
                                            {["CRS", "MUNICIPAL"].map((type) => (
                                                <div key={type} className="flex items-center gap-2 rounded-md border px-3 py-2">
                                                    <Input
                                                        id={`certificateType-${type}`}
                                                        type="radio"
                                                        name="certificateType"
                                                        value={type}
                                                        checked={formik.values.certificateType === type}
                                                        disabled={bndRows.length > 0 ? type === "CRS" : type === "MUNICIPAL"}
                                                        onChange={formik.handleChange}
                                                    />
                                                    <Label text={type === "CRS" ? "CRS" : "Municipal"} htmlFor={`certificateType-${type}`} className="w-auto sm:w-auto cursor-pointer" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent></Card>
                    )}

                    {isImc && (
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b">
                                <CardTitle className="text-base font-semibold">Additional Property / Survey Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                                <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                    <Label text="Ward Number" htmlFor="wardNo" />

                                    <span className="text-center">:</span>
                                    <Input id="wardNo" name="wardNo" type="text" value={formik.values.wardNo ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                </div>
                                {![7, 8].includes(serviceId) && <div className="grid grid-cols-[8rem_0.75rem_minmax(0,1fr)] items-center gap-2 min-w-0">
                                    <Label text="Property Number" htmlFor="propertyNo" />

                                    <span className="text-center">:</span>
                                    <Input id="propertyNo" name="propertyNo" type="text" value={formik.values.propertyNo ?? ""} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                </div>}
                            </CardContent></Card>
                    )}

                    <div className="flex flex-wrap justify-center gap-3 mt-5 pb-6">
                        <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={loading.submit}>Cancel</Button>
                        <Button type="submit" disabled={loading.submit || formik.isSubmitting} className="bg-[#083c76] hover:bg-[#062e5b]">
                            {loading.submit ? "Submitting..." : "Submit"}
                        </Button>
                    </div>
                </Form>
            </FormikProvider>
        </div>
    );
};

export default FrmStep0;
