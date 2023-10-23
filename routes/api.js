const router=require('express').Router();
const {signup,login,uploadImage,user_details,create_channel,get_all_channels}=require('../postgreSQL')
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
            await user_details(req.userId).then((resp)=>{
                  if(resp.error==false)
                   {
                    console.log("USER DETAILS FECTHED SUCCESSFULLY");
                    res.json({
                        error:false,
                        data:resp.data
                    })
                   }
                   else{
                    console.log("FAILED TO FETCH USER DETAILS");
                    res.json({
                        error:true,
                        message:resp.message
                    })
                   }
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
router.post('/channel/create',jwtVerification,async(req,res)=>{
    try {
         await create_channel(req.userId,req.body.name,req.body.desc).then((resp)=>{
              if(resp.error==false)
                res.json({
                    error:false,
                    channelId:resp.channelID,
                    message:"New channel created"
                })
            else
              res.json({
                    error:true,
                    message:resp.message
        })
         })
    } catch (error) {
         console.log("ERROR IN CREATING CHANNEL");
         console.log("-->",error);
         res.json({
            error:true,
            message:error.message
         })
    }
})
router.get('/channel/list',jwtVerification,async(req,res)=>{
    try {
        await get_all_channels().then((resp)=>{
            if(resp.error==false)
             res.json({
              error:false,
              channels:resp.channels
            })
            else
              res.json({
              error:false,
              message:resp.message
            })
        })
    } catch (error) {
        console.log("ERROR IN LISTING ALL CHANNELS");
        console.log(error);
        res.json({
            error:false,
            message:error.message
        })
    }
})
module.exports={router}