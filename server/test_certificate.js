const db = require('./config/db');
const certificateService = require('./services/certificateService');
const path = require('path');
const fs = require('fs');

async function testCertificateGeneration() {
  try {
    console.log('🧪 Testing certificate generation...');
    
    // Sample proof hash (replace with real one from DB)
    const sampleProofHash = 'your_sample_proof_hash_64_hex_chars_here'; // Get from DB: SELECT proof_hash FROM verification_proofs LIMIT 1;
    
    if (!sampleProofHash || sampleProofHash.length !== 64) {
      console.log('❌ No valid proof hash. Create one first or check DB.');
      console.log('Run: SELECT proof_hash FROM verification_proofs LIMIT 1;');
      return;
    }

    // Fetch real proof data
    const [proofs] = await db.query(
      'SELECT proof_object FROM verification_proofs WHERE proof_hash = ?',
      [sampleProofHash]
    );

    if (proofs.length === 0) {
      console.log('❌ No proof found. List available: SELECT proof_hash FROM verification_proofs;');
      return;
    }

    const proofObject = typeof proofs[0].proof_object === 'string' 
      ? JSON.parse(proofs[0].proof_object) 
      : proofs[0].proof_object;

    // Generate PDF
    const filepath = await certificateService.generatePDFCertificate({
      proofHash: sampleProofHash,
      proofObject
    });

    console.log(`✅ PDF generated: ${path.basename(filepath)}`);
    console.log(`📱 QR links to: ${process.env.FRONTEND_URL}/verify-proof/${sampleProofHash}`);
    
    // Test JSON
    const jsonCert = certificateService.generateJSONCertificate({
      proofHash: sampleProofHash,
      proofObject
    });
    console.log('✅ JSON certificate:', JSON.stringify(jsonCert, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testCertificateGeneration();
