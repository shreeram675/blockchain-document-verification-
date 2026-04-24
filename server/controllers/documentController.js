const db = require("../config/db");
const blockchain = require("../utils/blockchain");
const {
  generateProofObject,
  computeProofHash,
} = require("../utils/proofGenerator");
const crypto = require("crypto");
const fs = require("fs");

// Helper to calc hash
const calculateFileHash = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);
  return "0x" + hashSum.digest("hex");
};

// Safe delete
const safeDelete = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (err) {
    console.error(`Delete failed: ${err.message}`);
  }
};

// ✅ Ensure DB ready before queries
const ensureDB = async () => {
  try {
    await db.query("SELECT 1");
  } catch (err) {
    console.error("❌ DB NOT READY:", err.message);
    throw new Error("Database not initialized");
  }
};

exports.uploadDocument = async (req, res) => {
  await ensureDB();

  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const uploaderId = req.user.id;
  const { institution_id } = req.user;
  const { expiryDate } = req.body;

  if (!institution_id) {
    return res.status(403).json({ message: "No institution linked" });
  }

  const filePath = req.file.path;
  const filename = req.file.originalname;

  try {
    const docHash = calculateFileHash(filePath);

    const [existing] = await db.query(
      "SELECT * FROM documents WHERE original_hash = ?",
      [docHash],
    );

    if (existing.length > 0) {
      await safeDelete(filePath);
      return res.json({
        message: "Document already exists",
        txHash: existing[0].tx_hash,
        docHash,
      });
    }

    const bcCheck = await blockchain.verifyHash(docHash);
    let txHash, blockNumber;

    if (bcCheck.exists) {
      txHash = "RECOVERED_FROM_BLOCKCHAIN";
      blockNumber = 0;
    } else {
      const result = await blockchain.anchorHash(docHash);
      txHash = result.txHash;
      blockNumber = result.blockNumber;
    }

    await db.query(
      `INSERT INTO documents 
            (uploader_id, institution_id, filename, original_hash, tx_hash, block_number, expiry_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        uploaderId,
        institution_id,
        filename,
        docHash,
        txHash,
        blockNumber,
        expiryDate || null,
      ],
    );

    await safeDelete(filePath);

    res.status(201).json({
      message: "Document anchored successfully",
      txHash,
      docHash,
    });
  } catch (error) {
    console.error("❌ Upload Error:", error.message);
    await safeDelete(filePath);
    res.status(500).json({ message: error.message });
  }
};

exports.verifyDocument = async (req, res) => {
  await ensureDB();

  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const filePath = req.file.path;

  try {
    const docHash = calculateFileHash(filePath);

    const bcResult = await blockchain.verifyHash(docHash);

    const [dbDoc] = await db.query(
      `SELECT d.*, i.name as institution_name 
             FROM documents d 
             JOIN institutions i ON d.institution_id = i.id 
             WHERE d.original_hash = ?`,
      [docHash],
    );

    let result = "invalid";
    let details = {};

    if (bcResult.exists && dbDoc.length > 0) {
      if (bcResult.status === "0" && dbDoc[0].status === "active") {
        result = "valid";
        const expiryDate = dbDoc[0].expiry_date || null;
        const isExpired = expiryDate ? new Date() > new Date(expiryDate) : false;
        details = {
          institution: dbDoc[0].institution_name,
          txHash: dbDoc[0].tx_hash,
          timestamp: dbDoc[0].created_at,
          expiryDate,
          isExpired,
        };

        // Generate cryptographic proof for PDF certificate
        const now = new Date().toISOString();
        const proofObject = generateProofObject({
          documentHash: docHash,
          institutionName: dbDoc[0].institution_name,
          verifiedAt: now,
          blockchainTx: dbDoc[0].tx_hash,
          blockNumber: bcResult.blockNumber || dbDoc[0].block_number || 0,
          verifierType: "public",
          expiryDate: dbDoc[0].expiry_date,
        });
        const proofHash = computeProofHash(proofObject);

        // Log verification record first (required FK for verification_proofs)
        const [verificationInsert] = await db.query(
          `INSERT INTO verifications (doc_id, verifier_id, uploaded_hash, stored_hash, result, verifier_ip)
           VALUES (?, NULL, ?, ?, 'valid', ?)`,
          [
            dbDoc[0].id,
            docHash,
            docHash,
            req.ip || null,
          ],
        );
        const verificationId = verificationInsert.insertId;

        // Store proof for certificate download
        await db.query(
          "INSERT INTO verification_proofs (verification_id, proof_hash, proof_object, blockchain_tx_hash, blockchain_block_number) VALUES (?, ?, ?, ?, ?)",
          [
            verificationId,
            proofHash,
            JSON.stringify(proofObject),
            dbDoc[0].tx_hash || null,
            bcResult.blockNumber || dbDoc[0].block_number || null,
          ],
        );
        console.log(
          `✅ Proof generated: ${proofHash.substring(0, 16)}... for doc ${docHash.substring(0, 16)}...`,
        );

        // Add certificate download info to response
        details.certificate = {
          proofHash,
          downloadPDF: `/api/certificates/download/${proofHash}`,
          downloadJSON: `/api/certificates/json/${proofHash}`,
          verifyOnline: `/verify-proof/${proofHash}`,
        };
      }
    }

    await safeDelete(filePath);

    res.json({ result, ...details });
  } catch (error) {
    console.error("❌ Verify Error:", error.message);
    await safeDelete(filePath);
    res.status(500).json({ message: error.message });
  }
};
