import { ApiResponse } from "./ApiResponse.js";

const AsyncHandler = (fn)=>async(req,res,next)=>{
  try {
    await fn(req,res,next)
  } catch (error) {
    res.status(error.statusCode||500).json(new ApiResponse(error.statusCode||500,undefined,error.message))
    }
  }
  
  export { AsyncHandler };