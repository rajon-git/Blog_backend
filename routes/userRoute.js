const express=require("express");
const router=express.Router();

const {register,login,fetchUsersCtrl,profile,updateCtrl,deleteuser,update_password,block_user,unblock_user,
    generateVerificationToken,accountVerification,forgetPasswordToken,passwordReset}=require("../controllers/userCtrl");
const authMiddleware=require("../middlewares/authMiddleware");

router.post("/register",register);
router.post("/login",login);
router.get("/",authMiddleware,fetchUsersCtrl);
router.get("/:id",profile);
router.put("/",authMiddleware,updateCtrl);
router.delete("/:id",deleteuser);
router.put("/password",authMiddleware,update_password);
router.put("/block-user/:id", authMiddleware, block_user);
router.put("/unblock-user/:id", authMiddleware, unblock_user);
router.put("/verify-account-token",authMiddleware,generateVerificationToken);
router.put("/account-verify",authMiddleware,accountVerification);
router.put("/password-reset-token",forgetPasswordToken);
router.put("/reset-password",passwordReset)
module.exports=router;