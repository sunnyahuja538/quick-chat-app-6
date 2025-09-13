import React, { useContext, useEffect } from 'react'
import { useState } from 'react';
import { createContext } from 'react'
import { AuthDataContext } from './AuthContext';
import toast from 'react-hot-toast';


export const ChatDataContext=createContext();
const ChatContext = ({children}) => {
    const [messages,setMessages]=useState([]);
    const [users,setUsers]=useState([]);
    const [selectedUser,setSelectedUser]=useState(null);
    const [unseenMessages,setUnseenMessages]=useState({})//userId and number of message.
    const {socket,axios}=useContext(AuthDataContext);
    //function to get all users for sideBar.
    const getUsers=async ()=>{
        try {
            //console.log("DATA IS");
            const {data}=await axios.get("/api/messages/users");
            if(data.success){
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    //function to get messages for selected user
    const getMessages=async(userId)=>{
        try {
            const {data}=await axios.get(`/api/messages/${userId}`);
            if(data.success){
                console.log("Data",data);
                setMessages(data.messages);
            }
        } catch (error) {
           toast.error(error.message); 
        }
    }
    //function to send message to selected user
    const sendMessage=async(messageData)=>{
        try {
            const {data}=await axios.post(`/api/messages/send/${selectedUser._id}`,messageData);
            if(data.success){
                setMessages((prevMessages)=>(
                     [...prevMessages,data.newMessage]
                ))
                
            }
            else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    //subscribing
    const subscribeToMessages=async ()=>{
        if(!socket) return;
        socket.on("newMessage",(newMessage)=>{
            if(selectedUser&&newMessage.senderId===selectedUser._id){
                newMessage.seen=true;
                setMessages((prevMessage)=>([...prevMessage,newMessage]))
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }
            else{
            setUnseenMessages((prevUnseenMessage)=>{
                return({
                    ...prevUnseenMessage,
                    [newMessage.senderId]:prevUnseenMessage[newMessage.senderId]?prevUnseenMessage[newMessage.senderId]+1:1
                }
                )

                
            })
            }
        })
    }
    //unsubscribing.
    const unsubscribeFromMessage=()=>{
        if(socket) socket.off("newMessage");
    }
    useEffect(()=>{
        subscribeToMessages();
        return ()=>unsubscribeFromMessage();
        // 1. When the component unmounts

// Example: if you navigate away or remove this component from the tree.

// Cleanup runs → removes listeners, cancels timers, etc.

// Prevents “memory leaks” or “zombie listeners.
// useEffect is used to set up a listener once and clean it up properly, preventing multiple listeners and memory leaks.
    },[socket,selectedUser])
    const value={
        messages,users,selectedUser,getUsers,getMessages,sendMessage,
        setSelectedUser,unseenMessages,setUnseenMessages
    }
  return (
    <ChatDataContext.Provider value={value}>
        {children}
    </ChatDataContext.Provider>
  )
}

export default ChatContext