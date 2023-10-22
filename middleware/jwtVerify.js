const jwt = require('jsonwebtoken');
const jwtVerification=async(req,res,next)=>{
      try {
          const token=req.headers.authorization;
          console.log("JWT TOKEN: ",token);
          const decoded=jwt.verify(token,'qazwsxplmokn');
          console.log("User verified-->",decoded);
            req.userId=decoded.userId
            next();
      } catch (error) {
          console.log("JWT verification failed");
          res.json({
            error:true,
            message:"Invalid user"
          })
      }
}
module.exports={jwtVerification}