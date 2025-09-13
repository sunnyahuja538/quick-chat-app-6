import mongoose from "mongoose";

const messageSchema=new mongoose.Schema({
    senderId:{type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    text:{
        type:String
    },
    image:{
        type:String
    },
    seen:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true//automatically add the data that when the user was created.
})
const messageModel=mongoose.model("Message",messageSchema)
export default messageModel;