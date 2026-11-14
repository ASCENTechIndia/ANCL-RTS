const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

// =========================================================
// Convert local image to Base64 Data URL
// =========================================================
const toDataUrl = (filePath) => {
  try {
    if (!filePath) return "";

    // Already Base64 image
    if (String(filePath).startsWith("data:image/")) {
      return filePath;
    }

    // URL image
    if (String(filePath).startsWith("http://") || String(filePath).startsWith("https://")) {
      return filePath;
    }

    const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(__dirname, "../../../public", filePath);

    if (!fs.existsSync(absolutePath)) {
      console.warn("Image not found:", absolutePath);
      return "";
    }

    const extension = path.extname(absolutePath).toLowerCase();

    let mimeType = "image/png";

    if (extension === ".jpg" || extension === ".jpeg") {
      mimeType = "image/jpeg";
    } else if (extension === ".png") {
      mimeType = "image/png";
    } else if (extension === ".gif") {
      mimeType = "image/gif";
    } else if (extension === ".webp") {
      mimeType = "image/webp";
    }

    const imageBuffer = fs.readFileSync(absolutePath);

    return `data:${mimeType};base64,${imageBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Error converting image:", error);
    return "";
  }
};

// =========================================================
// Date formatter
// =========================================================
const formatDate = (value) => {
  if (!value) return "";

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    const day = String(date.getDate()).padStart(2, "0");

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return `${day}-${months[date.getMonth()]}-${date.getFullYear()}`;
  } catch (error) {
    return String(value);
  }
};

// =========================================================
// Register Handlebars Helpers
// =========================================================

// Equal comparison
Handlebars.registerHelper("eq", function (a, b) {
  return String(a) === String(b);
});

// Not equal comparison
Handlebars.registerHelper("neq", function (a, b) {
  return String(a) !== String(b);
});

// Check value exists
Handlebars.registerHelper("hasValue", function (value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
});

// Increment number
Handlebars.registerHelper("inc", function (value) {
  return Number(value || 0) + 1;
});

const getValidityDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const fyEndYear = month < 3 ? year : year + 1;

  return `31/03/${fyEndYear}`;
};

let templateFile = "";

const FrmServiceCertificatePdfHelper = async ({ rows, corporationName, ulbLogo, serviceId, appNo, ulbId }) => {

  switch (String(serviceId)) {

    case "840":
      templateFile = "FrmClinicalMedical.html";
      break;

    // 516 - Tours and Travels

    case "841":
      templateFile = "FrmTourAndTravels.html";
      break;

    // 517 - Electricity Meter / Cable Installation
    //      and Excavation

    case "842":
      templateFile = "FrmElectricalMeterDigging.html";
      break;

    // 518 - Meat Shop

    case "843":
      templateFile = "FrmMeatShopLicense.html";
      break;

    // 519 - Hospital License

    case "844":
      templateFile = "FrmHospitalLicense.html";
      break;

    // 520 - Fast Food License

    case "845":
      templateFile = "FrmFastFoodLicense.html";
      break;

    // 521 - Mandap / Stall License

    case "846":
      templateFile = "FrmMandapStallLicense.html";
      break;

       case "847":
      templateFile = "FrmMandapStallLicense.html";
      break;


       case "848":
      templateFile = "FrmMandapStallLicense.html";
      break;


    default:
      throw new Error(`PDF template not configured for Service ID ${serviceId}`);
  }

  
  try {
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("No certificate data available for PDF generation.");
    }

    if (!templateFile) {
      throw new Error(`PDF template not configured for Service ID ${serviceId}`);
    }

    console.log(`FrmServiceCertificate PDF - Service ID: ${serviceId}`);

    console.log(`FrmServiceCertificate PDF - Template: ${templateFile}`);

    const row = rows[0];

    let tmclogoPath = ulbLogo;

    if (!tmclogoPath) {
      tmclogoPath = path.resolve(__dirname, "../../../public/tmclogo.jpg");
    }

    const aplesewaLogoPath = path.resolve(__dirname, "../../../public/Apleseva.png");

    const leftLogo = toDataUrl(tmclogoPath);
    const rightLogo = toDataUrl(aplesewaLogoPath);

    const certificate = {
      serviceId: serviceId,
      APPLNO: row.APPLNO || "",
      APPLINAME: row.APPLINAME || "",
      APPLIMOBILE: row.APPLIMOBILE || "",
      APPLIADDRESS: row.APPLIADDRESS || "",
      RECEIPTNO: row.RECEIPTNO || "",
      CERTIFICATENO:  row.CERTIFICATENO || "",
      SERVICEENGNAME: row.SERVICEENGNAME || "",
      SERVICEMARNAME: row.SERVICEMARNAME || "",
      SERVICESHORTNAME: row.SERVICESHORTNAME || "",
      NOCDETAILS: row.NOCDETAILS || "",
      NOCADDRESS: row.NOCADDRESS || "",
      RECEIPTDATE: formatDate(row.RECEIPTDATE),
      NOCINSDATE: formatDate(row.NOCINSDATE),
      APPLICATIONDATE: formatDate(row.APPLICATIONDATE),
    };

    const reportData = {
      SERVICEID: serviceId,
      APPNO: appNo,
      ULBID: ulbId,
      CORPORATIONNAME: corporationName,
      ULBLOGO: leftLogo,
      ULB_LOGO: leftLogo,

      APLESEVA_LOGO: rightLogo,
      certificate,
      VALIDITYDATE: getValidityDate(),

    };

    const templatePath = path.resolve(__dirname, "../../templates", templateFile);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`HTML template not found: ${templatePath}`);
    }

    console.log(`FrmServiceCertificate PDF Template: ${templateFile}`);

    const htmlTemplate = fs.readFileSync(templatePath, "utf8");

    const template = Handlebars.compile(htmlTemplate);

    const html = template(reportData);

    const chromePath = path.resolve(__dirname, "../../../node_modules/puppeteer/.cache/puppeteer/chrome/win64-135.0.7049.84/chrome-win64/chrome.exe");
    
    const launchOptions = {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };

    if (fs.existsSync(chromePath)) {
      launchOptions.executablePath = chromePath;
    }

    const pdfDirectory = path.resolve(__dirname, "../../../public/pdf");

    if (!fs.existsSync(pdfDirectory)) {
      fs.mkdirSync(pdfDirectory, {
        recursive: true,
      });
    }

    const safeServiceId = String(serviceId).replace(/[^a-zA-Z0-9_-]/g, "");

    const safeAppNo = String(appNo || row.APPNO || row.RTSNO || "Application").replace(/[^a-zA-Z0-9_-]/g, "_");

    const pdfName = `ServiceCertificate_${safeServiceId}_${safeAppNo}_${Date.now()}.pdf`;

    const pdfPath = path.join(pdfDirectory, pdfName);

    const browser = await puppeteer.launch(launchOptions);

    try {
      const page = await browser.newPage();
      await page.setViewport({
        width: 794,
        height: 1123,
        deviceScaleFactor: 1,
      });
      await page.setContent(html, { waitUntil: "networkidle0", timeout: 0 });

      await page.pdf({
        path: pdfPath,

        format: "A4",

        printBackground: true,

        preferCSSPageSize: true,

        margin: {
          top: "10mm",
          bottom: "10mm",
          left: "10mm",
          right: "10mm",
        },
      });
    } finally {
      await browser.close();
    }

    if (!fs.existsSync(pdfPath)) {
      throw new Error("PDF file was not created.");
    }

    return {
      fileName: pdfName,
      filePath: pdfPath,
      templateFile,
      serviceId,
      appNo,
      ulbId,
    };
  } catch (error) {
    console.error("FrmServiceCertificate PDF Helper Error:", error);

    throw error;
  }
};

module.exports = FrmServiceCertificatePdfHelper;
