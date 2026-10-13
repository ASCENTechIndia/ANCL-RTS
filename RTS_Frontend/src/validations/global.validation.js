import { z } from "zod";

const mobileRegex = /^\d{10}$/;
const aadharRegex = /^\d{12}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const pincodeRegex = /^\d{6}$/;

const emailValidationAlt = z.string()
  .transform((val) => {
    if (!val) return val;
    return val.trim().toLowerCase();
  })
  .refine((val) => val && val.length > 0, "Email ID is required")
  .refine((val) => emailRegex.test(val), "Invalid Email Address");

const emailValidation = z.string()
  .min(1, "Email ID is required")
  .transform((val) => {
    if (!val) return val;
    return val.trim().toLowerCase();
  })
  .refine((val) => val && val.length > 0, "Email ID is required")
  .refine((val) => emailRegex.test(val), "Invalid Email Address");

const emailValidationCaseSensitive = z.string()
  .min(1, "Email ID is required")
  .transform((val) => val.trim())
  .refine((val) => val && val.length > 0, "Email ID is required")
  .refine((val) => emailRegex.test(val), "Invalid Email Address");

const MAX_EMAIL_LENGTH = 254;
const emailValidationWithMaxLength = z.string()
  .min(1, "Email ID is required")
  .transform((val) => val.trim().toLowerCase())
  .refine((val) => val && val.length > 0, "Email ID is required")
  .refine((val) => val.length <= MAX_EMAIL_LENGTH, `Email cannot exceed ${MAX_EMAIL_LENGTH} characters`)
  .refine((val) => emailRegex.test(val), "Invalid Email Address");

export const propertySearchValidationSchema = z.object({
  ptn: z.string()
    .min(1, "Property Number is required")
    .refine((val) => val !== undefined && val !== null && val !== "", {
      message: "Please enter Property Number",
    }),
  subcode: z.string().optional(),
});

export const applicantDetailsValidationSchema = z.object({
  applicantName: z.string()
    .min(1, "Applicant Name is required")
    .refine((val) => val !== undefined && val !== null && val !== "", {
      message: "Please enter Applicant Name",
    }),
  mobileNo: z.string()
    .min(1, "Mobile Number is required")
    .regex(mobileRegex, "Mobile Number must be 10 digits")
    .refine((val) => val !== undefined && val !== null && val !== "", {
      message: "Please enter Mobile Number",
    }),
  emailId: emailValidationAlt,
  zoneId: z.string()
    .min(1, "Please select a Zone")
    .refine((val) => val !== undefined && val !== null && val !== "" && val !== "0" && val !== "-1", {
      message: "Please select a Zone",
    }),
});

export const documentValidationSchema = z.array(
  z.object({
    id: z.union([z.number(), z.string()]).optional(),
    docId: z.union([z.number(), z.string()]).optional(),
    docName: z.string().optional().default(""),
    docType: z.string().optional(),
    fileBuffer: z.any().optional(),
    file: z.any().nullable().optional(),
  })
).refine((docs) => {
  return docs && docs.length > 0 && docs.every(doc => doc.file !== null && doc.file !== undefined && doc.file !== "");
}, {
  message: "All documents are compulsory. Please upload all required documents.",
});

export const propertyTransferSearchSchema = z.object({
  ptn: z.string()
    .min(1, "Please enter Property Number")
    .default("")
    .refine((val) => val && val.trim() !== "", "Please enter Property Number"),
  subcode: z.string().optional().default(""),
});

export const propertyTransferApplicantSchema = z.object({
  newOwnerName: z.string()
    .min(1, "Please enter Owner Name")
    .default("")
    .refine((val) => val && val.trim() !== "", "Please enter Owner Name"),
  emailId: emailValidationAlt,
  newAddress: z.string()
    .min(1, "Please enter Address")
    .default("")
    .refine((val) => val && val.trim() !== "", "Please enter Address"),
  mobileNo: z.string()
    .min(1, "Please enter Mobile Number")
    .regex(mobileRegex, "Mobile Number must be 10 digits")
    .default("")
    .refine((val) => val && val.trim() !== "", "Please enter Mobile Number"),
  aadharNo: z.string()
    .optional()
    .default("")
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      return aadharRegex.test(val);
    }, "Aadhar Number must be 12 digits"),
  transferType: z.string()
    .min(1, "Please select Transfer Type")
    .default("")
    .refine((val) => val && val.trim() !== "", "Please select Transfer Type"),
  zoneId: z.string()
    .min(1, "Please select a Zone")
    .refine((val) => val !== undefined && val !== null && val !== "" && val !== "0" && val !== "-1", {
      message: "Please select a Zone",
    }),
});

export const propertyTransferDocumentValidationSchema = z.array(
  z.object({
    docId: z.union([z.string(), z.number()]).default(0),
    docName: z.string().default(""),
    docType: z.string().optional().default("PDF"),
    fileBuffer: z.any().optional(),
    file: z.any().nullable().optional(),
  })
).refine((docs) => {
  return docs && docs.length > 0 && docs.some(doc => doc.file !== null && doc.file !== undefined && doc.file !== "");
}, {
  message: "Please upload at least one document",
});

export const propertyRebateValidationSchema = z.object({
  applicantName: z.string()
    .min(1, "Applicant Name cannot be blank")
    .refine((val) => val && val.trim() !== "", "Applicant Name cannot be blank"),
  mobileNo: z.string()
    .min(1, "Mobile Number cannot be blank")
    .regex(mobileRegex, "Invalid Mobile Number"),
  emailId: emailValidationAlt,
  aadharNo: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      return aadharRegex.test(val);
    }, "Please enter valid Aadhar No"),
  pincode: z.string()
    .min(1, "Pincode cannot be blank")
    .regex(/^\d{6}$/, "Invalid Pincode"),
  rebateType: z.string()
    .refine((val) => {
      return true;
    }, "Please Select Rebate Type"),
  remark: z.string()
    .min(1, "Remark cannot be blank"),
  landHolder: z.string().optional(),
  structureHolder: z.string().optional(),
  ownerDetails: z.string().optional(),
  address: z.string().optional(),
  zoneId: z.string()
    .min(1, "Please select a Zone")
    .refine((val) => val !== undefined && val !== null && val !== "" && val !== "0" && val !== "-1", {
      message: "Please select a Zone",
    }),
});


export const serviceApplicationValidationSchema = (
  serviceId,
) =>
  z
    .object({
      appName: z
        .string()
        .trim()
        .min(
          1,
          "Please Enter Application Name",
        ),

      address: z
        .string()
        .optional()
        .default(""),

      mobile: z
        .string()
        .trim()
        .min(
          1,
          "Please Enter Mobile No",
        )
        .regex(
          mobileRegex,
          "Mobile Number must be 10 digits",
        ),



      aadharNo: z
        .string()
        .optional()
        .default("")
        .refine(
          (value) => {
            if (!value?.trim()) {
              return true;
            }

            return aadharRegex.test(
              value.trim(),
            );
          },
          {
            message:
              "Aadhar Number must be 12 digits",
          },
        ),

      refNo: z
        .string()
        .optional()
        .default(""),

      zoneId: z
        .string()
        .optional()
        .default(""),

      sectorId: z
        .string()
        .optional()
        .default(""),

      villageId: z
        .string()
        .optional()
        .default(""),

      locality: z
        .string()
        .optional()
        .default(""),

      landmark: z
        .string()
        .optional()
        .default(""),

      pincode: z
        .string()
        .optional()
        .default(""),

      documents: documentValidationSchema,
    })
    .superRefine((values, ctx) => {
      const isSectorService = [
        "60",
        "62",
      ].includes(String(serviceId));

      const isAddressService = [
        "41",
        "461",
      ].includes(String(serviceId));

      /*
       * Service 60 / 62
       * Sector + Village required
       */
      if (isSectorService) {
        if (
          !values.sectorId ||
          values.sectorId === "0" ||
          values.sectorId === "-1"
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["sectorId"],
            message:
              "Please select Sector",
          });
        }

        if (
          !values.villageId ||
          values.villageId === "0" ||
          values.villageId === "-1"
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["villageId"],
            message:
              "Please select Village",
          });
        }
      } else {
        /*
         * Other services
         * Prabhag required
         */
        if (
          !values.zoneId ||
          values.zoneId === "0" ||
          values.zoneId === "-1"
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["zoneId"],
            message:
              "Please select Prabhag",
          });
        }
      }

      /*
       * Service 41 / 461
       * Address + Locality + Landmark + Pincode
       */
      if (isAddressService) {
        if (!values.address?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["address"],
            message:
              "Please Enter Address",
          });
        }

        if (!values.locality?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["locality"],
            message:
              "Please Enter Locality",
          });
        }

        if (!values.landmark?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["landmark"],
            message:
              "Please Enter LandMark",
          });
        }

        if (!values.pincode?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["pincode"],
            message:
              "Please Enter Pincode",
          });
        } else if (
          !/^\d{6}$/.test(
            values.pincode,
          )
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["pincode"],
            message:
              "Invalid Pincode",
          });
        }
      }
    });




export const commonValidationSchema = {
  mobile: z.string()
    .min(1, "Mobile Number is required")
    .regex(mobileRegex, "Mobile Number must be 10 digits"),

  // aadhar: z.string()
  //   .min(1, "Aadhar Card No is required")
  //   .regex(aadharRegex, "Aadhar Card No must be 12 digits"),

  // email: z.string()
  //   .min(1, "Email ID is required")
  //   .regex(emailRegex, "Invalid Email Address"),

  pincode: z.string()
    .min(1, "Pincode is required")
    .regex(pincodeRegex, "Invalid Pincode"),

  name: z.string()
    .min(1, "Name is required")
    .max(200, "Name cannot exceed 200 characters"),

  address: z.string()
    .min(1, "Address is required")
    .max(500, "Address cannot exceed 500 characters"),

  selectOption: z.string()
    .min(1, "Please select an option")
    .refine((val) => val !== "0" && val !== "-1" && val !== "", {
      message: "Please select a valid option",
    }),
};

export const createPersonValidationSchema = (personType) => {
  const prefix = personType === "priest" ? "Priest" : 
                  personType === "husband" ? "Husband" :
                  personType === "wife" ? "Wife" : "Witness";

  const requiresAadharEmail = personType === "husband" || personType === "wife";
  const requiresBeforeMarriageDocs = personType === "husband" || personType === "wife";
  
  return z.object({
    photo: z.any().nullable().optional(),
    photoPreview: z.string().optional(),
    thumb: z.any().nullable().optional(),
    thumbPreview: z.string().optional(),
    englishFirstName: z.string().min(1, `${prefix}: English First Name is required`),
    englishMiddleName: z.string().min(1, `${prefix}: English Middle Name is required`),
    englishLastName: z.string().min(1, `${prefix}: English Last Name is required`),
    marathiFirstName: z.string().min(1, `${prefix}: Marathi First Name is required`),
    marathiMiddleName: z.string().min(1, `${prefix}: Marathi Middle Name is required`),
    marathiLastName: z.string().min(1, `${prefix}: Marathi Last Name is required`),
    aadharNo: requiresAadharEmail 
      ? z.string().min(1, `${prefix}: Aadhar Card No is required`).regex(aadharRegex, `${prefix}: Aadhar Card No must be 12 digits`)
      : z.string().optional(),
    contact: commonValidationSchema.mobile,
    email: requiresAadharEmail
      ? emailValidationAlt
      : z.string().optional(),
    birthDate: z.union([z.string(), z.date(), z.null(), z.undefined()])
      .refine((val) => val !== null && val !== undefined && val !== "", {
        message: `${prefix}: Date of Birth is required`,
      }),
    age: z.string().optional(),
    documentType: z.string().optional(),
    documentNo: z.string().optional(),
    relation: z.string().optional(),
    maritalStatus: z.string().optional(),
    disability: z.string().optional(),
    birthReligion: z.string().optional(),
    adoptedReligion: z.string().optional(),
    englishAddress: commonValidationSchema.address,
    marathiAddress: commonValidationSchema.address,
    idDocument: requiresBeforeMarriageDocs
      ? z.string().min(1, `${prefix}: Please Select ID Document`)
      : z.string().optional(),
    idDocumentFile: requiresBeforeMarriageDocs
      ? z.any().nullable().optional()
      : z.any().nullable().optional(),
      
    addressDocument: requiresBeforeMarriageDocs
      ? z.string().min(1, `${prefix}: Please Select Address Document`)
      : z.string().optional(),
    addressDocumentFile: requiresBeforeMarriageDocs
      ? z.any().nullable().optional()
      : z.any().nullable().optional(),
      
    ageDocument: requiresBeforeMarriageDocs
      ? z.string().min(1, `${prefix}: Please Select Age Document`)
      : z.string().optional(),
    ageDocumentFile: requiresBeforeMarriageDocs
      ? z.any().nullable().optional()
      : z.any().nullable().optional(),
  });
};

export const priestValidationSchema = z.object({
  englishFirstName: z.string().min(1, "Priest: English First Name is required"),
  englishMiddleName: z.string().min(1, "Priest: English Middle Name is required"),
  englishLastName: z.string().min(1, "Priest: English Last Name is required"),
  marathiFirstName: z.string().min(1, "Priest: Marathi First Name is required"),
  marathiMiddleName: z.string().min(1, "Priest: Marathi Middle Name is required"),
  marathiLastName: z.string().min(1, "Priest: Marathi Last Name is required"),
  age: z.string()
    .min(1, "Priest: Age is required")
    .regex(/^\d+$/, "Priest: Age must be a valid number"),
  birthReligion: commonValidationSchema.selectOption,
  englishAddress: commonValidationSchema.address,
  marathiAddress: commonValidationSchema.address,
});

export const applicationValidationSchema = z.object({
  zone: commonValidationSchema.selectOption,
  applicantFirstName: commonValidationSchema.name,
  applicantMiddleName: commonValidationSchema.name,
  applicantLastName: commonValidationSchema.name,
  mobileNo: commonValidationSchema.mobile,
  address: commonValidationSchema.address,
  marriageDate: z.union([z.string(), z.date(), z.null(), z.undefined()])
    .refine((val) => val !== null && val !== undefined && val !== "", {
      message: "Marriage Date is required",
    }),
  marriagePlaceEnglish: commonValidationSchema.address,
  marriagePlaceMarathi: commonValidationSchema.address,
  documents: z.array(
    z.object({
      id: z.union([z.number(), z.string()]).optional(),
      selected: z.boolean().optional(),
      documentType: z.string().optional(),
      file: z.any().nullable().optional(),
    })
  ).optional(),
});

export const documentGridValidationSchema = z.array(
  z.object({
    id: z.union([z.number(), z.string()]).optional(),
    selected: z.boolean().optional(),
    documentType: z.string().optional(),
    file: z.any().nullable().optional(),
  })
).refine((docs) => {
  if (!docs || docs.length === 0) return false;
  const selectedDocs = docs.filter(doc => doc.selected === true);
  if (selectedDocs.length === 0) return false;
  const allHaveFile = selectedDocs.every(doc => doc.file !== null && doc.file !== undefined);
  return allHaveFile;
}, {
  message: "Please select at least one document and upload the corresponding file.",
});

export const husbandAgeValidation = z.object({
  marriageDate: z.union([z.string(), z.date(), z.null(), z.undefined()])
    .refine((val) => val !== null && val !== undefined && val !== "", {
      message: "Marriage Date is required to calculate age",
    }),
  birthDate: z.union([z.string(), z.date(), z.null(), z.undefined()])
    .refine((val) => val !== null && val !== undefined && val !== "", {
      message: "Husband: Date of Birth is required",
    }),
}).refine((data) => {
  if (!data.marriageDate || !data.birthDate) return false;
  const marriage = new Date(data.marriageDate);
  const birth = new Date(data.birthDate);
  if (isNaN(marriage) || isNaN(birth)) return false;
  let age = marriage.getFullYear() - birth.getFullYear();
  const monthDiff = marriage.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && marriage.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 21;
}, {
  message: "Husband: Age must be 21 years or greater. Please enter a valid Date of Birth",
});

export const wifeAgeValidation = z.object({
  marriageDate: z.union([z.string(), z.date(), z.null(), z.undefined()])
    .refine((val) => val !== null && val !== undefined && val !== "", {
      message: "Marriage Date is required to calculate age",
    }),
  birthDate: z.union([z.string(), z.date(), z.null(), z.undefined()])
    .refine((val) => val !== null && val !== undefined && val !== "", {
      message: "Wife: Date of Birth is required",
    }),
}).refine((data) => {
  if (!data.marriageDate || !data.birthDate) return false;
  const marriage = new Date(data.marriageDate);
  const birth = new Date(data.birthDate);
  if (isNaN(marriage) || isNaN(birth)) return false;
  let age = marriage.getFullYear() - birth.getFullYear();
  const monthDiff = marriage.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && marriage.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 18;
}, {
  message: "Wife: Age must be 18 years or greater. Please enter a valid Date of Birth",
});

export const witnessAgeValidation = (witnessNumber) => {
  const prefix = `Witness ${witnessNumber}`;
  return z.object({
    marriageDate: z.union([z.string(), z.date(), z.null(), z.undefined()])
      .refine((val) => val !== null && val !== undefined && val !== "", {
        message: "Marriage Date is required to calculate age",
      }),
    birthDate: z.union([z.string(), z.date(), z.null(), z.undefined()])
      .refine((val) => val !== null && val !== undefined && val !== "", {
        message: `${prefix}: Date of Birth is required`,
      }),
  }).refine((data) => {
    if (!data.marriageDate || !data.birthDate) return false;
    const marriage = new Date(data.marriageDate);
    const birth = new Date(data.birthDate);
    if (isNaN(marriage) || isNaN(birth)) return false;
    let age = marriage.getFullYear() - birth.getFullYear();
    const monthDiff = marriage.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && marriage.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 21;
  }, {
    message: `${prefix}: Age must be 21 years or greater. Please enter a valid Date of Birth`,
  });
};

export const marriageRegistrationSchema = z.object({
  application: applicationValidationSchema,
  husband: createPersonValidationSchema("husband"),
  wife: createPersonValidationSchema("wife"),
  witness1: createPersonValidationSchema("witness"),
  witness2: createPersonValidationSchema("witness"),
  witness3: createPersonValidationSchema("witness"),
  priest: priestValidationSchema,
})
.superRefine((data, ctx) => {
  const result = husbandAgeValidation.safeParse({
    marriageDate: data.application.marriageDate,
    birthDate: data.husband.birthDate,
  });
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      ctx.addIssue({
        ...issue,
        path: ["husband", "birthDate"],
      });
    });
  }
})
.superRefine((data, ctx) => {
  const result = wifeAgeValidation.safeParse({
    marriageDate: data.application.marriageDate,
    birthDate: data.wife.birthDate,
  });
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      ctx.addIssue({
        ...issue,
        path: ["wife", "birthDate"],
      });
    });
  }
})
.superRefine((data, ctx) => {
  const result = witnessAgeValidation(1).safeParse({
    marriageDate: data.application.marriageDate,
    birthDate: data.witness1.birthDate,
  });
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      ctx.addIssue({
        ...issue,
        path: ["witness1", "birthDate"],
      });
    });
  }
})
.superRefine((data, ctx) => {
  const result = witnessAgeValidation(2).safeParse({
    marriageDate: data.application.marriageDate,
    birthDate: data.witness2.birthDate,
  });
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      ctx.addIssue({
        ...issue,
        path: ["witness2", "birthDate"],
      });
    });
  }
})
.superRefine((data, ctx) => {
  const result = witnessAgeValidation(3).safeParse({
    marriageDate: data.application.marriageDate,
    birthDate: data.witness3.birthDate,
  });
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      ctx.addIssue({
        ...issue,
        path: ["witness3", "birthDate"],
      });
    });
  }
});


export const step0ValidationSchema = z.object({
  firstName: z.string()
    .min(1, "First Name can not be blank")
    .refine((val) => val && val.trim() !== "", "First Name can not be blank"),
  
  firstNameM: z.string()
    .min(1, "First Name in Marathi can not be blank")
    .refine((val) => val && val.trim() !== "", "First Name in Marathi can not be blank"),
  
  middleName: z.string()
    .min(1, "Middle Name can not be blank")
    .refine((val) => val && val.trim() !== "", "Middle Name can not be blank"),
  
  middleNameM: z.string()
    .min(1, "Middle Name in Marathi can not be blank")
    .refine((val) => val && val.trim() !== "", "Middle Name in Marathi can not be blank"),
  
  lastName: z.string()
    .min(1, "Last Name can not be blank")
    .refine((val) => val && val.trim() !== "", "Last Name can not be blank"),
  
  lastNameM: z.string()
    .min(1, "Last Name in Marathi can not be blank")
    .refine((val) => val && val.trim() !== "", "Last Name in Marathi can not be blank"),
  
  mobileNo: z.union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return "";
      return String(val);
    })
    .refine((val) => {
      if (!val || val === "" || val === "0") return true;
      return /^\d{10}$/.test(val);
    }, "Invalid Mobile No. Mobile number must be 10 digits"),
    
  email: z.string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return "";
      return val.trim().toLowerCase();
    })
    .refine((val) => {
      if (!val || val === "") return true;
      return emailRegex.test(val);
    }, "Invalid Email Address"),
  
  address: z.string()
    .min(1, "Address can not be blank")
    .refine((val) => val && val.trim() !== "", "Address can not be blank"),
  
  addressM: z.string()
    .min(1, "Address in Marathi can not be blank")
    .refine((val) => val && val.trim() !== "", "Address in Marathi can not be blank"),
  
  purpose: z.string()
    .min(1, "Purpose can not be blank")
    .refine((val) => val && val.trim() !== "", "Purpose can not be blank"),
  
  purposeM: z.string()
    .min(1, "Purpose in Marathi can not be blank")
    .refine((val) => val && val.trim() !== "", "Purpose in Marathi can not be blank"),
  
  zoneId: z.union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => {
      if (!val || val === "" || val === "0" || val === "-1") return false;
      return true;
    }, "Please select a Zone"),
});



export const waterApplicationValidationSchema = z
  .object({
    zoneId: commonValidationSchema.selectOption,

    applicantFirstName: z
      .string()
      .trim()
      .min(1, "Applicant First Name is required")
      .max(100, "Applicant First Name cannot exceed 100 characters")
      .regex(/^[A-Za-z ]+$/, "Applicant First Name can contain only letters"),

    applicantMiddleName: z
      .string()
      .trim()
      .min(1, "Applicant Middle Name is required")
      .max(100, "Applicant Middle Name cannot exceed 100 characters")
      .regex(/^[A-Za-z ]+$/, "Applicant Middle Name can contain only letters"),

    applicantLastName: z
      .string()
      .trim()
      .min(1, "Applicant Last Name is required")
      .max(100, "Applicant Last Name cannot exceed 100 characters")
      .regex(/^[A-Za-z ]+$/, "Applicant Last Name can contain only letters"),

    applicantFirstNameMarathi: z
      .string()
      .trim()
      .min(1, "Applicant First Name in Marathi is required")
      .max(100, "Applicant First Name in Marathi cannot exceed 100 characters"),

    applicantMiddleNameMarathi: z
      .string()
      .trim()
      .min(1, "Applicant Middle Name in Marathi is required")
      .max(100, "Applicant Middle Name in Marathi cannot exceed 100 characters"),

    applicantLastNameMarathi: z
      .string()
      .trim()
      .min(1, "Applicant Last Name in Marathi is required")
      .max(100, "Applicant Last Name in Marathi cannot exceed 100 characters"),

    mobileNumber: z
      .string()
      .trim()
      .min(1, "Mobile Number is required")
      .length(10, "Mobile Number must be exactly 10 digits")
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10 digit mobile number"),

    email: z
      .string()
      .trim()
      .min(1, "Email ID is required")
      .max(254, "Email ID cannot exceed 254 characters")
      .regex(emailRegex, "Please enter a valid Email Address"),

    aadharCardNo: z
      .string()
      .trim()
      .min(1, "Aadhar Card Number is required")
      .length(12, "Aadhar Card Number must be exactly 12 digits")
      .regex(/^\d{12}$/, "Aadhar Card Number must contain only 12 digits"),

    propertyNumber: z
      .string()
      .trim()
      .min(1, "Property Number is required")
      .max(50, "Property Number cannot exceed 50 characters"),

    residentialNumber: z
      .string()
      .trim()
      .min(1, "Residential Number is required")
      .max(50, "Residential Number cannot exceed 50 characters"),

    address: z
      .string()
      .trim()
      .min(1, "Address is required")
      .max(500, "Address cannot exceed 500 characters"),

    addressMarathi: z
      .string()
      .trim()
      .min(1, "Address in Marathi is required")
      .max(500, "Address in Marathi cannot exceed 500 characters"),

    consumerFirstName: z
      .string()
      .trim()
      .min(1, "Consumer First Name is required")
      .max(100, "Consumer First Name cannot exceed 100 characters")
      .regex(/^[A-Za-z ]+$/, "Consumer First Name can contain only letters"),

    consumerMiddleName: z
      .string()
      .trim()
      .min(1, "Consumer Middle Name is required")
      .max(100, "Consumer Middle Name cannot exceed 100 characters")
      .regex(/^[A-Za-z ]+$/, "Consumer Middle Name can contain only letters"),

    consumerLastName: z
      .string()
      .trim()
      .min(1, "Consumer Last Name is required")
      .max(100, "Consumer Last Name cannot exceed 100 characters")
      .regex(/^[A-Za-z ]+$/, "Consumer Last Name can contain only letters"),

    consumerFirstNameMarathi: z
      .string()
      .trim()
      .min(1, "Consumer First Name in Marathi is required")
      .max(100, "Consumer First Name in Marathi cannot exceed 100 characters"),

    consumerMiddleNameMarathi: z
      .string()
      .trim()
      .min(1, "Consumer Middle Name in Marathi is required")
      .max(100, "Consumer Middle Name in Marathi cannot exceed 100 characters"),

    consumerLastNameMarathi: z
      .string()
      .trim()
      .min(1, "Consumer Last Name in Marathi is required")
      .max(100, "Consumer Last Name in Marathi cannot exceed 100 characters"),

    consumerMobileNumber: z
      .string()
      .trim()
      .min(1, "Consumer Mobile Number is required")
      .length(10, "Consumer Mobile Number must be exactly 10 digits")
      .regex(
        /^[6-9]\d{9}$/,
        "Please enter a valid 10 digit Consumer Mobile Number",
      ),

    consumerEmail: z
      .string()
      .trim()
      .min(1, "Consumer Email ID is required")
      .max(254, "Consumer Email ID cannot exceed 254 characters")
      .regex(emailRegex, "Please enter a valid Consumer Email Address"),

    consumerAadharCardNo: z
      .string()
      .trim()
      .min(1, "Consumer Aadhar Card Number is required")
      .length(12, "Consumer Aadhar Card Number must be exactly 12 digits")
      .regex(
        /^\d{12}$/,
        "Consumer Aadhar Card Number must contain only 12 digits",
      ),

    consumerPropertyNumber: z
      .string()
      .trim()
      .min(1, "Consumer Property Number is required")
      .max(50, "Consumer Property Number cannot exceed 50 characters"),

    consumerResidentialNumber: z
      .string()
      .trim()
      .min(1, "Consumer Residential Number is required")
      .max(50, "Consumer Residential Number cannot exceed 50 characters"),

    includeCoOwner: z
      .string()
      .min(1, "Please select whether Co-Owner details are required")
      .refine(
        (value) => ["Yes", "No"].includes(value),
        "Please select Yes or No",
      ),

    coOwnerFirstName: z.string().trim().max(
      100,
      "Co-Owner First Name cannot exceed 100 characters",
    ),

    coOwnerMiddleName: z.string().trim().max(
      100,
      "Co-Owner Middle Name cannot exceed 100 characters",
    ),

    coOwnerLastName: z.string().trim().max(
      100,
      "Co-Owner Last Name cannot exceed 100 characters",
    ),

    coOwnerFirstNameMarathi: z.string().trim().max(
      100,
      "Co-Owner First Name in Marathi cannot exceed 100 characters",
    ),

    coOwnerMiddleNameMarathi: z.string().trim().max(
      100,
      "Co-Owner Middle Name in Marathi cannot exceed 100 characters",
    ),

    coOwnerLastNameMarathi: z.string().trim().max(
      100,
      "Co-Owner Last Name in Marathi cannot exceed 100 characters",
    ),

    coOwnerAddress: z.string().trim().max(
      500,
      "Co-Owner Address cannot exceed 500 characters",
    ),

    coOwnerAddressMarathi: z.string().trim().max(
      500,
      "Co-Owner Address in Marathi cannot exceed 500 characters",
    ),

    connectionType: commonValidationSchema.selectOption,

    connectionSize: commonValidationSchema.selectOption,

    usageType: commonValidationSchema.selectOption,

    usageSubType: commonValidationSchema.selectOption,

    noOfPerson: z
      .union([z.string(), z.number()])
      .transform((value) => String(value).trim())
      .refine((value) => /^\d+$/.test(value), "Number of Person must be a number")
      .refine(
        (value) => Number(value) > 0,
        "Number of Person must be greater than 0",
      )
      .refine(
        (value) => Number(value) <= 99999,
        "Number of Person cannot exceed 99999",
      ),

    noOfFamily: z
      .union([z.string(), z.number()])
      .transform((value) => String(value).trim())
      .refine((value) => /^\d+$/.test(value), "Number of Family must be a number")
      .refine(
        (value) => Number(value) > 0,
        "Number of Family must be greater than 0",
      )
      .refine(
        (value) => Number(value) <= 99999,
        "Number of Family cannot exceed 99999",
      ),

    noOfConnection: z
      .union([z.string(), z.number()])
      .transform((value) => String(value).trim())
      .refine(
        (value) => /^\d+$/.test(value),
        "Number of Connection must be a number",
      )
      .refine(
        (value) => Number(value) > 0,
        "Number of Connection must be greater than 0",
      )
      .refine(
        (value) => Number(value) <= 99999,
        "Number of Connection cannot exceed 99999",
      ),

    connectionStatus: commonValidationSchema.selectOption,

    businessCertificate: commonValidationSchema.selectOption,

    billingType: z
      .string()
      .trim()
      .min(1, "Billing Type is required"),

    isGovtProperty: z
      .string()
      .min(1, "Please select Government Property status")
      .refine(
        (value) => ["Yes", "No"].includes(value),
        "Please select Yes or No",
      ),

    remark: z
      .string()
      .trim()
      .min(1, "Remark is required")
      .max(500, "Remark cannot exceed 500 characters"),

    reason: z
      .string()
      .trim()
      .min(1, "Reason is required")
      .max(500, "Reason cannot exceed 500 characters"),
  })
  .superRefine((values, ctx) => {
    if (values.includeCoOwner === "Yes") {
      if (!values.coOwnerFirstName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["coOwnerFirstName"],
          message: "Co-Owner First Name is required",
        });
      }

      if (!values.coOwnerMiddleName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["coOwnerMiddleName"],
          message: "Co-Owner Middle Name is required",
        });
      }

      if (!values.coOwnerLastName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["coOwnerLastName"],
          message: "Co-Owner Last Name is required",
        });
      }

      if (!values.coOwnerFirstNameMarathi?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["coOwnerFirstNameMarathi"],
          message: "Co-Owner First Name in Marathi is required",
        });
      }

      if (!values.coOwnerMiddleNameMarathi?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["coOwnerMiddleNameMarathi"],
          message: "Co-Owner Middle Name in Marathi is required",
        });
      }

      if (!values.coOwnerLastNameMarathi?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["coOwnerLastNameMarathi"],
          message: "Co-Owner Last Name in Marathi is required",
        });
      }

      if (!values.coOwnerAddress?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["coOwnerAddress"],
          message: "Co-Owner Address is required",
        });
      }

      if (!values.coOwnerAddressMarathi?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["coOwnerAddressMarathi"],
          message: "Co-Owner Address in Marathi is required",
        });
      }
    }
  });

// export const toursAndTravelsValidationSchema = z.object({
//   firstName: z.string()
//     .min(1, "First Name is required")
//     .refine((val) => val && val.trim() !== "", "First Name is required"),
  
//   middleName: z.string()
//     .optional()
//     .default(""),
  
//   lastName: z.string()
//     .min(1, "Last Name is required")
//     .refine((val) => val && val.trim() !== "", "Last Name is required"),
  
//   mobileNo: z.string()
//     .min(1, "Mobile Number is required")
//     .regex(mobileRegex, "Mobile Number must be 10 digits")
//     .refine((val) => val && val.trim() !== "", "Mobile Number is required"),
  
//   emailId: emailValidationAlt,
  
//   aadharNo: z.string()
//     .optional()
//     .default("")
//     .refine((val) => {
//       if (!val || val.trim() === "") return true;
//       return aadharRegex.test(val);
//     }, "Aadhar Number must be 12 digits"),
  
//   residentialAddress: z.string()
//     .min(1, "Residential Address is required")
//     .refine((val) => val && val.trim() !== "", "Residential Address is required"),
  
//   propertyNo: z.string()
//     .min(1, "Property Number is required")
//     .refine((val) => val && val.trim() !== "", "Property Number is required"),
  
//   businessAddress: z.string()
//     .min(1, "Business Address is required")
//     .refine((val) => val && val.trim() !== "", "Business Address is required"),
  
//   businessType: z.string()
//     .min(1, "Business Type is required")
//     .refine((val) => {
//       if (!val || val.trim() === "") return false;
//       const num = Number(val);
//       return !isNaN(num) && num > 0;
//     }, "Please select a valid Business Type"),
  
//   businessDescription: z.string()
//     .min(1, "Business Description is required")
//     .refine((val) => val && val.trim() !== "", "Business Description is required"),
  
//   applicationDocument: z.any()
//     .nullable()
//     .refine((val) => val !== null && val !== undefined, "Document is required"),
// });

export const toursAndTravelsValidationSchema = z
  .object({
    firstName: z.string().min(1, "First Name is required")
      .refine((v) => v?.trim() !== "", "First Name is required"),
    middleName: z.string().optional().default(""),
    lastName: z.string().min(1, "Last Name is required")
      .refine((v) => v?.trim() !== "", "Last Name is required"),
    mobileNo: z.string().min(1, "Mobile Number is required")
      .regex(mobileRegex, "Mobile Number must be 10 digits"),
    emailId: emailValidationAlt,
    aadharNo: z.string().optional().default("")
      .refine((v) => {
        if (!v?.trim()) return true;
        return aadharRegex.test(v);
      }, "Aadhar Number must be 12 digits"),
    residentialAddress: z.string().min(1, "Residential Address is required")
      .refine((v) => v?.trim() !== "", "Residential Address is required"),
    panCard: z.string().optional().default(""),
    organizationName: z.string().optional().default(""),
    organizationAddress: z.string().optional().default(""),
    businessType: z.string().min(1, "Business Type is required")
      .refine((v) => v?.trim() !== "", "Business Type is required"),
    businessDescription: z.string().min(1, "Business Description is required")
      .refine((v) => v?.trim() !== "", "Business Description is required"),
    zoneId: z
    .string()
    .min(1, "Please select a Zone")
    .refine(
      (val) =>
        val !== undefined &&
        val !== null &&
        val !== "" &&
        val !== "0" &&
        val !== "-1",
      { message: "Please select a Zone" }
  ),
  })
  .passthrough();

export const validateDynamicFields = (values, visibleFieldIds) => {
  const errors = {};

  const FIELD_LABELS = {
    11: { key: "permitFromDate", label: "परवानगी या दिनांकापासून" },
    12: { key: "permitToDate", label: "परवानगी या दिनांकापर्यंत" },
    13: { key: "propertyNo", label: "मालमत्ता क्रमांक" },
    14: { key: "businessAddress", label: "व्यवसायाचा पत्ता" },
    15: { key: "waterConnectionNo", label: "नळ जोडणी क्र." },
    16: { key: "businessLicenseNo", label: "व्यवसाय परवाना क्रमांक" },
    17: { key: "licenseType", label: "परवाना प्रकार" },
    18: { key: "buildingPermissionProposalNo", label: "बांधकाम परवानगी प्रस्ताव क्रमांक" },
    19: { key: "occupancyCertificateNo", label: "भोगावटा प्रमाणपत्र क्रमांक" },
    20: { key: "roadType", label: "रस्त्याचे प्रकार" },
    21: { key: "roadLength", label: "रस्त्याची लांबी" },
    22: { key: "roadWidth", label: "रस्त्याची रुंदी" },
    23: { key: "roadLengthWidth", label: "रस्त्याची लांबीरुंदी" },
    24: { key: "excavationArea", label: "खोदण्याचे आकार" },
    25: { key: "excavationStartPoint", label: "खोदाईचे प्रारंभिक बिंदू" },
    26: { key: "excavationEndPoint", label: "खोदाईचे शेवटी बिंदू" },
    27: { key: "latitude", label: "अक्षांश" },
    28: { key: "longitude", label: "रेखांश" },
    29: { key: "hospitalName", label: "रुग्णालयाचे नाव" },
    30: { key: "healthAgencyNo", label: "आरोग्य एनओसी क्रमांक" },
    31: { key: "fixedArea", label: "मंडपसाठी विनंती केलेले क्षेत्र" },
    32: { key: "newHoarding", label: "नवीन होर्डिंग" },
    33: { key: "hoardingNumber", label: "होर्डिंगची संख्या" },
    34: { key: "advertisingArea", label: "जाहिरातीसाठी विनंती केलेले क्षेत्र" },
    35: { key: "numberOfLights", label: "दिवसांची संख्या" },
    36: { key: "hoardingType", label: "होर्डिंगचे प्रकार" },
    37: { key: "hoardingSubType", label: "होर्डिंगचे उप प्रकार" },
  };

  visibleFieldIds.forEach((id) => {
    const meta = FIELD_LABELS[id];
    if (!meta) return;
    const v = values[meta.key];
    if (v === undefined || v === null || String(v).trim() === "") {
      errors[meta.key] = `${meta.label} is required`;
    }
  });

  return errors;
};

export const nocForMandapStallValidationSchema = z
  .object({
    /* =====================================================
       APPLICANT DETAILS
    ===================================================== */

    ulbId: commonValidationSchema.selectOption,

    serviceName: z
      .string()
      .trim()
      .min(1, "Service Name is required"),

    applicantFirstName: z
      .string()
      .trim()
      .min(1, "Applicant First Name is required")
      .max(100, "Applicant First Name cannot exceed 100 characters"),

    applicantMiddleName: z
      .string()
      .trim()
      .min(1, "Applicant Middle Name is required")
      .max(100, "Applicant Middle Name cannot exceed 100 characters"),

    applicantLastName: z
      .string()
      .trim()
      .min(1, "Applicant Last Name is required")
      .max(100, "Applicant Last Name cannot exceed 100 characters"),

    mobileNumber: commonValidationSchema.mobile,

    // GLOBAL ZOD EMAIL VALIDATION
    email: emailValidationWithMaxLength,

    aadharCardNo: z
      .string()
      .trim()
      .min(1, "Aadhar Card Number is required")
      .regex(
        aadharRegex,
        "Aadhar Card Number must be 12 digits",
      ),

    applicantAddress: z
      .string()
      .trim()
      .min(1, "Applicant Residential Address is required")
      .max(
        500,
        "Applicant Residential Address cannot exceed 500 characters",
      ),

    panCardNo: z
      .string()
      .trim()
      .optional()
      .default("")
      .refine(
        (value) => {
          if (!value) return true;

          return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(
            value.toUpperCase(),
          );
        },
        "Invalid PAN Card Number",
      ),

    organizationName: z
      .string()
      .trim()
      .optional()
      .default("")
      .refine(
        (value) => value.length <= 200,
        "Organization Name cannot exceed 200 characters",
      ),

    organizationAddress: z
      .string()
      .trim()
      .optional()
      .default("")
      .refine(
        (value) => value.length <= 500,
        "Organization Address cannot exceed 500 characters",
      ),

    /* =====================================================
       NOC DETAILS
    ===================================================== */

    businessType: commonValidationSchema.selectOption,

    businessDescription: z
      .string()
      .trim()
      .min(1, "Business Description is required")
      .max(
        500,
        "Business Description cannot exceed 500 characters",
      ),

    permissionFromDate: z
      .union([
        z.date(),
        z.null(),
        z.undefined(),
      ])
      .refine(
        (value) => value instanceof Date && !isNaN(value.getTime()),
        "Permission From Date is required",
      ),

    permissionToDate: z
      .union([
        z.date(),
        z.null(),
        z.undefined(),
      ])
      .refine(
        (value) => value instanceof Date && !isNaN(value.getTime()),
        "Permission To Date is required",
      ),

    propertyNumber: z
      .string()
      .trim()
      .optional()
      .default(""),

    businessAddress: z
      .string()
      .trim()
      .min(1, "Business Address is required")
      .max(
        500,
        "Business Address cannot exceed 500 characters",
      ),

    waterConnectionNo: z
      .string()
      .trim()
      .optional()
      .default(""),

    businessLicenseNo: z
      .string()
      .trim()
      .optional()
      .default(""),

    licenseType: z
      .string()
      .optional()
      .default(""),

    constructionPermissionProposalNo: z
      .string()
      .trim()
      .optional()
      .default(""),

    occupancyCertificateNo: z
      .string()
      .trim()
      .optional()
      .default(""),

    roadType: z
      .string()
      .optional()
      .default(""),

    roadLength: z
      .string()
      .optional()
      .default("")
      .refine(
        (value) => {
          if (!value) return true;
          return Number(value) > 0;
        },
        "Road Length must be greater than 0",
      ),

    roadWidth: z
      .string()
      .optional()
      .default("")
      .refine(
        (value) => {
          if (!value) return true;
          return Number(value) > 0;
        },
        "Road Width must be greater than 0",
      ),

    roadArea: z
      .string()
      .optional()
      .default("")
      .refine(
        (value) => {
          if (!value) return true;
          return Number(value) > 0;
        },
        "Road Area must be greater than 0",
      ),

    excavationSize: z
      .string()
      .optional()
      .default("")
      .refine(
        (value) => {
          if (!value) return true;
          return Number(value) > 0;
        },
        "Excavation Size must be greater than 0",
      ),

    excavationStartPoint: z
      .string()
      .trim()
      .optional()
      .default(""),

    excavationEndPoint: z
      .string()
      .trim()
      .optional()
      .default(""),

    latitude: z
      .string()
      .trim()
      .optional()
      .default("")
      .refine(
        (value) => {
          if (!value) return true;

          const number = Number(value);

          return (
            !isNaN(number) &&
            number >= -90 &&
            number <= 90
          );
        },
        "Invalid Latitude",
      ),

    longitude: z
      .string()
      .trim()
      .optional()
      .default("")
      .refine(
        (value) => {
          if (!value) return true;

          const number = Number(value);

          return (
            !isNaN(number) &&
            number >= -180 &&
            number <= 180
          );
        },
        "Invalid Longitude",
      ),

    hospitalName: z
      .string()
      .trim()
      .optional()
      .default(""),

    healthNocNo: z
      .string()
      .trim()
      .optional()
      .default(""),

    mandapRequestedArea: z
      .string()
      .trim()
      .min(1, "Area requested for Mandap is required")
      .refine(
        (value) => Number(value) > 0,
        "Mandap Requested Area must be greater than 0",
      ),

    newHoarding: z
      .string()
      .optional()
      .default("")
      .refine(
        (value) => {
          if (!value) return true;
          return ["Yes", "No"].includes(value);
        },
        "Please select a valid Hoarding option",
      ),

    hoardingCount: z
      .string()
      .optional()
      .default("")
      .refine(
        (value) => {
          if (!value) return true;
          return /^\d+$/.test(value) && Number(value) > 0;
        },
        "Hoarding Count must be greater than 0",
      ),

    advertisementRequestedArea: z
      .string()
      .trim()
      .min(
        1,
        "Advertisement Requested Area is required",
      )
      .refine(
        (value) => Number(value) > 0,
        "Advertisement Requested Area must be greater than 0",
      ),

    numberOfDays: z
      .string()
      .trim()
      .min(1, "Number of Days is required")
      .refine(
        (value) => /^\d+$/.test(value) && Number(value) > 0,
        "Number of Days must be greater than 0",
      ),

    hoardingType: z
      .string()
      .optional()
      .default(""),

    hoardingSubType: z
      .string()
      .optional()
      .default(""),

    /* =====================================================
       CAPTCHA
    ===================================================== */

    captcha: z
      .string()
      .trim()
      .min(1, "Please enter captcha"),
  })
  .superRefine((values, ctx) => {
    /* =====================================================
       FROM DATE / TO DATE VALIDATION
    ===================================================== */

    if (
      values.permissionFromDate instanceof Date &&
      values.permissionToDate instanceof Date
    ) {
      const fromDate = new Date(
        values.permissionFromDate,
      );

      const toDate = new Date(
        values.permissionToDate,
      );

      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);

      if (toDate < fromDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["permissionToDate"],
          message:
            "Permission To Date cannot be earlier than Permission From Date",
        });
      }
    }

    /* =====================================================
       HOARDING COUNT
       ===================================================== */

    if (
      values.newHoarding === "Yes" &&
      !values.hoardingCount?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hoardingCount"],
        message:
          "Hoarding Count is required when New Hoarding is Yes",
      });
    }

    /* =====================================================
       HOARDING TYPE
       ===================================================== */

    if (values.newHoarding === "Yes") {
      if (!values.hoardingType?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hoardingType"],
          message:
            "Please select Hoarding Type",
        });
      }

      if (!values.hoardingSubType?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hoardingSubType"],
          message:
            "Please select Hoarding Sub Type",
        });
      }
    }
  });

