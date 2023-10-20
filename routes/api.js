const router=require('express').Router();
const {insert}=require('../postgreSQL')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
router.post('/signup',async(req,res)=>{
    try {
         console.log("[+]SIGNUP CALLED..........");
         const {username,password}=req.body;
         const hashedPassword=await bcrypt.hash(password,10);
         await insert(username,hashedPassword).then((response)=>{
            if(response.error==false)
              res.json({
                error:false,
                userId:response.userId,
                message:response.message
            })
            else
              res.json({
                  error:true,
                  message:response.message
            })
         })
         
    } catch (error) {
         console.error("[-]ERROR IN ROUTER API FOR SIGNUP");
         res.json({
            error:true,
            message:error.message
         })
    }
})
module.exports={router}