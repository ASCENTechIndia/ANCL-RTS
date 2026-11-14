
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Formik, Form } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/calendar";
import ShadCNTable from "@/components/ui/table";
import { FileText } from "lucide-react";

const Step1 = () => {
    const location = useLocation();
    const { user, token } = useAuth();
    const baseUrl = import.meta.env.VITE_BASE_URL;
       const navigate = useNavigate();

    const ulbId = Number(location.state?.ulbId ?? user?.ulbId);
    const serviceId = Number(location.state?.serviceId ?? user?.serviceId);
    const nocPurposeId = location.state?.nocPurposeId ?? location.state?._NOCPurposeid ?? location.state?.fireNocPurposeId ?? user?.nocPurposeId;
    const serviceName = location.state?.serviceName ?? location.state?.service ?? user?.serviceName;
    const applicationNo = location.state?.applicationNo ?? location.state?.appNo;

    const isFireService = [12, 13].includes(serviceId);
    const isExistingApplication = Boolean(applicationNo);
    const showCopies = serviceId !== 1;
    const showMarriageDate = serviceId === 1 && !isExistingApplication;

    const [documents, setDocuments] = useState([]);
    const [documentFiles, setDocumentFiles] = useState({});
    const [loading, setLoading] = useState(false);

    const initialValues = {
        noOfCopies: serviceId === 1 ? "1" : "",
        marriageDate: null,
    };

    const normalizeDocument = (row) => ({
        id: row.ID ?? row.id,
        type: String(row.TYPE ?? row.type ?? "").toUpperCase(),
        engname: row.ENGNAME ?? row.engname ?? "",
        engdocdesc: row.ENGDOCDESC ?? row.engdocdesc ?? "",
        active: String(row.ACTIVE ?? row.active ?? "").toUpperCase(),
    });

    const fetchDocuments = async () => {
        if (!token || !ulbId || !serviceId) {
            setDocuments([]);
            return;
        }

        if (isFireService && !nocPurposeId) {
            setDocuments([]);
            Swal.fire({
                icon: "warning",
                text: "Fire NOC Purpose ID is missing.",
                confirmButtonColor: "#1e3a8a",
            });
            return;
        }

        setLoading(true);

        Swal.fire({
            text: "Loading documents...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const payload = {
                serviceId,
                ulbId,
                ...(isFireService ? { nocPurposeId: String(nocPurposeId) } : {}),
            };

            const response = await axios.post(
                `${baseUrl}/api/Step0/documents`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const rows = response?.data?.data?.rows ?? [];

            const supportingDocuments = rows
                .map(normalizeDocument)
                .filter((document) => document.type === "S");

            setDocuments(supportingDocuments);
            setDocumentFiles({});
            Swal.close();
        } catch (error) {
            console.error("Fetch Documents Error:", error);

            setDocuments([]);
            setDocumentFiles({});
            Swal.close();

            Swal.fire({
                icon: "error",
                text:
                    error?.response?.data?.message ||
                    "Unable to fetch documents.",
                confirmButtonColor: "#1e3a8a",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [token, ulbId, serviceId, nocPurposeId]);

    const handleDocumentFileChange = (documentId, file) => {
        setDocumentFiles((previous) => {
            const updated = { ...previous };

            if (file) {
                updated[documentId] = file;
            } else {
                delete updated[documentId];
            }

            return updated;
        });
    };

    const tableData = useMemo(
        () =>
            documents.map((document) => {
                const isMandatory = document.active === "Y";

                return {
                    id: document.id,
                    type: document.type,
                    document: (
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 shrink-0 text-gray-600" />
                            <span>{document.engname || "-"}</span>
                            {isMandatory && (
                                <span className="font-bold text-red-600">*</span>
                            )}
                        </div>
                    ),
                    description: document.engdocdesc || "-",
                    upload: (
                        <div className="min-w-50">
                            <Input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                maxFileSize={5 * 1024 * 1024}
                                required={isMandatory}
                                onChange={(e) =>
                                    handleDocumentFileChange(
                                        document.id,
                                        e.target.files?.[0] || null
                                    )
                                }
                                className="cursor-pointer"
                            />

                            {documentFiles[document.id] && (
                                <p className="mt-1 break-all text-xs text-gray-600">
                                    {documentFiles[document.id].name}
                                </p>
                            )}
                        </div>
                    ),
                };
            }),
        [documents, documentFiles]
    );

    const headers = [
        // "id",
        // "type",
        "Document",
        "Description",
        "Upload PDF",
    ];

    const keyMapping = {
        // id: "id",
        // type: "type",
        Document: "document",
        Description: "description",
        "Upload PDF": "upload",
    };

    const handleSubmit = async (values) => {
        const corpId = user?.corpId ?? user?.corpid ?? user?.CorpId;
        const userId = user?.userUniqueId ?? user?.userId ?? user?.userid ?? user?.UserUniqueId;

        if (!corpId || !userId) {
            Swal.fire({ icon: "error", text: "Corp ID or User ID is missing." });
            return;
        }

        if (!values.noOfCopies || Number(values.noOfCopies) <= 0) {
            Swal.fire({ icon: "warning", text: "No. of certificate copies cannot be blank or zero." });
            return;
        }

        if (serviceId === 1 && !values.marriageDate) {
            Swal.fire({ icon: "warning", text: "Marriage Date cannot be blank." });
            return;
        }

        const missingDocuments = documents.filter(
            (doc) => doc.active === "Y" && !documentFiles[doc.id]
        );

        if (missingDocuments.length) {
            Swal.fire({ icon: "warning", text: "Please upload all mandatory documents." });
            return;
        }

        const marriageDate = values.marriageDate ? `${values.marriageDate.getFullYear()}-${String(values.marriageDate.getMonth() + 1).padStart(2, "0")}-${String(values.marriageDate.getDate()).padStart(2, "0")}` : null;

        const procedurePayload = {
            ulbId,
            corpid: Number(corpId),
            serviceid: serviceId,
            zoneid: 0,
            userid: Number(userId),
            noofcopy: Number(values.noOfCopies || 1),
            marriageDate,
            appno: applicationNo || "0",
        };

        const headers = { Authorization: `Bearer ${token}` };

        try {
            Swal.fire({
                text: "Submitting application...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading(),
            });

            // 1. Call procedure with mode 1
            const firstResponse = await axios.post(`${baseUrl}/api/Step1/application-ins`, { ...procedurePayload, mode: 1 },
                { headers }
            );

            const firstResult = firstResponse?.data?.data ?? firstResponse?.data;
            const generatedAppNo =
                firstResult?.applicationNo ?? firstResult?.outBinds?.out_ErrMsg;

            if (!generatedAppNo) {
                throw new Error("Application number was not returned by the procedure.");
            }

            // 2. Upload selected documents
            for (const doc of documents) {
                const file = documentFiles[doc.id];
                if (!file) continue;

                const formData = new FormData();
                formData.append("corpId", String(corpId));
                formData.append("serviceId", String(serviceId));
                formData.append("appNo", String(generatedAppNo));
                formData.append("docType", doc.type);
                formData.append("documentId", String(doc.id));
                formData.append("ulbId", String(ulbId));
                formData.append("userId", String(userId));
                formData.append("document", file);

                await axios.post(`${baseUrl}/api/Step1/upload-document`, formData, { headers });
            }

            // 3. same procedure with mode 2
            const secondResponse = await axios.post(`${baseUrl}/api/Step1/application-ins`,
                { ...procedurePayload, appno: generatedAppNo, mode: 2 },
                { headers }
            );

            const secondResult = secondResponse?.data?.data ?? secondResponse?.data;

            Swal.close();
            await Swal.fire({
                icon: "success",
                text: secondResult?.message || "Application submitted successfully.",
                confirmButtonColor: "#1e3a8a",
            }).then(() => {
            navigate("/app/FrmTrackApplication", { state: { applicationNo } });
        });
        } catch (error) {
            console.error("Step1 Submit Error:", error);
            Swal.close();
            Swal.fire({
                icon: "error",
                text: error?.response?.data?.message || error.message || "Unable to submit application.",
                confirmButtonColor: "#1e3a8a",
            });
        }
    };

    return (
        <div className="w-full px-3">
            <Card className="border shadow-sm">
                <CardHeader className="border-b">
                    <CardTitle className="text-base font-semibold">{serviceName}</CardTitle>
                </CardHeader>

                <CardContent className="p-3">
                    <Formik
                        initialValues={initialValues}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({ values, setFieldValue }) => (
                            <Form className="space-y-4">
                                {isExistingApplication && (
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                                        <Label
                                            text="Application No./ अर्ज क्रमांक"
                                            className="md:min-w-fit"
                                        />
                                        <span className="text-center">:</span>
                                        <span className="break-all text-sm font-medium text-gray-800">{applicationNo}</span>
                                    </div>
                                )}

                                <div className=" flex justify-center">
                                    {documents.length > 0 ? (
                                        <ShadCNTable
                                            headers={headers}
                                            data={tableData}
                                            keyMapping={keyMapping}
                                            pagination={false}
                                            tableClassName="w-full"
                                        />
                                    ) : (
                                        !loading && (
                                            <div className="py-8 text-center text-sm text-gray-500">No supporting documents found.</div>
                                        )
                                    )}
                                </div>


                                {showCopies && (
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                                        <Label
                                            text="No. of certificate copies/ एकूण प्रती"
                                            htmlFor="noOfCopies"
                                            className="md:min-w-fit"
                                        />

                                        <span className="text-center">:</span>

                                        <Input
                                            id="noOfCopies"
                                            name="noOfCopies"
                                            type="number"
                                            min="1"
                                            value={values.noOfCopies}
                                            onChange={(e) =>
                                                setFieldValue("noOfCopies", e.target.value)
                                            }
                                            className="w-full md:max-w-96"
                                        />
                                    </div>
                                )}

                                {showMarriageDate && (
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                                        <Label
                                            text="Date of Marriage/ विवाहची तारीख"
                                            className="md:min-w-fit"
                                        />

                                        <span className="text-center">:</span>

                                        <DatePicker
                                            value={values.marriageDate}
                                            onChange={(date) =>
                                                setFieldValue("marriageDate", date)
                                            }
                                            className="w-full md:max-w-96"
                                        />
                                    </div>
                                )}

                                {/* {!isExistingApplication && ( */}
                                <div className="mt-2 flex justify-center">
                                    <Button
                                        type="submit"
                                        className="bg-blue-700 px-6 text-white hover:bg-blue-800"
                                    >
                                        Submit
                                    </Button>
                                </div>
                                {/* )} */}
                            </Form>
                        )}
                    </Formik>
                </CardContent>
            </Card>
        </div>
    );
};

export default Step1;
