import jwt from "jsonwebtoken";

export const generateToken=async (userId)=>{
    //payload,jwtsecret
const token=await jwt.sign({
    userId
},process.env.JWT_SECRET);
return token;
}