const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");
const QRCode = require("qrcode");

const toDataUrl = (filePath) => {
  if (!filePath) return "";

  if (filePath.startsWith("data:image")) return filePath;

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  let finalPath = filePath;

  if (!path.isAbsolute(finalPath)) {
    finalPath = path.resolve(
      __dirname,
      "../../../public",
      finalPath.replace(/^[/\\]+/, "")
    );
  }

  if (!fs.existsSync(finalPath)) return "";

  const ext = path.extname(finalPath).toLowerCase();
  let mime = "image/png";
  if (ext === ".jpg" || ext === ".jpeg") mime = "image/jpeg";
  if (ext === ".webp") mime = "image/webp";

  const buffer = fs.readFileSync(finalPath);
  return `data:${mime};base64,${buffer.toString("base64")}`;
};

// ---------------------------------------------------------------
// Utility: Format date as DD/MM/YYYY
// ---------------------------------------------------------------
const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "0";
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return num.toLocaleString("en-IN");
};

const AssessmentCertificateKarjatPdfHelper = async ({
  rows,
  corporationName,
  ulbLogo,
  serviceId,
  appNo,
  ulbId,
}) => {
  try {
    if (!rows || rows.length === 0) {
      throw new Error("No Record Found For Print");
    }

    const row = rows[0];

    // Logos
    const aplesevaLogoPath = path.resolve(
      __dirname,
      "../../../public/Apleseva.png"
    );
    const leftLogo = toDataUrl(ulbLogo);
    const rightLogo = toDataUrl(aplesevaLogoPath);

    const reportData = {
      corporationName: corporationName || "ठाणे महानगरपालिका, ठाणे.",
      leftLogo,
      rightLogo,

      PRINTEDDATE: formatDate(new Date()),

      FINANCIALYEAR: (() => {
        if (row.TRANSCERTINUM) {
          const parts = String(row.TRANSCERTINUM).split("/");
          if (parts.length >= 2) return parts[1];
        }
        return "";
      })(),

      ZONE: row.ZONEID ?? "",
      WARD: row.WARDNAME ?? "",
      PROPERTYNO: row.PROP_NO ?? "",
      PARTNO: row.PROP ?? "",
      OLDPROPERTYNO: row.OLDPROPNO ?? "",
      CITYSURVEYNO: row.SURVENO ?? "",
      PROPERTYDESCRIPTION: row.PROPERTY_TYPE ?? "",
      TOTALPLOTAREA: formatNumber(row.AREA),

      PRIMARYHOLDERNAME: row.FULLNAME ?? "",
      OCCUPANTNAME: [row.OCP_FNM, row.OCP_MNM, row.OCP_LNM]
        .filter(Boolean)
        .join(" "),
      BUILDINGNAME: row.BUILD_NM ?? "",
      ADDRESS: row.BUILD_NM ?? "",

      FLOOR: row.UNIT,
      CONSTRUCTIONTYPE: row.CONST_TYPE ?? "",
      CONSTRUCTIONYEAR: row.CONST_YEAR ?? "",
      TAXABLEAREA: formatNumber(row.AREA),
      BUILDINGANNUALVALUE: formatNumber(row.RATE),
      EXPECTEDANNUALRENT: formatNumber(row.ANNUALRENT),
      ANNUALRENTUNLET: row.ANNUALRENT,
      ANNUALRENTLAND: row.ANNUALRENT,
      REPAIRDEDUCTION: row.ANNUALRENT,
      TAXABLEVALUE: formatNumber(row.RATE),
      TOTALTAX: formatNumber(
        Number(row.NUM_ASSESS_CPTAX || 0) +
          Number(row.NUM_ASSESS_EDUTAX || 0) +
          Number(row.NUM_ASSESS_EMPTAX || 0) +
          Number(row.NUM_ASSESS_TREETAX || 0) +
          Number(row.NUM_ASSESS_NOTFEE || 0) +
          Number(row.NUM_ASSESS_WARFEE || 0) +
          Number(row.NUM_ASSESS_INTFEE || 0) +
          Number(row.NUM_ASSESS_ELECTRIC || 0) +
          Number(row.NUM_ASSESS_CLEANING || 0) +
          Number(row.NUM_ASSESS_FINE || 0) +
          Number(row.NUM_ASSESS_ILLEGALFINE || 0)
      ),

      CURRENTDEMAND: formatNumber(row.CURRENTDEMAND),
      ARREARSDEMAND: formatNumber(row.ARREARSDEMAND),
      TOTALDEMAND: formatNumber(
        Number(row.CURRENTDEMAND || 0) + Number(row.ARREARSDEMAND || 0)
      ),
      CURRENTCOLLECTION: formatNumber(row.CURRENTCOLL),
      ARREARSCOLLECTION: formatNumber(row.ARREARSCOLL),
      TOTALCOLLECTION: formatNumber(
        Number(row.CURRENTCOLL || 0) + Number(row.ARREARSCOLL || 0)
      ),
      TOTALREBATE: formatNumber(row.DISCOUNT),

      BOOKNO: row.BOOKNO ?? "",
      RECEIPTNO: row.RECNO ?? "",
      RECEIPTDATE: formatDate(row.RECEIPTDT),

      AUTHDATE: formatDate(row.RECEIPTDT),

      propertyPhoto: "",
    };

    const templateFile = "AssessmentCertificateKarjat.html";
    const templatePath = path.resolve(__dirname, "../../templates", templateFile);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const htmlFile = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(htmlFile);
    const html = template(reportData);

    const chromePath = path.resolve(
      __dirname,
      "../../../node_modules/puppeteer/.cache/puppeteer/chrome/win64-135.0.7049.84/chrome-win64/chrome.exe"
    );

    const launchOptions = {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };

    if (fs.existsSync(chromePath)) {
      launchOptions.executablePath = chromePath;
    }

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 0,
    });

    // Wait for images to load
    await page.evaluate(async () => {
      const images = Array.from(document.images);
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
    });

    await browser.close();

    const outputDir = path.resolve(__dirname, "../../../public/pdf");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `AssessmentRegister_${serviceId}_${Date.now()}.pdf`;
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    return { fileName, filePath };
  } catch (error) {
    console.error("Service2 Assessment Register PDF Error:", error);
    throw error;
  }
};

module.exports = { AssessmentCertificateKarjatPdfHelper };