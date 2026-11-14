const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

// ============================================================
// CONVERT IMAGE TO DATA URL
// ============================================================

const toDataUrl = (filePath) => {
  if (!filePath) {
    return "";
  }

  // Already a data URL
  if (typeof filePath === "string" && filePath.startsWith("data:image")) {
    return filePath;
  }

  // Buffer
  if (Buffer.isBuffer(filePath)) {
    return `data:image/png;base64,${filePath.toString("base64")}`;
  }

  // External URL
  if (typeof filePath === "string" && (filePath.startsWith("http://") || filePath.startsWith("https://"))) {
    return filePath;
  }

  // Local file
  if (typeof filePath !== "string") {
    return "";
  }

  let finalPath = filePath;

  if (!path.isAbsolute(finalPath)) {
    finalPath = path.resolve(__dirname, "../../../public", filePath.replace(/^[\/\\]+/, ""));
  }

  if (!fs.existsSync(finalPath)) {
    return "";
  }

  const ext = path.extname(finalPath).toLowerCase();

  let mime = "image/png";

  if (ext === ".jpg" || ext === ".jpeg") {
    mime = "image/jpeg";
  } else if (ext === ".webp") {
    mime = "image/webp";
  }

  const buffer = fs.readFileSync(finalPath);

  return `data:${mime};base64,${buffer.toString("base64")}`;
};

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return value;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

// ============================================================
// PAYMENT ACKNOWLEDGEMENT PDF HELPER
// ============================================================

const AfterTransactionReportHelper = async ({ row, corporationName = "", logo }) => {
  try {
    if (!row) {
      throw new Error("Payment acknowledgement data not found.");
    }

    // --------------------------------------------------------
    // HTML TEMPLATE
    // --------------------------------------------------------

    const templatePath = path.resolve(__dirname, "../../templates/FrmAfterTransactionTMC.html");

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    // --------------------------------------------------------
    // HARDCODED ULB LOGO
    // public/tmclogo.jpeg
    // --------------------------------------------------------

    const ulbLogoPath = path.resolve(__dirname, "../../../public/tmclogo.jpg");

    const leftLogo = toDataUrl(logo) ?? toDataUrl(ulbLogoPath);

    // --------------------------------------------------------
    // APLESEVA LOGO
    // public/Apleseva.png
    // --------------------------------------------------------

    const aplesevaLogoPath = path.resolve(__dirname, "../../../public/Apleseva.png");

    const rightLogo = toDataUrl(aplesevaLogoPath);

    // --------------------------------------------------------
    // REPORT DATA
    // --------------------------------------------------------

    const reportData = {
      corporationName: corporationName || "ठाणे महानगरपालिका, ठाणे",

      leftLogo,
      rightLogo,

      APPNO: row.APPNO || "",

      NOOFCOPY: row.NOOFCOPY ?? "",

      AMOUNT: row.AMOUNT ?? "",

      RECIEPTNO: row.RECIEPTNO || "",

      RECIEPTREFNO: row.RECIEPTREFNO || "",

      RECIEPTDATE: formatDate(row.RECIEPTDATE),

      SERVICENAME: row.SERVICENAME || "",

      APPLINAME: row.APPLINAME || "",

      APPLINAMAR: row.APPLINAMAR || "",

      ADDRESS: row.ADDRESS || "",

      ADDRESSMAR: row.ADDRESSMAR || "",

      PRINTDATE: formatDate(new Date()),
    };

    // --------------------------------------------------------
    // READ HTML
    // --------------------------------------------------------

    const htmlFile = fs.readFileSync(templatePath, "utf8");

    // --------------------------------------------------------
    // HANDLEBARS
    // --------------------------------------------------------

    const template = Handlebars.compile(htmlFile);

    const html = template(reportData);

    // --------------------------------------------------------
    // PUPPETEER
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // SET HTML
    // --------------------------------------------------------

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 0,
    });

    // --------------------------------------------------------
    // WAIT FOR ALL IMAGES
    // --------------------------------------------------------

    await page.evaluate(async () => {
      const images = Array.from(document.images);

      await Promise.all(
        images.map((img) => {
          if (img.complete) {
            return Promise.resolve();
          }

          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }),
      );
    });

    // --------------------------------------------------------
    // GENERATE PDF
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // SAVE PDF
    // --------------------------------------------------------

    const outputDir = path.resolve(__dirname, "../../../public/pdf");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {
        recursive: true,
      });
    }

    const fileName = `PaymentAcknowledgement_${Date.now()}.pdf`;

    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, pdfBuffer);

    return {
      fileName,
      filePath,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  AfterTransactionReportHelper,
};
