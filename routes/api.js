const router=require('express').Router();
const {executeQuery}=require('../postgreSQL')

router.post('/execute',async(req,res)=>{
    try {
         console.log("[+]QUERY INCOMING..........");
         await executeQuery(req.body.query).then((response)=>{
            if(response.error==false)
            {
            console.log("[+]QUERY EXECUTON SUCCESS");
               res.json({
                error:false,
                message:response.message
               })
            }
            else
            {
                console.log("[-]QUERY EXECUTION FAILED")
                res.json({
                    error:true,
                    message:response.message
                })
            }
         })
    } catch (error) {
         console.log("[-]ERROR IN ROUTER API");
         res.json({
            error:true,
            message:error.message
         })
    }
})
module.exports={router}