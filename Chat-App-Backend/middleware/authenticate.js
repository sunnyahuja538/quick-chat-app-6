import jwt from "jsonwebtoken";
import userModel from "../models/user.js";
export const protectRoute=async(req,res,next)=>{
    try{
        const token=req.headers.token;
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const user =await userModel.findById(decoded.userId).select("-password");//password does not travel in a request.
        if(!user){
            return res.json({
                success:false,
                message:"user not found"
            })
        }
        req.user=user;
        next();
    }
    catch(error){
        console.log(error.message)
        res.json({
            success:false,
            message:error.message
        })
    }
}