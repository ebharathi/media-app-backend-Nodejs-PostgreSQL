const router=require('express').Router();
const {signup,login,uploadImage}=require('../postgreSQL')
//JWT VERIFICATION
const {jwtVerification}=require("../middleware/jwtVerify");
//FOR AVATAR UPLOAD
const fs=require('fs');
const multer=require('multer');
const storage=multer.memoryStorage();
const upload=multer({storage:storage});
const bcrypt=require('bcrypt')
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
                    token:response.token,
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
router.post("/user",jwtVerification,async(req,res)=>{
       try {
            res.json({
                error:false,
                data:req.userId
            })
       } catch (error) {
          console.log("User router error");
          console.log("-->",error);
          res.json({
            error:true,
            message:error.message
          })
       }
})
router.post('/upload',jwtVerification,upload.single('file'),async(req,res)=>{
     try {
          console.log("PROFILE IMAGE UPLOADING FOR THE USER_ID: ",req.userId);
          let userId=req.userId;
          const fileBuffer=req.file.buffer;
          const fileName=req.file.originalname;
          const fileType=req.file.mimetype;
          console.log("file-->",req.file);
          await uploadImage(userId,fileName,fileBuffer,fileType).then((response)=>{
             if(response.error==false)
             {
                res.json({
                    error:false,
                    img_id:response.img_id,
                    message:"User profile image updated"
                })
             }
             else{
                res.json({
                    error:true,
                    message:response.message
                })
             }
          })
     } catch (error) {
         console.log("ERROR WHILE UPLOADING IMG FOR THE USER");
         console.log("ERROR: ",error);
         res.json({
            error:true,
            message:error.message
         })
     }
})
module.exports={router}