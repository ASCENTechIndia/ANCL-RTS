import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import DepartmentSidebar from "@/components/DepartmentSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import EmployeeNavbar from "@/components/EmployeeNavbar";
import ProtectedRoute from "@/routes/ProtectedRoute";
import config from "@/utils/config";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AdminLayout = () => {
    const { user, token } = useAuth();
    // console.log({ token })
    const [menuData, setMenuData] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEmployeeMenu = async () => {
            if (!user?.userId) {
                return;
            }

            setLoading(true);

            Swal.fire({
                text: "Loading menu...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            try {
                const response = await axios.get(`${BASE_URL}/api/Dashboard/employee-department-menu`,
                    {
                        params: { userId: user.userId, ulbId: user?.ulbId, deptId: config?.deptId },
                        headers: { Authorization: `Bearer ${token}` }
                    },
                );

                const data = response.data?.data?.data || [];
                console.log({data})
                const parentMenus = data.filter((item) => item.TYPE === "M").map((parent) => {
                    const children = data.filter((item) =>
                        Number(item.NUM_MENUMASTER_PARENTMENUID) === Number(parent.NUM_MENUMASTER_MENUID)).map((child) => ({
                            id: child.NUM_MENUMASTER_MENUID,
                            parentId: child.NUM_MENUMASTER_PARENTMENUID,
                            title: child.VAR_MENUMASTER_PAGETITLE,
                            path: child.VAR_MENUMASTER_PAGEPATH,
                            type: child.TYPE,
                        }));

                    return {
                        id: parent.NUM_MENUMASTER_MENUID,
                        parentId: parent.NUM_MENUMASTER_PARENTMENUID,
                        title: parent.VAR_MENUMASTER_PAGETITLE,
                        path: parent.VAR_MENUMASTER_PAGEPATH,
                        type: parent.TYPE,
                        children,
                    };
                }).filter((menu) => menu.children.length > 0);

                setMenuData(parentMenus);
            } catch (error) {
                console.error("Employee menu fetch error:", error);
                setMenuData([]);
                await Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error?.response?.data?.message || error?.response?.data?.error || "Unable to fetch employee menu.",
                });
            } finally {
                setLoading(false);

                if (Swal.isVisible()) {
                    Swal.close();
                }
            }
        };

        fetchEmployeeMenu();
    }, [user?.userId]);

    useEffect(() => {
        sessionStorage.setItem("activeLayout", "admin");
    }, []);

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-[#f4f7fb]">
                {/* <DepartmentSidebar
                    menuData={menuData}
                    selectedMenu={selectedMenu}
                    onMenuSelect={setSelectedMenu}
                /> */}

                <DepartmentSidebar
                    items={menuData}
                    selectedId={selectedMenu?.child?.id}
                    onSelect={setSelectedMenu}
                    title="EMPLOYEE MENU"
                // icon={Building2}
                />

                <SidebarInset className="min-w-0 flex-1">
                    <EmployeeNavbar />

                    <motion.main
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="flex w-full min-w-0 flex-1 flex-col overflow-x-hidden px-2 py-2 sm:px-4 md:px-5 lg:px-6"
                    >
                        <ProtectedRoute>
                            <Outlet context={{ menuData, selectedMenu, setSelectedMenu, loading }} />
                        </ProtectedRoute>
                    </motion.main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};

export default AdminLayout;