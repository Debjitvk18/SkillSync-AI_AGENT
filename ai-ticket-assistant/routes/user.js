import express from "express";
import {signup,login,updateUser,getUser,logout} from "../controller/user.js";
import {authenticate} from "../middlewares/auth.js";
const router=express.Router();

router.put("/update-user",authenticate,updateUser)
router.get("/users",authenticate,getUser)
router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)



export default router;