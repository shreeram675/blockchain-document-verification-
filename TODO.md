# DocVerify Deployment Fix - CertificateService Syntax Error
Approved plan: Fix PDFKit chaining syntax in certificateService.js + minor controller polish.

## Steps (In Order):
- [ ] 1. Create TODO.md (done)
- [x] 2. Edit server/services/certificateService.js - Fix broken .text() chains
- [x] 3. Edit server/controllers/certificateController.js - Add missing path require
- [x] 4. Test locally: Run server/test_certificate.js (passed syntax, DB not configured locally)
- [x] 5. Test server startup: npm start in server/ (success - started on port 5000, DB expected fail locally)
- [ ] 6. User redeploys Docker/Render
- [ ] 7. Verify PDF endpoint works
- [ ] 8. Complete task

Current: Edits complete. Ready for Docker redeploy. ✅
