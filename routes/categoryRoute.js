const express=require("express");
const router=express.Router();
const {
    create,
    fetchCategories,
    fetchCategory,
    update,
    delete_category,
  } = require("../controllers/categoryCtrl");
  const authMiddleware = require("../middlewares/authMiddleware");
 
  router.post("/category/", authMiddleware, create);
  router.get("/category/", fetchCategories);
  router.get("/category/:id", fetchCategory);
  router.patch("/category/:id", authMiddleware, update);
  router.delete("/category/:id", authMiddleware, delete_category);
module.exports=router;