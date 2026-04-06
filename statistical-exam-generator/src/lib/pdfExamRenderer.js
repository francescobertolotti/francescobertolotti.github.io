const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const TEMPLATE_INSTRUCTIONS = [
  "The exam is open book, so during the test you may use your notes, either on paper or in digital form, but only using the laboratory computer, and without USB drives or similar devices. Any communication with people other than the instructors is strictly prohibited.",
  "Download onto the computer you are using for the exam the file available on the “Virtual Classroom” page dedicated to this test, and rename it:",
  "pn_xxxxx",
  "where xxxxx is your student ID number (without changing the file extension). Complete your exam by working on this file using MS Excel or Libre/OpenOffice Calc, in either Italian or English.",
  "At the end of the exam, upload the file to the same “Virtual Classroom” page. If you wish, you may keep a copy of the file, and finally delete any file you may have created or copied onto the computer.",
  "Since responsibility for any malfunction of the computer during the exam does not lie with the instructor, it is entirely your responsibility to minimize the risk of data loss due to malfunctions or errors, in particular by saving the file containing your work frequently.",
  "Organize your data file in a single worksheet, clearly structured, with explicit titles/captions/legends for each element you introduce. Write your student ID number in cell A1, your surname in cell A2, and your name in cell A3.",
  "As specified below, the yellow-highlighted cells, which must not be moved, must contain the results of your work in the form of calculated formulas, not numerical values (other cells may be used freely for intermediate calculations, while keeping the worksheet as clear and organized as possible).",
  "The evaluation will take into account primarily the content, but also the form of the work, in particular the organization of the worksheet, the correctness of the text, and compliance with the rules specified here."
];

function formatDate(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function drawInstructions(doc) {
  doc.font("Helvetica").fontSize(10.5).fillColor("#000000");

  for (let index = 0; index < TEMPLATE_INSTRUCTIONS.length; index += 1) {
    const paragraph = TEMPLATE_INSTRUCTIONS[index];

    if (paragraph === "pn_xxxxx") {
      doc.moveDown(0.2);
      doc.font("Helvetica-Bold").text(paragraph, { align: "center" });
      doc.font("Helvetica");
      doc.moveDown(0.6);
      continue;
    }

    doc.text(paragraph, { align: "justify" });
    doc.moveDown(0.6);
  }
}

function createExamPdf({
  outputPath,
  generatedExamText,
  logoPath,
  examTitle = `N_th midterm exam – ${formatDate()}`
}) {
  ensureDir(path.dirname(outputPath));

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 54, left: 56, right: 56, bottom: 54 }
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    if (logoPath && fs.existsSync(logoPath)) {
      doc.image(logoPath, 56, 40, { width: 150 });
    }

    doc.font("Helvetica-Bold").fontSize(14).text(examTitle, {
      align: "center"
    });
    doc.moveDown(1.1);

    drawInstructions(doc);

    doc.moveDown(0.3);
    doc.font("Helvetica-Bold").fontSize(10.5).text("---", { align: "center" });
    doc.moveDown(0.45);
    doc.font("Helvetica").fontSize(10.5).text(generatedExamText, {
      align: "justify"
    });

    doc.end();

    stream.on("finish", () => resolve(outputPath));
    stream.on("error", reject);
  });
}

module.exports = {
  createExamPdf
};

