import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import DepartmentSidebar from "@/components/DepartmentSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Building2, Baby, Landmark, Map, Store, Heart, Flame, FileCheck, Stethoscope, Droplets, BriefcaseBusiness, Wrench, Waves, HeartPulse, TreePine, Megaphone, ShieldAlert, Trash2, HardHat, BadgeIndianRupee, ChevronRight } from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// const ULB3_DEPARTMENTS = [
//     { id: 1, key: "BirthDeath", name: "Birth & Death", icon: Baby },
//     { id: 7, key: "Property", name: "Property", icon: Landmark },
//     { id: 23, key: "Town Planning", name: "Town Planning", icon: Map },
//     // { id: 18, key: "Market", name: "Market", icon: Store },
//     { id: 25, key: "Marraige", name: "Marriage", icon: Heart },
//     { id: 10, key: "FireBrigade", name: "Fire Brigade", icon: Flame },
//     { id: 290, key: "NOC", name: "NOC", icon: FileCheck },
//     // { id: 1901, key: "Bombay Nursing", name: "Bombay Nursing", icon: Stethoscope },
//     { id: 24, key: "Water", name: "Water", icon: Droplets },
//     { id: 841, key: "TradeLicense", name: "Market / Trade License", icon: BriefcaseBusiness },
//     { id: 26, key: "PWD", name: "PWD", icon: Wrench },
//     { id: 1041, key: "Sewerage", name: "Sewerage", icon: Waves },
//     { id: 503, key: "Health", name: "Health", icon: HardHat },
//     { id: 1042, key: "TreeCutting", name: "Tree Cutting", icon: TreePine },
//     // { id: 725, key: "InformationRelations", name: "Information Relations", icon: Megaphone },
//     // { id: 689, key: "Encroachment", name: "Encroachment", icon: ShieldAlert },
//     { id: 683, key: "SolidWaste", name: "Solid Waste", icon: Trash2 },
//     { id: 3, key: "Advertisement", name: "Advertisement", icon: Megaphone },
// ];

const Layout = () => {
    const { user, requestInitialized } = useAuth();
    console.log({user})
    const ulbId = user?.ulbId;
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    useEffect(() => {
        if (!requestInitialized) {
            return;
        }

        const fetchDepartments = async () => {
            // if (ulbId == 3) {
            //     setDepartments(ULB3_DEPARTMENTS.map((department) => ({ ...department, ulbId: 3 })));
            //     return;
            // }

            Swal.fire({
                text: "Loading departments..",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            try {
                const res = await axios.get(
                    `${BASE_URL}/api/Dashboard/department-menu`,
                    {
                        params: { ulbid: ulbId },
                    }
                );

                const data = res.data?.data?.data || [];

                const mappedDepartments =
                    data.map((item) => ({
                        id: item.DEPTID,
                        name: item.ACCORNAME || item.DEPTNAME,
                        icon: Building2,
                        seqId: item.SEQID,
                        entryId: item.ENTRYID,
                        // path: item.VAR_ENTRY_PATH,
                        deptName: item.DEPTNAME,
                        ulbId: item.ULBID,
                    }));

                setDepartments(mappedDepartments);
            } catch (error) {
                console.error("Department fetch error:", error);
                setDepartments([]);

                await Swal.fire({
                    text: error?.response?.data?.message || error?.response?.data?.error || "Unable to fetch departments.",
                });
            } finally {
                if (Swal.isVisible()) {
                    Swal.close();
                }
            }
        };

        fetchDepartments();
    }, [requestInitialized, ulbId]);

    const handleDepartmentSelect = (department) => {
        setSelectedDepartment(department);
    };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-[#f4f7fb]">
                <DepartmentSidebar
                    items={departments}
                    selectedId={selectedDepartment?.id}
                    onSelect={handleDepartmentSelect}
                    title="DEPARTMENTS"
                    icon={Building2}
                />

                <SidebarInset className="min-w-0 flex-1">
                    <Navbar />
                    <motion.main
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="flex w-full min-w-0 flex-1 flex-col overflow-x-hidden px-2 py-2 sm:px-4 md:px-5 lg:px-6"
                    >
                        <Outlet context={{ departments, selectedDepartment, setSelectedDepartment, handleDepartmentSelect }} />
                    </motion.main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};

export default Layout;