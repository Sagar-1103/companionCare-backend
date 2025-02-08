import { User } from "./models/user.model.js";
import { Patient } from "./models/patient.model.js";
import grpc from "@grpc/grpc-js";
import dotenv from "dotenv";
import protoLoader from "@grpc/proto-loader";
import { v4 as uuidv4 } from "uuid";
dotenv.config();

const chatProtoPath = "./protos/chat.proto";
const packageDefinition = protoLoader.loadSync(chatProtoPath, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});

const ChatService = grpc.loadPackageDefinition(packageDefinition).ChatService;
const chatClient = new ChatService(
  process.env.CHAT_SERVICE_PORT,
  grpc.credentials.createInsecure()
);

const createPatientWithoutCaretaker = async (call, cb) => {
  try {
    const { name, email, password, phNo, dob, gender, role } = call.request;
    if (!name || !email || !password || !phNo || !dob || !gender || !role) {
      return cb(
        {
          code: grpc.status.INVALID_ARGUMENT,
          message: "Missing required fields.",
        },
        null
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return cb(
        {
          code: grpc.status.ALREADY_EXISTS,
          message: "User already exists.",
        },
        null
      );
    }

    const createdUser = await User.create({ email, password, role, phNo });
    if (!createdUser) {
      return cb(
        {
          code: grpc.status.INTERNAL,
          message: "Failed to create user.",
        },
        null
      );
    }

    const genCode = uuidv4();
    const createdPatient = await Patient.create({
      patientId: createdUser._id,
      name,
      gender,
      dob,
      code: genCode.slice(0, 6),
    });
    if (!createdPatient) {
      return cb(
        {
          code: grpc.status.INTERNAL,
          message: "Failed to create patient.",
        },
        null
      );
    }
    const res = {
      id: createdUser._id,
      name: createdPatient.name,
      email: createdUser.email,
      password: undefined,
      role: createdUser.role,
      phNo: createdUser.phNo,
      dob: createdPatient.dob,
      gender: createdPatient.gender,
      code: createdPatient.code,
    };
    return cb(null, {
      message: "User created successfully.",
      patient: res,
    });
  } catch (error) {
    console.error("Error in patient wihtout caretaker:", error);
    return cb({
      code: grpc.status.INTERNAL,
      message: "Internal Server Error: " + error.message,
    });
  }
};


const createPatientTokenOnLogin = async (call,cb)=>{
  try {
    let {email,password} = call.request;
        if(!email || !password) {
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Missing required fields.",
            },null);
        }
        let loggedUser = await User.findOne({email});
        if(!loggedUser) {
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "No user found.",
            },null);
        }
    
        const isPasswordValid = await loggedUser.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Incorrect Credentials",
            },null);
        }
        const accessToken = loggedUser.generateAccessToken();
        const refreshToken = loggedUser.generateRefreshToken();
        if(!accessToken || !refreshToken) {
            return cb({
                code: grpc.status.INTERNAL,
                message: "Failed to generate tokens.",
            },null);
        }
        loggedUser.refreshToken = refreshToken;
        await loggedUser.save({ validateBeforeSave: "false" });
        
        let tempUser = loggedUser;
        const fetchedUser = await Patient.findOne({patientId:loggedUser._id});
        tempUser.dob = fetchedUser.dob;
        tempUser.name = fetchedUser.name;
        tempUser.gender = fetchedUser.gender;
        tempUser.code = fetchedUser.code;
        tempUser.caretakerId = fetchedUser.caretakerId;
        tempUser.doctorId = fetchedUser.doctorId;
        tempUser.roomIds = fetchedUser.roomIds
        return cb(null, {
            message: "Access and refresh tokens generated",
            patient:tempUser,
            refreshToken,
            accessToken
        });
  } catch (error) {
    console.error("Error in creating patient token on login :", error);
    return cb({
      code: grpc.status.INTERNAL,
      message: "Internal Server Error: " + error.message,
    });
  }
}


const createTokenOnCode = async(call,cb)=>{
  try {
    let {code} = call.request;
      if(!code) {
          return cb({
              code: grpc.status.INVALID_ARGUMENT,
              message: "Missing required fields.",
          },null);
      }
      const temp = await Patient.findOne({code});
      if(!temp){
        return cb({
          code: grpc.status.NOT_FOUND,
          message: "Code Invalid.",
      },null);
      }
      let loggedUser = await User.findById(temp.patientId);
      const accessToken = loggedUser.generateAccessToken();
      const refreshToken = loggedUser.generateRefreshToken();
      if(!accessToken || !refreshToken) {
          return cb({
              code: grpc.status.INTERNAL,
              message: "Failed to generate tokens.",
          },null);
      }
      loggedUser.refreshToken = refreshToken;
      await loggedUser.save({ validateBeforeSave: "false" });
      
      let tempUser = loggedUser;
          const fetchedUser = await Patient.findOne({patientId:loggedUser._id});
          tempUser.dob = fetchedUser.dob;
          tempUser.name = fetchedUser.name;
          tempUser.gender = fetchedUser.gender;
          tempUser.code = fetchedUser.code;
          tempUser.caretakerId = fetchedUser.caretakerId;
          tempUser.doctorId = fetchedUser.doctorId;
          tempUser.roomIds = fetchedUser.roomIds
          
      return cb(null, {
          message: "Access and refresh tokens generated",
          patient:tempUser,
          refreshToken,
          accessToken
      });
  } catch (error) {
    console.error("Error in creating patient token on code login :", error);
    return cb({
      code: grpc.status.INTERNAL,
      message: "Internal Server Error: " + error.message,
    });
  }
}

const getCurrentPatient = async(call,cb)=>{
  try {
    const {id} = call.request;
    if(!id){
        return cb({
            code: grpc.status.INVALID_ARGUMENT,
            message: "Missing required fields.",
        },null);
    }
    const fetchedUser = await User.findById(id);
    if(!fetchedUser){
        return cb({
            code: grpc.status.INVALID_ARGUMENT,
            message: "No user found",
        },null);
    }
    fetchedUser.password = undefined;
    let tempUser = fetchedUser;
    console.log(fetchedUser);
    
    const fetchedPatient = await Patient.findOne({patientId:fetchedUser._id});
    tempUser.dob = fetchedPatient.dob;
    tempUser.name = fetchedPatient.name;
    tempUser.gender = fetchedPatient.gender;
    tempUser.code = fetchedPatient.code;
    tempUser.caretakerId = fetchedPatient.caretakerId;
    tempUser.doctorId = fetchedPatient.doctorId;
    tempUser.roomIds = fetchedPatient.roomIds
    return cb(null, {
        message: "Current user fetched successfully.",
        patient:tempUser,
    });
  } catch (error) {
    console.error("Error in getting patient :", error);
    return cb({
      code: grpc.status.INTERNAL,
      message: "Internal Server Error: " + error.message,
    });
  }
}


export { createPatientWithoutCaretaker,createPatientTokenOnLogin,createTokenOnCode,getCurrentPatient };
