const asyncHandler=require("express-async-handler");
const Post=require("../models/postModel");

//create post
const create=asyncHandler(async(req,res)=>{
    try{}catch(error){res.json(error)}
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