import express from "express"
import { checkAuth, login, signup, updateProfile } from "../controllers/userController.js";
import { protectRoute } from "../middleware/authenticate.js";
const router=express.Router();
router.post('/signup',signup);
router.post('/login',login);
router.put('/update-profile',protectRoute,updateProfile);
router.get('/check',protectRoute,checkAuth);
export default router;