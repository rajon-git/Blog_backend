const asyncHandler=require("express-async-handler");
const Category=require("../models/categoryModel")

//create a category
const create=asyncHandler(async(req,res)=>{
    try{
        const category=await Category.create({
            user:req.user._id,
            title:req.body.title
        });
        res.json(category);
    }catch(error){res.json(error)}
});

//
const fetchCategories=asyncHandler(async(req,res)=>{
    try{
        const categories = await Category.find({})
        .populate("user")
        .sort("-createdAt");
         res.json(categories);
    }catch(error){res.json(error)}
});  


const fetchCategory=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    try{
        const category=await Category.findById(id)
        .populate("user")
        .sort("-createdAt");
        res.json(category);
    }catch(error){res.json(error)}
});

//update a actegory

const update=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    try{
        const category=await Category.findByIdAndUpdate(
            id,
            {
                title:req?.body?.title
            },
            {
                new: true,
                runValidators: true,
              }
            );
            res.json(category);
    }catch(error){res.json(error)}
});


const delete_category=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    try{
        const category = await Category.findByIdAndDelete(id);

        res.json(category);
    }catch(error){res.json(error)}
});
module.exports={create,
    fetchCategories,
    fetchCategory,
    update,
    delete_category};