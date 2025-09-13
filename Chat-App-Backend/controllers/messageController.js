import cloudinary from "../lib/cloudinary.js";
import messageModel from "../models/message.js";
import userModel from "../models/user.js";
import { userSocketMap,io } from "../server.js";

//get all except the logged in user
export const getUsersForSideBar=async(req,res)=>{
    try {
        const userId=req.user._id;
        const filteredUsers=await userModel.find({
            _id:{
                $ne:userId
            }
        }).select("-password");
        //count number of message not seen
        const unseenMessages={}
        const promises=filteredUsers.map(async(user)=>{
            const messages=await messageModel.find({
                senderId:user._id,
                receiverId:userId,
                seen:false
            })
            if(messages.length>0){
                unseenMessages[user._id]=messages.length
            }
        })
        await Promise.all(promises);//resolve all promises parallely.
        res.json({
            success:true,
            users:filteredUsers,
            unseenMessages
        })
    } catch (error) {
        console.log(error.message);
        res.json({
            success:false,
            message:error.message
        })
    }
}
//get all messages for selected users
export const getMessages=async(req,res)=>{
    try {
        const {id:selectedUserId}=req.params;//key:newName, params is used for passing userId.
        const myId=req.user._id;
        const messages=await messageModel.find({
            $or:[
                {senderId:myId,receiverId:selectedUserId},
                {senderId:selectedUserId,receiverId:myId}

            ]
        })
        await messageModel.updateMany({
            senderId:selectedUserId,
            receiverId:myId
        },
    {
        seen:true
    })
    res.json({
        success:true,
        messages
    })
    } catch (error) {
         res.json({
            success:false,
            message:error.message
        })
    }
}
//api to mark message as seen using message id(for single message).
export const markMessageAsSeen=async(req,res)=>{
    try {
       const {id}=req.params;
       await messageModel.findByIdAndUpdate(id,{
        seen:true
       })
       res.json({
        success:true
       });
    } catch (error) {
        res.json({
            success:false,
            message:error.message
        })
    }
}
//send message to selected user
export const sendMessage=async(req,res)=>{
    try {
        const {text,image}=req.body;
        const receiverId=req.params.id;
        const senderId=req.user._id;
        let imageUrl;
        if(image){
            const uploadRes=await cloudinary.uploader.upload(image);
            imageUrl=uploadRes.secure_url;
        }
        const newMessage=await messageModel.create({
            senderId,
            receiverId,
            text,
            image:imageUrl
        })
        //new message to receiver socket
        const receiverSocketId=userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage);
        }
        res.json({
            success:true,
            newMessage
        })
    } catch (error) {
        res.json({
            success:false,
            message:error.message
        })
    }
}