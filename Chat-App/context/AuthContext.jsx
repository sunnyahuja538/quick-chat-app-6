import { createContext } from "react";
import axios from "axios"
import toast from "react-hot-toast";
import { useEffect } from "react";
import {io} from "socket.io-client"
import { useState } from "react";

export const AuthDataContext=createContext(null);
const backendUrl=import.meta.env.VITE_BASE_URL;
axios.defaults.baseURL=backendUrl
const AuthContext=({children})=>{
    const [token, setToken] = useState(localStorage.getItem("token"))
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null)
    //Check if user is authenticated and if so, set the user data and connect the socket.
    const checkAuth=async ()=>{
        try {
            const response=await axios.get("/api/auth/check");
            const data=response.data;
            if(data.success){
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
    //login function to handle user auth and socket connection


    //json is string notation of an object
    const login=async(state,credentials)=>{
        try {
            const {data}=await axios.post(`/api/auth/${state}`,credentials);
            if(data.success){
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"]=data.token;//Once you set it, Axios will automatically include it in every request (GET, POST, etc.) you make afterwards.
                setToken(data.token);
                localStorage.setItem("token",data.token);
                toast.success(data.message)
            }
            else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
// localStorage is specific to each origin (frontend).
// localStorage cannot be directly accessed from the backend.



// This is client-side state (probably from useState).
// It only affects your own frontend.


//update profile
const updateProfile=async (body)=>{
    try{
    const {data}=await axios.put("/api/auth/update-profile",body);
    if(data.success){
        setAuthUser(data.user);
        toast.success("Profile updated")
    }
    }
    catch(error){
        toast.error(error.message);
    }
}
    const logout=async ()=>{
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"]=null;
        toast.success("loggedOut");
        socket.disconnect();
    }


    //Connect socket function to handle socket connection and online users updates


    //you cannot use export inside a function.
    const connectSocket=(userData)=>{
        if(!userData||socket?.connected) return;
        const newSocket=io(backendUrl,{
            query:{
                userId:userData._id,
            }
        })
        newSocket.connect();
        setSocket(newSocket);
        newSocket.on("getOnlineUsers",(userIds)=>{
            setOnlineUsers(userIds);
        })
    }
    useEffect(()=>{
        if(token){
            axios.defaults.headers.common["token"]=token;
            checkAuth();
        }
},[token])
    const value={
        authUser,
        onlineUsers,
        socket,
        token,
        login,
        logout,
        updateProfile,
        checkAuth,
        axios
    }
    return(
        <AuthDataContext.Provider value={value}>
            {children}
        </AuthDataContext.Provider>
    )
}
export default AuthContext;