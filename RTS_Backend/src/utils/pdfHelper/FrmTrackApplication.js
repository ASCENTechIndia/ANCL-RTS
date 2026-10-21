const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");
const QRCode = require("qrcode");

const toDataUrl = (filePath) => {
  if (!filePath) return "";

  if (filePath.startsWith("data:image")) {
    return filePath;
  }

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  let finalPath = filePath;

  if (!path.isAbsolute(finalPath)) {
    finalPath = path.resolve(__dirname, "../../../public", finalPath.replace(/^[/\\]+/, ""));
  }

  if (!fs.existsSync(finalPath)) {
    return "";
  }

  const ext = path.extname(finalPath).toLowerCase();

  let mime = "image/png";

  if (ext === ".jpg" || ext === ".jpeg") {
    mime = "image/jpeg";
  }

  if (ext === ".webp") {
    mime = "image/webp";
  }

  const buffer = fs.readFileSync(finalPath);

  return `data:${mime};base64,${buffer.toString("base64")}`;
};

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return value;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const ExtractOfPropertyReportHelper = async ({ rows, corporationName, ulbLogo, qrUrl, serviceId, appNo, ulbId }) => {
  try {
    if (!rows || rows.length === 0) {
      throw new Error("No Record Found For Print");
    }

    const row = rows[0];

    const aplesevaLogoPath = path.resolve(__dirname, "../../../public/Apleseva.png");

    const leftLogo = toDataUrl(ulbLogo);
    const rightLogo = toDataUrl(aplesevaLogoPath);

    let qrCode = "";

    if (qrUrl) {
      try {
        qrCode = await QRCode.toDataURL(qrUrl, {
          errorCorrectionLevel: "M",
          type: "image/png",
          width: 150,
          margin: 1,
        });
      } catch (error) {
        //console.error("QR Code Error:", error);
      }
    }

    const appDate = formatDate(row.APPDATE);
    const authDate = formatDate(row.AUTHDATE);

    const reportData = {
      corporationName: corporationName || "ठाणे महानगरपालिका, ठाणे.",

      leftLogo,
      rightLogo,
      qrCode,

      SERVID: row.SERVID || "",
      ZONEID: row.ZONEID || "",
      WARDNAME: row.WARDNAME || "",
      PROPNO: row.PROPNO || "",
      SUBCODE: row.SUBCODE || "",
      APPNO: row.APPNO || "",
      LANDHOLDER: row.LANDHOLDER || "",
      STRUCTHOLDER: row.STRUCTHOLDER || "",
      OWNDTLS: row.OWNDTLS || "",
      ADDRESS: row.ADDRESS || "",
      FLATNO: row.FLATNO || "",
      STRUCTURE: row.STRUCTURE || "",
      USAGETYPE: row.USAGETYPE || "",
      CONSTTYPE: row.CONSTTYPE || "",
      AREA: row.AREA || "",
      LETTINGRATE: row.LETTINGRATE || "",
      RATE: row.RATE || "",
      YEARTAX: row.YEARTAX || "",
      ASSESSYR: row.ASSESSYR || "",
      APPLINAME: row.APPLINAME || "",
      APPLIMOB: row.APPLIMOB || "",
      APPLIEMAIL: row.APPLIEMAIL || "",
      APPDATE: appDate,
      AUTHDATE: authDate,
      OUTNO: row.OUTNO || "",
      PRINTDATE: formatDate(new Date()),

      certificate: {
        servid: row.SERVID || "",
        appno: row.APPNO || "",
        appdate: appDate,
        authdate: authDate,
        outno: row.OUTNO || "",

        zoneid: row.ZONEID || "",
        wardname: row.WARDNAME || "",

        propno: row.PROPNO || "",
        subcode: row.SUBCODE || "",

        landholder: row.LANDHOLDER || "",
        structholder: row.STRUCTHOLDER || "",
        owndtls: row.OWNDTLS || "",

        address: row.ADDRESS || "",
        flatno: row.FLATNO || "",
        structure: row.STRUCTURE || "",

        usagetype: row.USAGETYPE || "",
        consttype: row.CONSTTYPE || "",
        area: row.AREA || "",
        lettingrate: row.LETTINGRATE || "",
        rate: row.RATE || "",
        yeartax: row.YEARTAX || "",
        assessyr: row.ASSESSYR || "",

        appliname: row.APPLINAME || "",
        applimob: row.APPLIMOB || "",
        appliemail: row.APPLIEMAIL || "",

        printDate: formatDate(new Date()),
      },
    };
    let templateFile;

    switch (String(serviceId)) {
      case "2":
        templateFile = "CrtExtractofProperty.html";
        break;

      case "43":
        templateFile = "CrtNewAssesment.html";
        break;

      case "289":
        templateFile = "CrtSelfAssesment.html";
        break;

      case "44":
        templateFile = "CrtReAssesment.html";
        break;

      case "56":
        templateFile = "CrtNoDuesCerti.html";
        break;

      case "100":
        templateFile = "CrtPropertyTax.html";
        break;

      case "287":
        templateFile = "CrtRebateOnTax.html";
        break;

      case "4":
        templateFile = "CrtChngPropertyOwnership.html";
        break;
        
      case "5":
        templateFile = "CrtChngPropertyOwnership.html";
        break;

      case "46":
        templateFile = "CrtRebateOnTaxVacantpro.html";
        break;

      case "290":
        templateFile = "CrtObjectionsAppeal.html";
        break;

      case "291":
        templateFile = "CrtDemolishandRedevelopment.html";
        break;

      case "51":
        templateFile = "CrtPropertyDivision.html";
        break;

      default:
        throw new Error(`PDF template not configured for Service ID ${serviceId}`);
    }

    const templatePath = path.resolve(__dirname, "../../templates", templateFile);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const htmlFile = fs.readFileSync(templatePath, "utf8");

    const template = Handlebars.compile(htmlFile);

    const html = template(reportData);

    const chromePath = path.resolve(__dirname, "../../../node_modules/puppeteer/.cache/puppeteer/chrome/win64-135.0.7049.84/chrome-win64/chrome.exe");

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

    await page.evaluate(async () => {
      const images = Array.from(document.images);

      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();

          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }),
      );
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: false,
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
      fs.mkdirSync(outputDir, {
        recursive: true,
      });
    }

    const fileName = `Certificate_${Date.now()}.pdf`;

    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, pdfBuffer);

    //  console.log("PDF Generated:", filePath);
    // console.log("PDF Size:", pdfBuffer.length);

    return {
      fileName,
      filePath,
    };
  } catch (error) {
    console.error("Extract Of Property PDF Error:", error);

    throw error;
  }
};

module.exports = {
  ExtractOfPropertyReportHelper,
};
