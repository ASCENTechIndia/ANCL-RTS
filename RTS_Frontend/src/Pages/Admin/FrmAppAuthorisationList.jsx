
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ShadCNTable from "@/components/ui/table";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const FrmAppAuthorisationList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  const locationState = location.state || {};
  const queryParams = new URLSearchParams(location.search);
  const authMode = queryParams.get("@");
  const userId = locationState.userId || user?.userId;
  const ulbId = locationState.ulbId || user?.ulbId;

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [headerText, setHeaderText] = useState("Clerk Authorization List");
  const [nextFlag, setNextFlag] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const LIMIT = 20;

  const getHeaders = () => {
    const baseHeaders = [
      "Service Name",
      "Application Number",
      "Application Date",
      "Applicant Name",
      "Mobile Number",
      "Select",
    ];

    if (authMode === "CK") {
      return [
        "Service Name",
        "Application Number",
        "Application Date",
        "Applicant Name",
        "Mobile Number",
        "Application Type",
        "Select",
      ];
    }

    return baseHeaders;
  };

  const getKeyMapping = () => {
    const baseMapping = {
      "Service Name": "SERVICNAME",
      "Application Number": "APLINO",
      "Application Date": "APLIDT",
      "Applicant Name": "APLINM",
      "Mobile Number": "MOBNO",
      Select: "action",
    };

    if (authMode === "CK") {
      return { ...baseMapping, "Application Type": "returnflag" };
    }

    return baseMapping;
  };

  const headers = getHeaders();
  const keyMapping = getKeyMapping();

  useEffect(() => {
    document.title = "Application Authorization List";
    setHeaderTextBasedOnMode(authMode);
    setTableData([]);
    setFilteredData([]);
    setSearchText("");
    setNextFlag(null);
    setHasMore(false);
    fetchApplicationList(null, false);
  }, [authMode]);

  const setHeaderTextBasedOnMode = (mode) => {
    switch (mode) {
      case "CKV":
        setHeaderText("Clerk Document Verification List");
        break;
      case "CK":
        setHeaderText("Clerk Authorization List");
        break;
      case "HODV":
        setHeaderText("HOD Verification List");
        break;
      default:
        setHeaderText("HOD Authorization List");
    }
  };

  // FETCH APPLICATION LIST USING CURSOR FLAG
  const fetchApplicationList = async (flag = null, append = false) => {
    if (loading || loadingMore) return;

    append ? setLoadingMore(true) : setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/frmAppAuth/application-list`,
        {
          userId,
          authMode,
          flag,
          limit: LIMIT,
        },
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Application List Response:", response);

      if (response.data.ok) {
        const payload = response.data.data || {};
        const result = payload.data ?? payload;

        const data = Array.isArray(result)
          ? result
          : result.rows || payload.rows || [];

        const newFlag =
          payload.nextFlag ??
          result.nextFlag ??
          (data.length ? data[data.length - 1].APLINO : null);

        const moreRecords =
          payload.hasMore ??
          result.hasMore ??
          data.length === LIMIT;

        const updatedData = append
          ? [...tableData, ...data]
          : data;

        setTableData(updatedData);
        setNextFlag(newFlag);
        setHasMore(Boolean(moreRecords && newFlag));

        // APPLY EXISTING SEARCH ON UPDATED RECORDS
        if (searchText.trim()) {
          const words = searchText.toLowerCase().split(/\s+/);
          setFilteredData(
            updatedData.filter((row) => {
              const rowString = Object.values(row).join(" ").toLowerCase();
              return words.every((word) => rowString.includes(word));
            })
          );
        } else {
          setFilteredData(updatedData);
        }

        if (!append && data.length === 0) {
          Swal.fire({
            text: "Record Not Found",
            confirmButtonColor: "#1e3a8a",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching application list:", error);
      Swal.fire({
        text:
          error?.response?.data?.error ||
          "Error fetching applications. Please try again.",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // LOAD NEXT RECORDS
  const handleLoadMore = () => {
    if (nextFlag && hasMore && !loadingMore) {
      fetchApplicationList(nextFlag, true);
    }
  };

  const filterGrid = (searchValue) => {
    setSearchText(searchValue);

    if (!searchValue.trim()) {
      setFilteredData(tableData);
      return;
    }

    const words = searchValue.toLowerCase().split(/\s+/);

    const filtered = tableData.filter((row) => {
      const rowString = Object.values(row).join(" ").toLowerCase();
      return words.every((word) => rowString.includes(word));
    });

    setFilteredData(filtered);
  };

  const handleRowSelect = (row) => {
    console.log("Selected Row:", row);

    const selectedData = {
      servicid: row.SERVICID,
      applino: row.APLINO,
      serviceName: row.SERVICNAME,
      departId: row.DEPTID,
    };

    navigate("/app/FrmAppAuthorisationMst", {
      state: {
        selectedData,
        mode: "2",
        authMode,
      },
    });
  };

  const tableRows = filteredData.map((row) => {
    const formattedRow = {};

    formattedRow.SERVICNAME = row.SERVICNAME || "-";
    formattedRow.APLINO = row.APLINO || "-";

    if (row.APLIDT) {
      const date = new Date(row.APLIDT);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = date.toLocaleString("en-IN", { month: "short" });
        const year = date.getFullYear();
        formattedRow.APLIDT = `${day}-${month}-${year}`;
      }
    }

    formattedRow.APLINM = row.APLINM || "";
    formattedRow.MOBNO = row.MOBNO || "";

    if (authMode === "CK") {
      formattedRow.returnflag = row.RETURNFLAG || "";
    }

    formattedRow.action = (
      <Button
        variant="link"
        size="sm"
        className="text-blue-700 hover:text-blue-900 px-0"
        onClick={() => handleRowSelect(row)}
      >
        Select
      </Button>
    );

    return formattedRow;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-semibold boxHead">
            {headerText}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => filterGrid(e.target.value)}
                className="w-full h-9"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading...</p>
              </div>
            </div>
          ) : filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <ShadCNTable
                headers={headers}
                data={tableRows}
                keyMapping={keyMapping}
                pagination={false}
                className="max-md:min-w-380"
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No records found
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-blue-900 hover:bg-blue-800 text-white"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmAppAuthorisationList;
