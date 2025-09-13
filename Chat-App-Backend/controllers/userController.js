
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import userModel from "../models/user.js";
import bcrypt from "bcryptjs"

//Signup a new user.
export const signup=async(req,res)=>{
    const {fullName,email,password,bio}=req.body;
    try{
    if(!fullName||!email||!password||!bio){
        return res.json({
            success:false,
            message:"Missing Details"
        })
        // But it does not literally stop the function like return does. If you don’t put a return before it, the code after res.json(...) will still run, which can cause errors like “Cannot set headers after they are sent”.
    }
    const user=await userModel.findOne({
        email:email
    })
    if(user){
        return res.json({
             success:false,
            message:"Account already exists"
        })
    }
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(password,salt);
    const newUser=await userModel.create({
        fullName,
        email,
        password:hashedPassword,
        bio
    })
    //token
    const token=generateToken(newUser._id);
    res.json({success:true,
        userData:newUser,
        token,
        message:"Account created successfully"
    })
}
catch(error){
    console.log(error);
    res.json({
        success:false,
        message:error.message
    })
}
}
//Login.
export const login=async(req,res)=>{
    try{
        const {email,password}=req.body;
        const user=await userModel.findOne({
            email
        })
        console.log(user);
        if(!user){
            return res.json({
                success:false,
                message:"Invalid email or password"
            })
        }
        const isPasswordCorrect=await bcrypt.compare(password,user.password);//boolean
        if(!isPasswordCorrect){
            return res.json({
                success:false,
                message:"Invalid email or password"
            })
        }
        const token=await generateToken(user._id);
        res.json({
            success:true,
            token,
            userData:user,
            message:"Logged in Successfully"
        })
    }
    catch(e){
res.json({
                success:false,
                message:e.message
            })
    }
}
export const checkAuth=(req,res)=>{
    res.json({
        success:true,user:req.user 
    })
}
//Update
export const updateProfile=async(req,res)=>{
    try{
        const {profilePic,bio,fullName}=req.body;
        const userId=req.user._id;
        let updatedUser;
        if(!profilePic){
            updatedUser=await userModel.findByIdAndUpdate(userId,{
                bio,
                fullName
            },{
                new:true //By default, Mongoose’s update methods return the old document (the one before the update).
            })
        }
        else{
            console.log(process.env.CLOUDINARY_API_KEY);
            const upload=await cloudinary.uploader.upload(profilePic);
            uploadUser=await userModel.findByIdAndUpdate(userId,{
                profilePic:upload.secure_url,
                bio,
                fullName
            },{
                new:true
            })
            
        }
        res.json({
            success:true,
            user:updatedUser
        })
    }
    catch(error){
        console.log(error.message)
        res.json({
            success:false,
            message:error.message
        })
    }
}
// Got it 👍 Let’s summarize everything you asked me about try–catch and throw in JavaScript:

// 🔹 Purpose of try–catch

// Wrap code that might fail (e.g., DB queries, file reads, JSON parsing).

// If an error happens inside try, execution jumps to catch instead of crashing the whole program.

// Without try–catch, an unhandled error will crash the program (stop execution).

// 🔹 What throw does

// throw creates an error and immediately stops execution inside the try.

// Control goes to the nearest catch.

// It’s like saying: “Stop here, something went wrong, handle it in catch.”

// Examples:

// throw "Something bad";              // throws a string (not recommended)
// throw new Error("Custom error");    // throws an Error object (recommended)

// 🔹 throw vs throw new Error

// throw "msg" → just throws a string, no .message or .stack.

// throw new Error("msg") → creates an Error object:

// {
//   name: "Error",
//   message: "msg",
//   stack: "Error: msg\n at ..."
// }


// The string you pass in new Error("...") becomes the .message field.

// 🔹 What catch (e) gets

// Whatever was thrown.

// If you did throw new Error("Oops"), then e is an Error object → e.message === "Oops".

// If you did throw "Oops", then e is just a string "Oops".

// console.log(e) → prints the whole object/string.

// console.log(e.message) → only works if e is an Error.

// 🔹 Throwing inside catch

// You can rethrow inside catch:

// catch (e) {
//   throw e; // passes error up to outer try–catch
// }


// Usually used if you want a higher-level function to handle the error.

// 🔹 Crash vs Normal Failure

// Crash = program exits completely because an error was unhandled.

// Normal failure = you catch the error (or return a failed response) so program keeps running.

// Example:

// throw new Error("DB down") without try–catch → crash.

// With try–catch, you can send a response like { success: false } → failure handled, program alive.

// ✅ In short:

// try–catch keeps your program alive when errors happen.

// throw signals an error and jumps to catch.

// throw new Error("msg") is best practice (gives .message, .stack).

// One request = one response. If failure is expected, handle with response. If it’s unexpected, throw and catch.