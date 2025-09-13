import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import http from "http";
import  {connectDB}  from './lib/db.js';
import router from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';//import server of socket.io
dotenv.config();
const app=express();
const server=http.createServer(app);//socket.io support this http server. // gives you access the raw server.





//initialize socket.io server
export const io=new Server(server,{
    cors:{
        origin:"*"//it will allow all the origin
    }
})

//store online users
export const userSocketMap={};//{userId:socketId}
//socket.io connection handler
io.on("connection",(socket)=>{
 const userId=socket.handshake.query.userId;//socket.handshake.query

// When a client connects to your Socket.IO server, it can send extra data along with the connection request in the query string.
    console.log("user connected",userId);
    if(userId){
        userSocketMap[userId]=socket.id;
    }
    //emit online users to all connected clients.
    io.emit("getOnlineUsers",Object.keys(userSocketMap));//this is broadcasting.
    socket.on("disconnect",()=>{
        console.log("User Disconnected",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})
app.use(express.json({limit:'4mb'}));
app.use(cors());
//connect db.
connectDB();
app.get("/api/status",(req,res)=>{
    res.send("server is live");
});
//use the router.
app.use('/api/auth',router);
app.use('/api/messages',messageRouter)
const PORT=process.env.PORT||5000
server.listen(PORT,()=>{
    console.log("server started");
});