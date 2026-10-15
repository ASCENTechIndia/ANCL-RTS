import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

import axios from "axios";
import { Form, Formik } from "formik";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const container = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08 },
  },
};

const initialFormValues = {
  appointDate: new Date(),
  slot: "",
  rescheduleReason: "",
};

const FrmAppoints = () => {
  const { user, token } = useAuth();
  // const token = user?.token;

  const location = useLocation();
  const locationState = location.state || {};
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);
  const [rescheduleReasons, setRescheduleReasons] = useState([]);

  const [oldAppointDetails, setOldAppointDetails] = useState({
    appointmentDate: "",
    slotTime: "",
  });

  const mode = String(locationState.mode || "1");
  const ulbId = locationState.ulbId || user?.ulbId;
  const userId = locationState.userId || user?.userId;
  const appNo = locationState.appNo;

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const fetchSlotDetails = async () => {
    if (!appNo) {
      console.warn("Application number is missing");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmAppoints/slot-details`,
        {
          applino: appNo,
        },
        {
          headers: authHeaders,
        },
      );

      const result = response?.data;

      if (
        result?.ok &&
        result?.data?.success &&
        result?.data?.rows?.length > 0
      ) {
        const row = result.data.rows[0];

        setOldAppointDetails({
          appointmentDate: row.SLOTDT || "",
          slotTime: row.SLOT_TIME || "",
        });
      } else {
        setOldAppointDetails({
          appointmentDate: "",
          slotTime: "",
        });

        console.warn("No appointment details found");
      }
    } catch (error) {
      console.error("Slot Details API Error:", error);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Unable to fetch appointment details.",
        confirmButtonColor: "#1e3a8a",
      });
    }
  };

  const fetchRescheduleReasons = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmAppoints/reschedule-reasons`,
        {},
        {
          headers: authHeaders,
        },
      );

      const result = response?.data;

      if (result?.ok && result?.data?.success) {
        setRescheduleReasons(result?.data?.rows || []);
      } else {
        setRescheduleReasons([]);
      }
    } catch (error) {
      console.error("Reschedule Reasons API Error:", error);

      setRescheduleReasons([]);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Unable to fetch reschedule reasons.",
        confirmButtonColor: "#1e3a8a",
      });
    }
  };

  const fetchAllSlots = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmAppoints/all-slots`,
        {},
        {
          headers: authHeaders,
        },
      );

      const result = response?.data;

      if (result?.ok && result?.data?.success) {
        return result?.data?.rows || [];
      }

      return [];
    } catch (error) {
      console.error("All Slots API Error:", error);
      return [];
    }
  };

  const fetchSlotsByDate = async (date) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmAppoints/slots-by-date`,
        {
          slotDate: date,
        },
        {
          headers: authHeaders,
        },
      );

      const result = response?.data;

      if (result?.ok && result?.data?.success) {
        return result?.data?.rows || [];
      }

      return [];
    } catch (error) {
      console.error("Slots By Date API Error:", error);
      return [];
    }
  };

  const fetchAvailableSlots = async (date) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmAppoints/available-slots`,
        {
          slotDate: date,
        },
        {
          headers: authHeaders,
        },
      );

      const result = response?.data;

      if (result?.ok && result?.data?.success) {
        return result?.data?.rows || [];
      }

      return [];
    } catch (error) {
      console.error("Available Slots API Error:", error);
      return [];
    }
  };

  const loadSlotsForDate = async (selectedDate, setFieldValue) => {
    if (!selectedDate) {
      setSlots([]);
      setFieldValue("slot", "");
      return;
    }

    try {
      setLoading(true);

      const day = String(selectedDate.getDate()).padStart(2, "0");

      const monthNames = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ];

      const month = monthNames[selectedDate.getMonth()];
      const year = selectedDate.getFullYear();

      const formattedDate = `${day}-${month}-${year}`;

      console.log("Slot Date:", formattedDate);

      const [allSlots, bookedSlots, availableSlots] = await Promise.all([
        fetchAllSlots(),
        fetchSlotsByDate(formattedDate),
        fetchAvailableSlots(formattedDate),
      ]);

      console.log("All Slots:", allSlots);
      console.log("Booked Slots:", bookedSlots);
      console.log("Available Slots:", availableSlots);

      let finalSlots = availableSlots;

      if (finalSlots.length === 0 && allSlots.length > 0) {
        const bookedIds = bookedSlots.map((item) =>
          String(
            item.SLOT_ID ??
              item.SLOT ??
              item.VAR_SLOT_TIME ??
              item.var_slot_time,
          ),
        );

        finalSlots = allSlots.filter(
          (slot) => !bookedIds.includes(String(slot.SLOT_ID)),
        );
      }

      setSlots(finalSlots || []);

      setFieldValue("slot", "");

      if (finalSlots.length === 0) {
        Swal.fire({
          title: "No Slots Available",
          text: "All slots are booked for this date.",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (error) {
      console.error("Load Slots Error:", error);

      setSlots([]);
      setFieldValue("slot", "");

      Swal.fire({
        title: "Error",
        text: "Unable to fetch slots for selected date.",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (mode === "2") {
        await Promise.all([fetchSlotDetails(), fetchRescheduleReasons()]);
      }
    };

    initialize();
  }, [mode, appNo]);

  const handleSubmit = async (values) => {
    try {
      if (!values.appointDate) {
        Swal.fire({
          text: "Please Select Appointment Date",
          confirmButtonColor: "#1e3a8a",
        });

        return;
      }

      if (!values.slot) {
        Swal.fire({
          text: "Please Select Slot",
          confirmButtonColor: "#1e3a8a",
        });

        return;
      }

      if (mode === "2" && !values.rescheduleReason) {
        Swal.fire({
          text: "Please Select Reason",
          confirmButtonColor: "#1e3a8a",
        });

        return;
      }

      if (!appNo) {
        Swal.fire({
          text: "Application number is missing.",
          confirmButtonColor: "#1e3a8a",
        });

        return;
      }

      Swal.fire({
        title: "Processing...",
        text: "Please wait",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      setLoading(true);

      const date = values.appointDate;

      const year = date.getFullYear();

      const month = String(date.getMonth() + 1).padStart(2, "0");

      const day = String(date.getDate()).padStart(2, "0");

      const slotDate = `${year}-${month}-${day}`;

      const payload = {
        userId: userId?.toString() || "",
        orgId: Number(ulbId),
        appNo: appNo,
        slotDate: slotDate,
        slotId: Number(values.slot),
        reason: mode === "2" ? Number(values.rescheduleReason) : 0,
      };

      console.log("Book Slot Payload:", payload);

      const response = await axios.post(
        `${BASE_URL}/api/FrmAppoints/book-slot`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = response?.data;

      Swal.close();

      if (
        result?.ok &&
        result?.data?.success &&
        result?.data?.errorCode === 9999
      ) {
        await Swal.fire({
          title: "Success",
          text:
            result?.message ||
            result?.data?.message ||
            `Slot Booked For Application No : ${appNo}`,
          confirmButtonColor: "#1e3a8a",
        });

        // navigate("/app/FrmAppoint");
        navigate("/app/FrmTrackApplication", { state: { applicationNo: appNo } });
      } else {
        Swal.fire({
          title: "Failed",
          text:
            result?.message || result?.data?.message || "Failed to book slot.",
          confirmButtonColor: "#1e3a8a",
        });
      }
    } catch (error) {
      console.error("Book Slot Error:", error);

      Swal.close();

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.data?.message ||
          "An error occurred while booking the slot.",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik initialValues={initialFormValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue, handleSubmit, isSubmitting, resetForm }) => (
        <Form onSubmit={handleSubmit}>
          <motion.div variants={container} initial="hidden" animate="show">
            <Card className="shadow-sm border">
              <CardHeader className="border-b py-3">
                <CardTitle className="text-lg font-semibold">
                  Appointment
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 space-y-6">
                {mode === "2" && (
                  <div className="border border-gray-200 rounded-md p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <Label className="sm:w-32 sm:text-right font-medium">
                          Appointment
                          <span className="ml-2">:</span>
                        </Label>

                        <div className="flex-1 font-semibold text-gray-700">
                          {oldAppointDetails.appointmentDate || "Loading..."}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <Label className="sm:w-16 sm:text-right font-medium">
                          Slot
                          <span className="ml-2">:</span>
                        </Label>

                        <div className="flex-1 font-semibold text-gray-700">
                          {oldAppointDetails.slotTime || "Loading..."}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <Label className="sm:w-24 sm:text-right font-medium">
                          Reason
                          <span className="hidden sm:inline-block ml-2">:</span>
                        </Label>

                        <div className="flex-1">
                          <Select
                            value={values.rescheduleReason}
                            onValueChange={(value) =>
                              setFieldValue("rescheduleReason", value)
                            }
                          >
                            <SelectTrigger className="w-full bg-white border rounded-md h-9">
                              <SelectValue placeholder="-- Select Reason --" />
                            </SelectTrigger>

                            <SelectContent>
                              {rescheduleReasons.map((reason) => (
                                <SelectItem
                                  key={reason.RESCHEDULE_ID}
                                  value={String(reason.RESCHEDULE_ID)}
                                >
                                  {reason.RESCHEDULE_REASON}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {(mode === "1" || mode === "2") && (
                  <div className="border border-gray-200 rounded-md p-4 bg-white space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <Label className="sm:w-36 sm:text-right font-medium">
                          Appointment
                          <span className="hidden sm:inline-block ml-2">:</span>
                        </Label>

                        <div className="flex-1">
                          <DatePicker
                            value={values.appointDate}
                            onChange={(date) => {
                              setFieldValue("appointDate", date);
                              if (date) {
                                loadSlotsForDate(date, setFieldValue);
                              } else {
                                setSlots([]);

                                setFieldValue("slot", "");
                              }
                            }}
                            className="w-full h-9"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <Label className="sm:w-24 sm:text-right font-medium">
                          Slot
                          <span className="hidden sm:inline-block ml-2">:</span>
                        </Label>

                        <div className="flex-1">
                          <Select
                            value={values.slot}
                            onValueChange={(value) =>
                              setFieldValue("slot", value)
                            }
                            disabled={loading || slots.length === 0}
                          >
                            <SelectTrigger className="w-full border rounded-md h-9">
                              <SelectValue
                                placeholder={
                                  loading
                                    ? "Loading slots..."
                                    : "-- Select Slot --"
                                }
                              />
                            </SelectTrigger>

                            <SelectContent>
                              {slots.map((slot) => (
                                <SelectItem
                                  key={slot.SLOT_ID}
                                  value={String(slot.SLOT_ID)}
                                >
                                  {slot.SLOT_TIME}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="btn btn-primary px-6"
                  >
                    {loading ? "Processing..." : "Submit"}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    className="btn btn-secondary px-6"
                    onClick={() => {
                      resetForm();

                      setSlots([]);

                      navigate("/app/FrmAppoint");
                    }}
                  >
                    Back
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

export default FrmAppoints;
