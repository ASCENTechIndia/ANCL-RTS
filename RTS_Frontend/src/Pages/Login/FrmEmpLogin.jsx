
// import { useState } from "react";
// import { Formik, Form } from "formik";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import Swal from "sweetalert2";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { UserIcon } from "@/components/icons/user";
// import { LockIcon } from "@/components/icons/lock";
// import { ShieldCheckIcon } from "@/components/icons/shield-check";
// import { Eye, EyeOff, ArrowRight, Building2, RefreshCw } from "lucide-react";
// import { useAuth } from "@/context/AuthContext";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// const FrmEmpLogin = () => {
//     const navigate = useNavigate();
//     const { login } = useAuth();
//     const [showPassword, setShowPassword] = useState(false);
//     const [captchaValue, setCaptchaValue] = useState(generateCaptcha());

//     function generateCaptcha() {
//         const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//         let captcha = "";

//         for (let i = 0; i < 5; i++) {
//             captcha += chars.charAt(Math.floor(Math.random() * chars.length));
//         }

//         return captcha;
//     }

//     const refreshCaptcha = () => {
//         setCaptchaValue(generateCaptcha());
//     };

//     const blockClipboard = (e) => {
//         e.preventDefault();
//     };

//     const showError = (message) => {
//         Swal.fire({
//             icon: "error",
//             title: "Validation Error",
//             text: message,
//             confirmButtonColor: "#184aa6",
//         });
//     };

//     const handleLogin = async (values) => {
//         const userId = values.userId.trim();
//         const password = values.password.trim();
//         const captcha = values.captcha.trim();

//         if (!userId) {
//             showError("Please enter User ID");
//             return;
//         }

//         if (!password) {
//             showError("Please enter Password");
//             return;
//         }

//         if (!captcha) {
//             showError("Please enter CAPTCHA");
//             return;
//         }

//         if (captcha !== captchaValue) {
//             showError("Invalid CAPTCHA");
//             refreshCaptcha();
//             return;
//         }

//         try {
//             Swal.fire({
//                 title: "Signing in...",
//                 text: "Please wait while we verify your credentials.",
//                 allowOutsideClick: false,
//                 allowEscapeKey: false,
//                 showConfirmButton: false,
//                 didOpen: () => {
//                     Swal.showLoading();
//                 },
//             });

//             const response = await axios.post(
//                 `${BASE_URL}/api/auth/employee-login`,
//                 {
//                     userId,
//                     password,
//                 }
//             );

//             const result = response.data;
//             const loginData = result?.data;

//             if (!result?.ok) {
//                 throw new Error(result?.message || "Login failed");
//             }

//             if (!loginData?.success || Number(loginData?.errCode) !== 9999) {
//                 throw new Error(loginData?.message || "Invalid User ID or Password");
//             }

//             if (!loginData?.token || !loginData?.user || !loginData?.refreshToken) {
//                 throw new Error("Login token or user information was not returned");
//             }

//             Swal.close();

//             login(
//                 loginData.user,
//                 loginData.token,
//                 loginData?.refreshToken
//             );

//             await Swal.fire({
//                 icon: "success",
//                 text: `Hello ${loginData.user?.username || ""}`,
//                 timer: 1200,
//                 showConfirmButton: false,
//                 confirmButtonColor: "#184aa6",
//             });

//             navigate("/home");
//         } catch (error) {
//             Swal.close();
//             refreshCaptcha();

//             const errorMessage =
//                 error?.response?.data?.message ||
//                 error?.response?.data?.error ||
//                 error?.message ||
//                 "Unable to login. Please try again.";

//             Swal.fire({
//                 title: "Login Failed",
//                 text: errorMessage,
//                 confirmButtonColor: "#184aa6",
//             });
//         }
//     };

//     return (
//         <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-linear-to-br from-blue-50 via-white to-sky-100">
//             <motion.div
//                 initial={{ opacity: 0, y: 30, scale: 0.97 }}
//                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                 transition={{ duration: 0.5, ease: "easeOut" }}
//                 whileHover={{ y: -4 }}
//                 className="relative z-10 w-full max-w-lg"
//             >
//                 <div className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-2xl shadow-blue-900/10 backdrop-blur-xl">
//                     <motion.div
//                         initial={{ opacity: 0, scale: 0.8 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ delay: 0.1, type: "spring", stiffness: 180 }}
//                         whileHover={{ scale: 1.08, rotate: 3 }}
//                         className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-[#184aa6] to-blue-500 shadow-lg shadow-blue-500/30"
//                     >
//                         <Building2 className="h-6 w-6 text-white" />
//                     </motion.div>

//                     <div className="mt-5 text-center">
//                         <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#184aa6]">
//                             RTS Portal
//                         </p>

//                         <h1 className="mt-2 text-2xl font-bold text-slate-800 sm:text-3xl">
//                             Employee Login
//                         </h1>

//                         <p className="mt-2 text-sm text-slate-500">
//                             Sign in to access your workspace
//                         </p>
//                     </div>

//                     <Formik
//                         initialValues={{
//                             userId: "",
//                             password: "",
//                             captcha: "",
//                         }}
//                         onSubmit={handleLogin}
//                     >
//                         {({ values, handleChange }) => (
//                             <Form className="mt-7 space-y-5">
//                                 <motion.div
//                                     initial={{ opacity: 0, x: 15 }}
//                                     animate={{ opacity: 1, x: 0 }}
//                                     transition={{ delay: 0.15 }}
//                                 >
//                                     <div className="grid gap-2">
//                                         <div className="flex items-center gap-1">
//                                             <UserIcon
//                                                 size={19}
//                                                 className="shrink-0 text-[#184aa6]"
//                                             />

//                                             <Label text="User ID" required />
//                                         </div>

//                                         <Input
//                                             id="userId"
//                                             name="userId"
//                                             type="text"
//                                             value={values.userId}
//                                             onChange={handleChange}
//                                             placeholder="Enter your User ID"
//                                             autoComplete="username"
//                                             autoFocus
//                                             onCopy={blockClipboard}
//                                             onPaste={blockClipboard}
//                                             className="h-11 rounded-xl border-gray-300 bg-white/80 text-slate-800 placeholder:text-slate-400 transition-all hover:border-blue-300 focus-visible:border-[#184aa6] focus-visible:ring-[#184aa6]"
//                                         />
//                                     </div>
//                                 </motion.div>

//                                 <motion.div
//                                     initial={{ opacity: 0, x: 15 }}
//                                     animate={{ opacity: 1, x: 0 }}
//                                     transition={{ delay: 0.2 }}
//                                 >
//                                     <div className="grid gap-2">
//                                         <div className="flex items-center gap-1">
//                                             <LockIcon
//                                                 size={19}
//                                                 className="shrink-0 text-[#184aa6]"
//                                             />

//                                             <Label text="Password" required />
//                                         </div>

//                                         <div className="relative">
//                                             <Input
//                                                 id="password"
//                                                 name="password"
//                                                 type={showPassword ? "text" : "password"}
//                                                 value={values.password}
//                                                 onChange={handleChange}
//                                                 placeholder="Enter your password"
//                                                 autoComplete="current-password"
//                                                 onCopy={blockClipboard}
//                                                 onPaste={blockClipboard}
//                                                 className="h-11 rounded-xl border-gray-300 bg-white/80 pr-12 text-slate-800 placeholder:text-slate-400 transition-all hover:border-blue-300 focus-visible:border-[#184aa6] focus-visible:ring-[#184aa6]"
//                                             />

//                                             <button
//                                                 type="button"
//                                                 onClick={() =>
//                                                     setShowPassword((prev) => !prev)
//                                                 }
//                                                 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-[#184aa6]"
//                                                 aria-label={
//                                                     showPassword
//                                                         ? "Hide password"
//                                                         : "Show password"
//                                                 }
//                                             >
//                                                 {showPassword ? (
//                                                     <EyeOff size={19} />
//                                                 ) : (
//                                                     <Eye size={19} />
//                                                 )}
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </motion.div>

//                                 <motion.div
//                                     initial={{ opacity: 0, x: 15 }}
//                                     animate={{ opacity: 1, x: 0 }}
//                                     transition={{ delay: 0.25 }}
//                                 >
//                                     <div className="grid gap-2">
//                                         <div className="flex items-center gap-1">
//                                             <ShieldCheckIcon
//                                                 size={19}
//                                                 className="shrink-0 text-[#184aa6]"
//                                             />

//                                             <Label text="CAPTCHA" required />
//                                         </div>

//                                         <div className="flex gap-2">
//                                             <Input
//                                                 value={captchaValue}
//                                                 readOnly
//                                                 tabIndex={-1}
//                                                 className="h-11 flex-1 cursor-default select-none border-0 bg-[#d7e2f8] text-center font-mono text-lg font-bold tracking-[5px] text-[#184aa6]"
//                                             />

//                                             <Button
//                                                 type="button"
//                                                 variant="outline"
//                                                 onClick={refreshCaptcha}
//                                                 title="Refresh CAPTCHA"
//                                                 className="h-11 w-11 shrink-0 border-gray-300"
//                                             >
//                                                 <RefreshCw size={17} />
//                                             </Button>
//                                         </div>

//                                         <Input
//                                             id="captcha"
//                                             name="captcha"
//                                             type="text"
//                                             value={values.captcha}
//                                             onChange={handleChange}
//                                             placeholder="Enter CAPTCHA"
//                                             autoComplete="off"
//                                             onCopy={blockClipboard}
//                                             onPaste={blockClipboard}
//                                             maxLength={5}
//                                             className="h-11 rounded-xl border-gray-300 bg-white/80 text-slate-800 placeholder:text-slate-400 transition-all hover:border-blue-300 focus-visible:border-[#184aa6] focus-visible:ring-[#184aa6]"
//                                         />
//                                     </div>
//                                 </motion.div>

//                                 <motion.div
//                                     initial={{ opacity: 0, y: 10 }}
//                                     animate={{ opacity: 1, y: 0 }}
//                                     transition={{ delay: 0.3 }}
//                                     whileHover={{ scale: 1.01 }}
//                                     whileTap={{ scale: 0.98 }}
//                                 >
//                                     <Button
//                                         type="submit"
//                                         className="group h-11 w-full rounded-xl bg-linear-to-r from-[#184aa6] to-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-500 hover:shadow-blue-500/40"
//                                     >
//                                         Login

//                                         <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
//                                     </Button>
//                                 </motion.div>
//                             </Form>
//                         )}
//                     </Formik>
//                 </div>
//             </motion.div>

//             <p className="absolute bottom-4 text-center text-xs text-slate-400">
//                 © {new Date().getFullYear()} RTS Portal
//             </p>
//         </main>
//     );
// };

// export default FrmEmpLogin;


import React, { useState } from "react";
import { Formik, Form } from "formik";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Eye, EyeOff, RefreshCw, ArrowRight, Building2 } from "lucide-react";
import { UserIcon } from "@/components/icons/user";
import { LockIcon } from "@/components/icons/lock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheckIcon } from "@/components/icons/shield-check";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const FrmEmpLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [captchaValue, setCaptchaValue] = useState(generateCaptcha());

    const refreshCaptcha = () => setCaptchaValue(generateCaptcha());

    const handleLogin = async (values) => {
        const userId = values.loginId?.trim();
        const password = values.loginSecret?.trim();
        const captcha = values.securityCode?.trim();

        if (!userId) {
            Swal.fire({ text: "Please enter User ID", confirmButtonColor: "#184aa6" });
            return;
        }

        if (!password) {
            Swal.fire({ text: "Please enter Password", confirmButtonColor: "#184aa6" });
            return;
        }

        if (!captcha) {
            Swal.fire({ text: "Please enter Captcha", confirmButtonColor: "#184aa6" });
            return;
        }

        if (captcha !== captchaValue) {
            Swal.fire({ text: "Invalid Captcha", confirmButtonColor: "#184aa6" });
            refreshCaptcha();
            return;
        }

        try {
            Swal.fire({
                text: "Please wait while we verify your credentials.",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await axios.post(`${BASE_URL}/api/auth/employee-login`, { userId, password });
            const result = response.data;
            const loginData = result?.data;

            if (!result?.ok) throw new Error(result?.message || "Login failed");
            if (!loginData?.success || Number(loginData?.errCode) !== 9999) throw new Error(loginData?.message || "Invalid User ID or Password");
            if (!loginData?.token || !loginData?.user || !loginData?.refreshToken) throw new Error("Login token or user information was not returned");

            Swal.close();
            login(loginData.user, loginData.token, loginData.refreshToken);

            await Swal.fire({
                icon: "success",
                text: `Hello ${loginData.user?.username || ""}`,
                timer: 1200,
                showConfirmButton: false,
                confirmButtonColor: "#184aa6"
            });

            navigate("/home");
        } catch (error) {
            Swal.close();
            refreshCaptcha();

            const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Unable to login. Please try again.";

            Swal.fire({
                text: errorMessage,
                confirmButtonColor: "#184aa6"
            });
        }
    };

    return (
        <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8 font-[Poppins]">
            <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .4 }}
                className="relative z-10 w-full max-w-130"
            >
                <div className="rounded-2xl border border-white/70 bg-white/60 p-7 shadow-[0_20px_60px_rgba(30,64,175,0.12)] backdrop-blur-xl sm:p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 180 }}
                        whileHover={{ scale: 1.08, rotate: 3 }}
                        className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-[#184aa6] to-blue-500 shadow-lg shadow-blue-500/30"
                    >
                        <Building2 className="h-6 w-6 text-white" />
                    </motion.div>
                    <div className="my-4">
                        <h2 className="text-lg font-semibold text-slate-900">Employee Login</h2>
                        <p className="mt-1 text-xs text-slate-500">Use your employee credentials to continue.</p>
                    </div>

                    <Formik initialValues={{ loginId: "", loginSecret: "", securityCode: "" }} onSubmit={handleLogin}>
                        {({ values, errors, touched, handleChange, handleBlur }) => (
                            <Form className="space-y-2" autoComplete="off">

                                <div className="grid gap-2">
                                    <div className="flex items-center gap-1">
                                        <UserIcon size={19} className="shrink-0 text-[#184aa6]" />
                                        <Label text="User ID" required />
                                    </div>

                                    <Input
                                        id="employee-login-id"
                                        name="loginId"
                                        type="text"
                                        value={values.loginId}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Enter your User ID"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="none"
                                        spellCheck="false"
                                        className={`h-11 rounded-xl border-gray-300 bg-white/80 text-slate-800 placeholder:text-slate-400 transition-all hover:border-blue-300 focus-visible:border-[#184aa6] focus-visible:ring-[#184aa6] ${touched.loginId && errors.loginId ? "border-red-400" : ""}`}
                                    />

                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center gap-1">
                                        <LockIcon size={19} className="shrink-0 text-[#184aa6]" />
                                        <Label text="Password" required />
                                    </div>

                                    <div className="relative">
                                        <Input
                                            id="employee-login-secret"
                                            name="loginSecret"
                                            type="text"
                                            value={values.loginSecret}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Enter your password"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            autoCapitalize="none"
                                            spellCheck="false"
                                            style={{ WebkitTextSecurity: showPassword ? "none" : "disc" }}
                                            className={`h-11 rounded-xl border-gray-300 bg-white/80 pr-12 text-slate-800 placeholder:text-slate-400 transition-all hover:border-blue-300 focus-visible:border-[#184aa6] focus-visible:ring-[#184aa6] ${touched.loginSecret && errors.loginSecret ? "border-red-400" : ""}`}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(prev => !prev)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-[#184aa6]"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                                        </button>
                                    </div>

                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <ShieldCheckIcon size={18} className="shrink-0 text-[#184aa6]" />
                                            <Label text="Security Code" required />
                                        </div>

                                        <span className="text-[10px] text-slate-400">Verification</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="relative flex h-11 flex-1 items-center justify-center overflow-hidden rounded-xl border border-gray-300 bg-white/80">
                                            <div className="absolute inset-0 opacity-[0.12]" />
                                            <span className="relative select-none font-mono text-lg font-bold tracking-[0.28em] text-slate-700">{captchaValue}</span>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={refreshCaptcha}
                                            className="h-11 w-11 rounded-xl border-gray-300 bg-white/80 p-0 hover:border-[#184aa6] hover:bg-white"
                                            title="Refresh security code"
                                        >
                                            <RefreshCw size={17} className="text-[#184aa6]" />
                                        </Button>
                                    </div>

                                    <Input
                                        id="employee-security-code"
                                        name="securityCode"
                                        type="text"
                                        value={values.securityCode}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Enter security code"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="none"
                                        spellCheck="false"
                                        className={`h-11 rounded-xl border-gray-300 bg-white/80 text-slate-800 placeholder:text-slate-400 transition-all hover:border-blue-300 focus-visible:border-[#184aa6] focus-visible:ring-[#184aa6] ${touched.securityCode && errors.securityCode ? "border-red-400" : ""}`}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="group h-11 w-full rounded-xl bg-linear-to-r from-[#184aa6] to-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-500 hover:shadow-blue-500/40"
                                >
                                    Login
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </Button>
                            </Form>
                        )}
                    </Formik>

                    <div className="mt-5 flex items-center justify-center gap-1.5 border-t border-slate-200/70 pt-4">
                        <ShieldCheckIcon className=" text-blue-500" />
                        <p className="text-[10px] text-slate-400">Authorized employee access only</p>
                    </div>
                </div>

                <p className="mt-2 text-center text-[10px] text-slate-400"> © {new Date().getFullYear()} RTS Employee Portal</p>
            </motion.div>
        </main>
    );
};

export default FrmEmpLogin;