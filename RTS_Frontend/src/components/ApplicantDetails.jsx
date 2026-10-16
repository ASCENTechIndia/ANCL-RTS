import React, { useEffect, useState } from "react";
import { useFormikContext } from "formik";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const ApplicantDetails = () => {
  const {
    values,
    setFieldValue,
    handleChange,
    handleBlur,
  } = useFormikContext();

  const { user, token } = useAuth();

  const [zoneList, setZoneList] = useState([]);
  const [businessTypeList, setBusinessTypeList] = useState([]);

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const ulbId = user?.ulbId;

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token || localStorage.getItem("token")}`,
    },
  };

  useEffect(() => {
    if (!ulbId) return;

    const fetchDropdowns = async () => {
      try {
        const [zoneResponse, businessTypeResponse] = await Promise.all([
          axios.get(
            `${BASE_URL}/api/FrmWaterRegister/ward-dropdown?ulbid=${ulbId}`,
            axiosConfig
          ),
          axios.get(
            `${BASE_URL}/api/FrmToursTravels/business-type-dropdown?ulbid=${ulbId}`,
            axiosConfig
          ),
        ]);

        if (
          zoneResponse?.data?.ok &&
          zoneResponse?.data?.data?.data
        ) {
          setZoneList(zoneResponse.data.data.data);
        }

        if (
          businessTypeResponse?.data?.ok &&
          businessTypeResponse?.data?.data?.data
        ) {
          setBusinessTypeList(
            businessTypeResponse.data.data.data
          );
        }
      } catch (error) {
        console.error("Error fetching dropdowns:", error);
      }
    };

    fetchDropdowns();
  }, [ulbId]);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-semibold">
          अर्जदाराचा तपशील
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="sm:w-32 shrink-0 flex justify-between items-center">
              <Label required text="अर्जदाराचे नाव" />
              <span>:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
              <Input
                name="firstName"
                value={values.firstName || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="पहिले नाव"
                className="w-full h-9"
              />

              <Input
                name="middleName"
                value={values.middleName || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="मधले नाव"
                className="w-full h-9"
              />

              <Input
                name="lastName"
                value={values.lastName || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="आडनाव"
                className="w-full h-9"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="sm:w-32 shrink-0 flex justify-between items-center">
              <Label required text="मोबाइल क्रमांक" />
              <span>:</span>
            </div>

            <div className="flex gap-2 w-full">
              <Select
                value={values.countryCode || "+91"}
                onValueChange={(value) =>
                  setFieldValue("countryCode", value)
                }
                disabled
              >
                <SelectTrigger className="w-20 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+91">+91</SelectItem>
                </SelectContent>
              </Select>

              <Input
                name="mobileNo"
                value={values.mobileNo || ""}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10);

                  setFieldValue("mobileNo", value);
                }}
                onBlur={handleBlur}
                placeholder="मोबाइल क्रमांक"
                maxLength={10}
                className="w-full h-9"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="sm:w-32 shrink-0 flex justify-between items-center">
              <Label required text="ई-मेल आयडी" />
              <span>:</span>
            </div>

            <Input
              type="email"
              name="emailId"
              value={values.emailId || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="ई-मेल आयडी"
              className="w-full h-9"
              maxLength={30}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="sm:w-32 shrink-0 flex justify-between items-center">
              <Label required text="आधार क्रमांक" />
              <span>:</span>
            </div>

            <Input
              name="aadharNo"
              value={values.aadharNo || ""}
              onChange={(e) => {
                const value = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 12);

                setFieldValue("aadharNo", value);
              }}
              onBlur={handleBlur}
              placeholder="Enter number only"
              maxLength={12}
              className="w-full h-9"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="sm:w-32 shrink-0 flex justify-between items-center">
              <Label required text="अर्जदाराचा निवासी पत्ता" />
              <span>:</span>
            </div>

            <Input
              name="residentialAddress"
              value={values.residentialAddress || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="अर्जदाराचा निवासी पत्ता"
              className="w-full h-9"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="sm:w-32 shrink-0 flex justify-between items-center">
              <Label text="पॅन कार्ड" />
              <span>:</span>
            </div>

            <Input
              name="panCard"
              value={values.panCard || ""}
              onChange={(e) =>
                setFieldValue(
                  "panCard",
                  e.target.value.toUpperCase().slice(0, 10)
                )
              }
              onBlur={handleBlur}
              placeholder="Enter PAN Card Number"
              maxLength={10}
              className="w-full h-9"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="sm:w-32 shrink-0 flex justify-between items-center">
              <Label text="संस्थेचे नाव (लागू असल्यास)" />
              <span>:</span>
            </div>

            <Input
              name="organizationName"
              value={values.organizationName || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="संस्थेचे नाव"
              className="w-full h-9"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="sm:w-32 shrink-0 flex justify-between items-center">
              <Label text="संस्थेचा पत्ता (लागू असल्यास)" />
              <span>:</span>
            </div>

            <Input
              name="organizationAddress"
              value={values.organizationAddress || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="संस्थेचा पत्ता"
              className="w-full h-9"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="sm:w-32 shrink-0 flex justify-between items-center">
              <Label required text="व्यवसायचा प्रकार" />
              <span>:</span>
            </div>

            <Select
              value={values.businessType || ""}
              onValueChange={(value) =>
                setFieldValue("businessType", value)
              }
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="व्यवसायचा प्रकार निवडा" />
              </SelectTrigger>

              <SelectContent>
                {businessTypeList.map((item) => (
                  <SelectItem
                    key={item.BUSTYPID}
                    value={String(item.BUSTYPID)}
                  >
                    {item.BUSTYPNAME}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <div className="sm:w-32 shrink-0 flex justify-between items-start">
              <Label required text="व्यवसायचे वर्णन" />
              <span>:</span>
            </div>

            <Input
              name="businessDescription"
              value={values.businessDescription || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full h-9"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="sm:w-32 shrink-0 flex justify-between items-center">
              <Label required text="Zone" />
              <span>:</span>
            </div>

            <Select
              value={values.zoneId || ""}
              onValueChange={(value) =>
                setFieldValue("zoneId", value)
              }
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="-- Select Zone --" />
              </SelectTrigger>

              <SelectContent>
                {zoneList.map((zone) => (
                  <SelectItem
                    key={zone.WARDID}
                    value={String(zone.WARDID)}
                  >
                    {zone.WARDNAME}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicantDetails;