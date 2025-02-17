import grpc from "@grpc/grpc-js";
import dotenv from "dotenv";
import { Report } from "./models/report.model.js";
import { v2 as cloudinary } from "cloudinary";
import generateMedicalReportPDF from "./utils/genPdf.js";
dotenv.config();

const uploadToCloudinary = async (base64) => {
  const response = await cloudinary.uploader.upload(
    `data:image/png;base64,${base64}`,
    {
      folder: "reports",
    }
  );
  return response.secure_url;
};

const storeReport = async (call, cb) => {
  try {
    const { id, name, role, baseImage } = call.request;
    if (!id || !role || !name || !baseImage) {
      return cb(
        {
          code: grpc.status.INVALID_ARGUMENT,
          message: "Missing required fields.",
        },
        null
      );
    }

    const base64Image = baseImage.toString("base64");
    const reportUrl = await uploadToCloudinary(base64Image);
    if (!reportUrl) {
      return cb(
        {
          code: grpc.status.INTERNAL,
          message: "Error uploading reports to cloudinary",
        },
        null
      );
    }
    let genReport;
    if (role === "patient") {
      genReport = await Report.create({
        report: reportUrl,
        name,
        patientId: id,
      });
    }
    if (role === "doctor") {
      genReport = await Report.create({
        report: reportUrl,
        name,
        doctorId: id,
      });
    }
    if (!genReport) {
      return cb(
        {
          code: grpc.status.NOT_FOUND,
          message: "Couldnt save generated report.",
        },
        null
      );
    }
    return cb(null, {
      message: "Generated report stored successfully.",
      report: genReport,
    });
  } catch (error) {
    console.error("Error storing report:", error);
    return cb({
      code: grpc.status.INTERNAL,
      message: "Internal Server Error: " + error.message,
    });
  }
};

const generateReport = async (call, cb) => {
  try {
    const { patientName, doctorId, doctorName, imageBase64 } = call.request;
    if (!patientName || !doctorId || !doctorName || !imageBase64) {
      return cb(
        {
          code: grpc.status.INVALID_ARGUMENT,
          message: "Missing required fields.",
        },
        null
      );
    }
    const pdfFilePath = await generateMedicalReportPDF({
      patientName,
      doctorName,
      imageBase64,
    });
    if (!pdfFilePath) {
      return cb(
        {
          code: grpc.status.NOT_FOUND,
          message: "Couldnt generate report.",
        },
        null
      );
    }
    const doneReport = await Report.create({
      report: pdfFilePath,
      name: patientName,
      doctorId,
    });
    if (!doneReport) {
      return cb(
        {
          code: grpc.status.NOT_FOUND,
          message: "Couldnt save generated report.",
        },
        null
      );
    }
    return cb(null, {
      message: "Generated report stored successfully.",
      report: doneReport,
    });
  } catch (error) {
    console.error("Error storing report:", error);
    return cb({
      code: grpc.status.INTERNAL,
      message: "Internal Server Error: " + error.message,
    });
  }
};

const getReportForPatient = async (call, cb) => {
  try {
    const { patientId } = call.request;
    if (!patientId) {
      return cb(
        {
          code: grpc.status.INVALID_ARGUMENT,
          message: "Missing required fields.",
        },
        null
      );
    }

    const reports = await Report.find({ patientId });
    return cb(null, {
      message: "Fetched stored reports successfully.",
      reports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return cb({
      code: grpc.status.INTERNAL,
      message: "Internal Server Error: " + error.message,
    });
  }
};

const getReportForDoctor = async (call, cb) => {
  try {
    const { doctorId } = call.request;
    if (!doctorId) {
      return cb(
        {
          code: grpc.status.INVALID_ARGUMENT,
          message: "Missing required fields.",
        },
        null
      );
    }

    const reports = await Report.find({ doctorId });
    return cb(null, {
      message: "Fetched stored reports successfully.",
      reports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return cb({
      code: grpc.status.INTERNAL,
      message: "Internal Server Error: " + error.message,
    });
  }
};

export { storeReport, getReportForPatient, getReportForDoctor, generateReport };
