import React, { useContext, useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSideBar from '../components/RightSideBar'
import { ChatDataContext } from '../../context/ChatContext'

const HomePage = () => {
  const {selectedUser}=useContext(ChatDataContext)
    return (
    <div className='border w-full h-screen px-[15%] py-[5%]'>
        <div className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-[100%] grid grid-cols-1 relative ${selectedUser?'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]':'md:grid-cols-2'}`}>
        <Sidebar />
        <ChatContainer/>
        <RightSideBar/>
    </div>
    </div>//in sm the screen width should be atleast 640px
  )
}

export default HomePage