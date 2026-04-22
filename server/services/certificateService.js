  const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

class CertificateService {
  constructor() {
    this.certDir = path.join(__dirname, "../../certificates");
    this.ensureCertificateDirectory();
  }

  ensureCertificateDirectory() {
    if (!fs.existsSync(this.certDir)) {
      fs.mkdirSync(this.certDir, { recursive: true });
      console.log("📁 Certificates directory created");
    }
  }

  /**
   * Generate PDF Certificate with professional styling
   * @param {Object} proofData
   * @param {string} proofData.proofHash
   * @param {Object} proofData.proofObject
   * @returns {Promise<string>} filepath
   */
  async generatePDFCertificate(proofData) {
    const { proofHash, proofObject } = proofData;

    // Validation & defaults
    if (!proofHash) throw new Error("Missing proofHash");
    if (!proofObject || typeof proofObject !== "object") {
      console.error("Invalid proofObject:", proofObject);
      throw new Error("Invalid proofObject structure");
    }

    const safeProof = {
      institution_name:
        proofObject.institution_name ||
        proofObject.institutionName ||
        "Government Document Authority",
      document_hash: proofObject.document_hash || "N/A",
      verification_result: proofObject.verification_result || "VALID",
      verified_at: proofObject.verified_at || new Date().toISOString(),
      expiry_date: proofObject.expiry_date || null,
      blockchain_tx: proofObject.blockchain_tx || "N/A",
      block_number: proofObject.block_number || 0,
      system_version: proofObject.system_version || "1.0",
    };

    console.log(
      `🧪 Generating cert for hash: ${proofHash.substring(0, 16)}..., institution: ${safeProof.institution_name}`,
    );
    const filename = `certificate_${proofHash}.pdf`;
    const filepath = path.join(this.certDir, filename);

    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 50,
          size: "A4",
        });
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Header with official styling
        doc
          .fontSize(24)
          .font("Helvetica-Bold")
          .fillColor("#1a237e")
          .text("Official Government Document", { align: "center" });

        doc.fontSize(20).text("Verification Certificate", { align: "center" });

        doc.moveDown(1);

        // Horizontal line
        doc
          .strokeColor("#1a237e")
          .lineWidth(2)
          .moveTo(50, doc.y)
          .lineTo(545, doc.y)
          .stroke();

        doc.moveDown(2);

        // Certificate Details Section
        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .fillColor("#000")
          .text("Certificate Details", { underline: true });

        doc.moveDown(0.5);
        doc
          .fontSize(11)
          .font("Helvetica")
          .text("Issuing Institution: ", { continued: true })
          .font("Helvetica")
          .text(safeProof.institution_name);

        doc.moveDown(0.3);

        // Document Hash (shortened for readability)
        const shortHash =
          safeProof.document_hash !== "N/A"
            ? `${safeProof.document_hash.substring(0, 16)}...${safeProof.document_hash.substring(48)}`
            : safeProof.document_hash;
        doc
          .font("Helvetica-Bold")
          .text("Document Hash: ", { continued: true })
          .font("Helvetica")
          .text(shortHash);

        doc.moveDown(0.3);

        // Verification Status
        doc
          .font("Helvetica-Bold")
          .text("Verification Status: ", { continued: true })
          .font("Helvetica")
          .fillColor("#2e7d32")
          .text(safeProof.verification_result);

        doc.fillColor("#000");
        doc.moveDown(0.3);

        // Timestamp
        const verifiedDate = new Date(proofObject.verified_at);
        doc
          .font("Helvetica-Bold")
          .text("Verified At: ", { continued: true })
          .font("Helvetica")
          .text(
            verifiedDate.toLocaleString("en-US", {
              dateStyle: "full",
              timeStyle: "long",
            }),
          );

        doc.moveDown(0.3);

        // Expiry Date (if exists)
        if (proofObject.expiry_date) {
          const expiryDate = new Date(proofObject.expiry_date);
          doc
            .font("Helvetica-Bold")
            .text("Expires On: ", { continued: true })
            .font("Helvetica")
            .fillColor("#d32f2f")
            .text(
              expiryDate.toLocaleDateString("en-US", {
                dateStyle: "full",
              }),
            );
          doc.fillColor("#000");
        } else {
          doc
            .font("Helvetica-Bold")
            .text("Expires On: ", { continued: true })
            .font("Helvetica")
            .text("N/A");
        }

        doc.moveDown(1.5);

        // Blockchain Information Section
        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .text("Blockchain Proof", { underline: true });

        doc.moveDown(0.5);
        doc.fontSize(11).font("Helvetica");

        doc
          .font("Helvetica-Bold")
          .text("Transaction Hash: ", { continued: true })
          .font("Helvetica")
          .text(proofObject.blockchain_tx);

        doc.moveDown(0.3);

        doc
          .font("Helvetica-Bold")
          .text("Block Number: ", { continued: true })
          .font("Helvetica")
          .text(proofObject.block_number.toString());

        doc.moveDown(1.5);

        // Proof Hash Section
        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .text("Cryptographic Proof", { underline: true });

        doc.moveDown(0.5);
        doc.fontSize(9).font("Courier");
        doc.text(proofHash);

        doc.moveDown(2);

        // QR Code for verification
const baseUrl = process.env.FRONTEND_URL || "https://blockchain-document-verification-46on.onrender.com";
const qrUrl = `${baseUrl}/verify-proof/${proofHash}`;
console.log('QR URL:', qrUrl);
        const qrImage = await QRCode.toDataURL(qrUrl, {
          errorCorrectionLevel: "H",
          width: 200,
        });

        doc.image(qrImage, {
          fit: [150, 150],
          align: "center",
        });

        doc.moveDown();
        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#666")
          .text("Scan QR code to verify this certificate online", {
            align: "center",
          });

        // Footer
        doc.moveDown(2);
        doc
          .fontSize(8)
          .fillColor("#999")
          .text(`Certificate ID: ${proofHash.substring(0, 16)}`, {
            align: "center",
          })
          .text(`Generated: ${new Date().toISOString()}`, { align: "center" })
          .text(`System Version: ${proofObject.system_version}`, {
            align: "center",
          });

        doc.end();

        stream.on("finish", () => {
          console.log(`✅ PDF Certificate generated: ${filename}`);
          resolve(filepath);
        });
        stream.on("error", reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate JSON Certificate (machine-verifiable)
   * @param {Object} proofData
   * @returns {Object} jsonCertificate
   */
  generateJSONCertificate(proofData) {
    const { proofHash, proofObject } = proofData;

    return {
      certificate_type: "government_document_verification",
      proof_hash: proofHash,
      proof_object: proofObject,
      verification_url: `/verify-proof/${proofHash}`,
      generated_at: new Date().toISOString(),
      format_version: "1.0",
    };
  }

  /**
   * Clean up old certificate files (optional)
   * @param {number} maxAgeHours - Max age in hours
   */
  cleanupOldCertificates(maxAgeHours = 24) {
    try {
      const files = fs.readdirSync(this.certDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      files.forEach((file) => {
        const filepath = path.join(this.certDir, file);
        const stats = fs.statSync(filepath);
        const age = now - stats.mtimeMs;

        if (age > maxAge) {
          fs.unlinkSync(filepath);
          console.log(`🗑️  Cleaned up old certificate: ${file}`);
        }
      });
    } catch (error) {
      console.error("Certificate cleanup error:", error);
    }
  }
}

module.exports = new CertificateService();
