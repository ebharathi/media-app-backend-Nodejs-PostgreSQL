const express=require('express');
const cors=require('cors')

const app=express();
app.use(cors())
app.use(express.json())

app.listen(9000,()=>console.log("Media App server running on port 9000."))