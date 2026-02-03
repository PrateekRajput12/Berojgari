import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "resumes",
        format: async (req, file) => file.mimetype.split("/")[1], // pdf, doc, docx
        public_id: (req, file) => `resume-${Date.now()}-${file.originalname}`,
    },
});
console.log("in cloduiny")

const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const ext = file.originalname.split(".").pop().toLowerCase();

    if (allowedTypes.test(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF/DOC/DOCX allowed"));
    }

    console.log("file filter")
};

const uploadResume = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter,
});




export default uploadResume;
