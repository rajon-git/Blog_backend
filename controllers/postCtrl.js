const asyncHandler=require("express-async-handler");
const Post=require("../models/postModel");
const User=require("../models/userModel");
const blockUser=require("../helpers/blockUser");
const Filter=require("bad-words");
const fs = require("fs");
const cloudinaryUploadImg=require("../helpers/cloudinary");
//create post
const create=asyncHandler(async(req,res)=>{
    try{
        const {_id}=req.user;
        //show is user block
        blockUser(req.user);
        //check bad words
        const filter=new Filter();
        const isProfane=filter.isProfane(req.body.title, req.body.description);
        //block user
        if(isProfane){
            await User.findByIdAndUpdate(_id,{
                isBlocked:true
            });
            throw new Error("Creating failed because you used bad words and you have been blocked");
        }

         // //1. Get the path to img
         const localPath = `public/images/posts/${req.file.filename}`;
          // //2.Upload to cloudinary
         const imgUploaded = await cloudinaryUploadImg(localPath);
         try {
           const post = await Post.create({
            ...req.body,
            user: _id,
            image: imgUploaded?.url,
         });
         console.log(req.user);
         //update the user post count
         await User.findByIdAndUpdate(
         _id,
         {
          $inc: { postCount: 1 },
         },
         {
          new: true,
         }
        );

          //Remove uploaded img
        fs.unlinkSync(localPath);
        res.json(post);
        } catch (error) {
         res.json(error);
        }
       }catch(error){res.json(error)}
});
//all pots
const fetchPosts=asyncHandler(async(req,res)=>{
    try{}catch(error){res.json(error)}
});

//post details
const fetchPost=asyncHandler(async(req,res)=>{
    try{}catch(error){res.json(error)}
});

// update a post

const update=asyncHandler(async(req,res)=>{
    try{}catch(error){res.json(error)}
});

//delete a post
const deletePost=asyncHandler(async(req,res)=>{
    try{}catch(error){res.json(error)}
});

//like post
const LikeToPost=asyncHandler(async(req,res)=>{
    try{}catch(error){res.json(error)}
});

//dislike posts
const DislikeToPost=asyncHandler(async(req,res)=>{
    try{}catch(error){res.json(error)}
});
module.exports={
    create,
  fetchPosts,
  fetchPost,
  update,
  deletePost,
  LikeToPost,
  DislikeToPost,
};