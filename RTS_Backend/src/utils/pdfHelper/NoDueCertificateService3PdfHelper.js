
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");

const NoDueCertificateService3PdfHelper = async ({ rows, corporationName = "", ulbLogo = "" }) => {
    let browser;
    try {
        const row = rows?.[0];
        if (!row) throw new Error("No Due Certificate data not found.");

        const templatePath = path.resolve(__dirname, "../../templates/NoDueCertificateService3.html");
        const logoPath = ulbLogo || path.resolve(__dirname, "../../../public/tmclogo.jpg");
        const logo = logoPath.startsWith?.("data:image") ? logoPath : fs.existsSync(logoPath) ? `data:image/${path.extname(logoPath).toLowerCase() === ".jpg" || path.extname(logoPath).toLowerCase() === ".jpeg" ? "jpeg" : "png"};base64,${fs.readFileSync(logoPath).toString("base64")}` : "";

        const formatDate = (value) => {
            if (!value) return "";
            const d = new Date(value);
            return isNaN(d) ? value : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
        };
        const money = (value) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const arrearsDemand = Number(row.ARREARSDEMAND || 0);
        const currentDemand = Number(row.CURRENTDEMAND || 0);
        const arrearsColl = Number(row.ARREARSCOLL || 0);
        const currentColl = Number(row.CURRENTCOLL || 0);
        const discount = Number(row.DISCOUNT || 0);

        const data = {
            corporationName: corporationName || "कररत नगर परिषद",
            logo,
            certificateNo: row.TRANSCERTINUM || "",
            prabhagName: row.PRABHAG_NAME || "",
            zoneName: row.ZONENAME || "",
            wardNo: row.WARDNO ?? "",
            propNo: row.PROPNO || "",
            propertyType: row.PROPERTYTYPE || "",
            address: row.ADDRESS || "",
            ownerName: row.OWNER3NAME || "",
            mobile: row.MOBILE || "",
            receiptNo: row.RECNO || "",
            bookNo: row.BOOKNO || "",
            receiptDate: formatDate(row.RECEIPTDT),
            arrearsDemand: money(arrearsDemand),
            currentDemand: money(currentDemand),
            totalDemand: money(arrearsDemand + currentDemand),
            arrearsColl: money(arrearsColl),
            currentColl: money(currentColl),
            totalColl: money(arrearsColl + currentColl),
            discount: money(discount),
            balance: money(Math.max(0, arrearsDemand + currentDemand - arrearsColl - currentColl - discount)),
            printDate: formatDate(new Date()),
        };

        const html = Handlebars.compile(fs.readFileSync(templatePath, "utf8"))(data);
        const chromePath = path.resolve(__dirname, "../../../node_modules/puppeteer/.cache/puppeteer/chrome/win64-135.0.7049.84/chrome-win64/chrome.exe");
        const options = { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] };
        if (fs.existsSync(chromePath)) options.executablePath = chromePath;

        browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0", timeout: 0 });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
            margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
        });

        const outputDir = path.resolve(__dirname, "../../../public/pdf");
        fs.mkdirSync(outputDir, { recursive: true });
        const fileName = `NoDueCertificate_${Date.now()}.pdf`;
        const filePath = path.join(outputDir, fileName);
        fs.writeFileSync(filePath, pdfBuffer);

        return { fileName, filePath };
    } finally {
        if (browser) await browser.close();
    }
};

module.exports = NoDueCertificateService3PdfHelper;
