const User=require("../models/userModel");
const sgMail = require("@sendgrid/mail");
const bcrypt=require("bcrypt");
const crypto = require("crypto");
const fs = require("fs");
const asyncHandler = require("express-async-handler");
const generateToken=require("../helpers//generateToken");
const validateMongodbId=require("../helpers/validateMongodbId");
const blockUser=require("../helpers/blockUser");
sgMail.setApiKey(process.env.SEND_GRID_API_KEY);


//register user

const register = asyncHandler(async (req, res) => {
    //Check if user Exist
  const userExists = await User.findOne({ email: req?.body?.email });

  if (userExists) throw new Error("User already exists");
  try {
    //Register user
    const user = await User.create({
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      password: req?.body?.password,
    });
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});
  
  //@desc Login  user
  //@route POST /api/v1/users/login
  //@access public
  
  const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  //check if user exists
  const userFound = await User.findOne({ email });
  //check if blocked
  if (userFound?.isBlocked)
    throw new Error("Access Denied You have been blocked");
  if (userFound && (await userFound.isPasswordMatched(password))) {
    //Check if password is match
    res.json({
      _id: userFound?._id,
      firstName: userFound?.firstName,
      lastName: userFound?.lastName,
      email: userFound?.email,
      profilePhoto: userFound?.profilePhoto,
      isAdmin: userFound?.isAdmin,
      token: generateToken(userFound?._id),
     // isVerified: userFound?.isAccountVerified,
    });
  } else {
    res.status(401);
    throw new Error("Invalid Login Credentials");
  }
  });

  //all users

  const fetchUsersCtrl=asyncHandler(async(req,res)=>{
    try{
      const users=await User.find({}) //.populate("posts");
      res.json(users);
    }catch(error){res.json(error)}
  });

  //single user profile

  const profile=asyncHandler(async(req,res)=>{
    const {id}=req?.params;
    //valide mongodb id
    validateMongodbId(id);
    try{
      const user=await User.findById(id);
      res.json(user);
    }catch(error){res.json(error)}
  });

  
  //update a user
  const updateCtrl=asyncHandler(async(req,res)=>{
    const { _id } = req?.user;
     //block
  blockUser(req?.user);
  validateMongodbId(_id);
  const user = await User.findByIdAndUpdate(
    _id,
    {
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      bio: req?.body?.bio,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.json(user);
  });

  //delete a user

  const deleteuser=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    validateMongodbId(id);
    try{
      const deleteUser=await User.findByIdAndDelete(id);
      res.json(deleteUser);
    }catch(error){res.json(error)}
  });


  //update user password

  const update_password=asyncHandler(async(req,res)=>{
  //destructure the login user
  const { _id } = req.user;
  const { password } = req.body;
  validateMongodbId(_id);
  //Find the user by _id
  const user = await User.findById(_id);

  if (password) {
    user.password = password;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.json(user);
  }
  });

  //block a user
  const block_user=asyncHandler(async(req,res)=>{
    const { id } = req.params;
    validateMongodbId(id);

   const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: true,
    },
    { new: true }
    );
   res.json(user);
  });

  //unblock a user
  const unblock_user=asyncHandler(async(req,res)=>{
    const { id } = req.params;
  validateMongodbId(id);

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: false,
    },
    { new: true }
  );
  res.json(user);
  });

  //GENERATE VERIFICATION TOKEN
  const generateVerificationToken=asyncHandler(async(req,res)=>{
    const loginUserId = req.user.id;
    const user = await User.findById(loginUserId);
  
    try {
      //Generate token
      const verificationToken = await user?.createAccountVerificationToken();
      //save the user
      await user.save();
      console.log(verificationToken);
      //build your message
      const resetURL = `If you were requested to verify your account, verify now within 10 minutes, otherwise ignore this message <u><a href="http://localhost:3000/verify-account/${verificationToken}">Click to verify your account</a></u>`;
  
      const msg = {
        to: user?.email,
        from: "rajon.charteredskills@gmail.com",
        subject: "Verify your account",
        html: resetURL,
      };
      console.log(msg);
      await sgMail.send(msg);
      res.json(resetURL);
    } catch (error) {
      res.json(error);
    }
  });

  //account verification

  const accountVerification=asyncHandler(async(req,res)=>{
    const {token}=req.body;
    const hashedToken=crypto.createHash("sha256").update(token).digest("hex");
    //find this user by token
    const user=await User.findOne({
      accountVerificationToken:hashedToken,
      accountVerificationTokenExpires: { $gt: new Date() },
    });
    if(!user) throw new Error("Token expired,try again");
    //update the proprt to true
     user.isAccountVerified = true;
     user.accountVerificationToken = undefined;
     user.accountVerificationTokenExpires = undefined;
     await user.save();
     res.json(user);
  });

  //send forgot password token 
  const forgetPasswordToken=asyncHandler(async(req,res)=>{
    const {email}=req.body;
    const user=await User.findOne({email});
    if(!user) throw new Error("User not found");
    try{
      const token=await user.createPasswordResetToken();
      await user.save();
      //build message 
      const resetURL = `If you were requested to reset your password, reset now within 10 minutes, otherwise ignore this message <a href="http://localhost:3000/reset-password/${token}">Click to Reset</a>`;
      const msg = {
        to: email,
        from: "rajon.charteredskills@gmail.com",
        subject: "Reset Password",
        html: resetURL,
      };
      await sgMail.send(msg);
      res.json({
        msg: `A verification message is successfully sent to ${user?.email}. Reset now within 10 minutes, ${resetURL}`,
      });
    }catch(error){res.json(error)}
  });

  //reset password

  const passwordReset=asyncHandler(async(req,res)=>{
    const {token,password}=req.body;
    const hashedToken=crypto.createHash("sha256").update(token).digest("hex");
    //find this user by token
    const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
    });
     if (!user) throw new Error("Token Expired, try again later");
     //Update/change the password
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
       res.json(user);
  });

  

module.exports={register,login,fetchUsersCtrl,profile,updateCtrl,deleteuser,update_password,block_user,
  unblock_user,generateVerificationToken,accountVerification,forgetPasswordToken,passwordReset};
