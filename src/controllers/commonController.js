const collegeModel = require('../models/collegeModel');
const internModel = require('../models/internModel');
const mongoose = require("mongoose");
// validation functions
const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value === "number") return false;
  return true;
};


const isValidBody = function (requestBody) {
  return Object.keys(requestBody).length > 0;
};

const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
};

const createCollege = async (req, res) => {
    try {
        const collegeData = req.body;
        let urlRegex =/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
        let nameRegex = /^[A-Za-z_ ]+$/



        if (!isValidBody(collegeData)) {
            return res.status(400).send({ status: false, message: "Invalid College Details. Please enter college details" })
        }

        let { name, fullname, logoLink } = collegeData;
        if (!isValid(name)) {
            return res.status(400).send({status:false, message:"college name is required"})
        }
        if (!isValid(fullname)) {
            return res.status(400).send({status:false, message:"college full name is required"})
        }
        if (!isValid(logoLink)) {
            return res.status(400).send({status:false, message:"link of college's logo is required"})
        }
        let uniqueName = await collegeModel.findOne({ name: name });
        if (uniqueName) {
            return res.status(400).send({status:false, message:"college name already exist"})
        }

        let uniqueFullName = await collegeModel.findOne({ name: name });
        if (uniqueFullName) {
          return res
            .status(400)
            .send({ status: false, message: "college full name already exist"});
        }
        if (!name.match(nameRegex)) {
            return res.status(400).send({status:false, message:"name is not legit. It should contain only alphabets"})
        }
        if (!fullname.match(nameRegex)) {
            return res.status(400).send({status:false, message:"full name is not legit. It should contain only alphabets"})
        }
        if (!urlRegex.test(logoLink)) {
            return res.status(400).send({status:false, message:"logo URL is not legit"})
        }

        let college = await collegeModel.create(collegeData);
        res.status(201).send({status:true, data: college})

    } catch (err) {
        res.status(500).send({status:false, message:err.message})
    }
}

const createInterns = async (req, res) => {
    try {
        let internData = req.body;
        let nameRegex = /^[a-zA-Z ]{2,20}$/;
        let emailRegex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
        let mobileRegex = /^[6-9]\d{9}$/

        if (!isValidBody(internData)) {
            return res.status(400).send({ status: false, message: "Invalid Intern Details. Please enter intern details correctly" })
        }
        let { name, email, mobile, collegeId } = internData;
        if (!isValid(name)) {
            return res.status(400).send({status:false, message: "intern's name is required"})
        }
        if (!isValid(email)) {
          return res
            .status(400)
            .send({ status: false, message: "intern's email is required" });
        }
        if (!isValid(mobile)) {
            return res
              .status(400)
              .send({ status: false, message: "intern's mobile number is required" });
        }
        
        if (!isValidObjectId(collegeId)) {
            return res.status(400).send({status:false, message:"college ID is not legit"})
        }
        if (!name.match(nameRegex)) {
          return res.status(400).send({status: false,message: "name is not legit. It should contain only alphabets",
            });
        }
        if (!email.match(emailRegex)) {
            return res.status(400).send({status:false, message:"email is not legit."})
        }
        if (!mobile.match(mobileRegex)) {
            return res.status(400).send({status:false, message:"mobile number is not legit should be of 10 digits"})
        }

        let checkCollegeId = await collegeModel.findById(collegeId)
        if (!checkCollegeId) {
            return res.status(400).send({status:false, message:"college not found"})
        }
        if (checkCollegeId.isDeleted == true) {
            return res
              .status(400)
              .send({ status: false, message: "college is deleted" });
        }

        let checkUniqueEmail = await internModel.findOne({ email: email })
        if (checkUniqueEmail) {
            return res
              .status(400)
              .send({ status: false, message: "email already in use" });
        }
        let checkUniqueMobile = await internModel.findOne({ mobile: mobile })
        if (checkUniqueMobile) {
            return res
              .status(400)
              .send({ status: false, message: "mobile number already in use" });
        }
        const intern = await (await internModel.create(internData)).populate('collegeId')
        res.status(201).send({status:true,data:intern})

    } catch (err) {
        res.status(500).send({status:false, message:err.message})
    }
}

// data :-name, fullName, logoLink, "interns"

// inside interns :- id, name, email, mobile
const getCollegeDetails = async(req, res) => {
    try {
        let collegeName = req.query.collegeName;
        if (!collegeName) {
            return res.status(400).send({status:false, message:"college name not entered"})
        }
        if (!isValid(collegeName)) {
            return res.status(400).send({status:false, message:"enter valid college name"})
        }
        
        let collegeDetail = await collegeModel.findOne({ name: collegeName, isDeleted: false }).select({ name: 1, fullname: 1, logoLink: 1 });
        if (!collegeDetail) {
            return res.status(400).send({status:false, message:"no details for such college"})
        }
        let internDetails = await internModel.find({ collegeId: collegeDetail._id, isDeleted: false }).select({ _id: 1, name: 1, email: 1, mobile: 1 })
        
        if (internDetails.length == 0) {
            return res.status(400).send({ status: false, message: "no interns found" });
        }
        
        let finalInternDetails = { collegeDetail };
        finalInternDetails.interns = internDetails;
        res.status(200).send({status:true, data:finalInternDetails})
    } catch (err) {
        res.status(500).send({status: false, message: err.message})
    }
}



module.exports.createCollege = createCollege;
module.exports.createInterns = createInterns;
module.exports.getCollegeDetails = getCollegeDetails;