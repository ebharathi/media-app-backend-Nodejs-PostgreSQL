const router=require('express').Router();
const {signup,login}=require('../postgreSQL')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
router.post('/signup',async(req,res)=>{
    try {
         console.log("[+]SIGNUP CALLED..........");
         const {username,password}=req.body;
         const hashedPassword=await bcrypt.hash(password,10);
         await signup(username,hashedPassword).then((response)=>{
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
router.post('/login',async(req,res)=>{
    try {
        console.log("[+]LOGIN CALLED....");
        const {username,password}=req.body;
        await login(username,password).then((response)=>{
            if(response.error==false)
            {
                console.log("[+]CHECKING CONFIRMED")
                res.json({
                    error:false,
                    message:response.message
                })
            }
            else{
                // console.log("[+]CHECKING FAILED")
                res.json({
                    error:true,
                    message:response.message
                })
            }
        })
    } catch (error) {
        console.error("[-]ERROR IN ROUTER API FOR LOGIN");
        console.log("---?",error)
        res.json({
           error:true,
           message:error.message
        })
    }
})
module.exports={router}