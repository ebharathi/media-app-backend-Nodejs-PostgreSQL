const express=require('express');
const cors=require('cors')
//routers
const {router}=require('./routes/api')
const app=express();
app.use(cors())
app.use(express.json())
app.use('/',router);
app.listen(9000,()=>console.log("Media App server running on port 9000."))