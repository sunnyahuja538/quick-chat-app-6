import React from 'react'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePages from './pages/ProfilePages'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import {Toaster} from "react-hot-toast";
import { useContext } from 'react'
import {  AuthDataContext } from '../context/AuthContext.jsx'
const App = () => {
  const {authUser}=useContext(AuthDataContext);
  return (
    <div className="bg-[url('./src/assets/bgImage.svg')] bg-contain">
      <Toaster/>
      <Routes>
        <Route path='/' element={authUser?<HomePage/>:<Navigate to='/login'/>}/>
        <Route path='/login' element={!authUser?<LoginPage/>:<Navigate to='/'/>}/>
        <Route path='/profile' element={authUser?<ProfilePages/>:<Navigate to='/login'/>}/>
      </Routes>
    </div>
  )
}

export default App