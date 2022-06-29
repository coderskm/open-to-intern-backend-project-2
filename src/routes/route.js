const express = require('express')
const router = express.Router()
const commonController = require('../controllers/commonController')

router.post("/functionup/colleges", commonController.createCollege);
router.post("/functionup/interns", commonController.createInterns );
router.get("/functionup/collegeDetails", commonController.getCollegeDetails);

module.exports = router;