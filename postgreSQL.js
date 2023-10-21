const {Client,Pool}=require('pg');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken')

const pool=new Pool(
    {
        host:'127.0.0.1',
        user:'postgres',
        database:'postgres',
        password:'elaya55555',
        port:5432
    }
)
const signup=async(name,password)=>{
  const client=await pool.connect()
  console.log("[+]CONNECTED")
  try {
     console.log("[+]INSERTION CALLED[+]")
     const result=await client.query('INSERT INTO users(name,password)VALUES($1,$2) RETURNING id',[name,password]);
     console.log("[+]INSERTION DONE");
    //  console.log("-->",result);
     return {
      error:false,
      userId:result.rows[0].id,
      message:"New user created"
     }
  } catch (error) {
    console.error("[-]INSERT QUERY EXECUTON FAILED");
    console.log("--->",error)
    return {
        error:true,
        message:error.detail
    }
  }
  finally{
    await client.release();
    console.log("[+]DISCONNECTED")
  }
}
//login
const login=async(reqName,reqPassword)=>{
  const client=await pool.connect();
  console.log("[+]CONNECTED");
  try {
     console.log("[+]RETRIEVE OPERATION CALLED");
    //  await client.connect();
     const result=await client.query('SELECT * FROM users WHERE name=$1',[reqName]);
    //  console.log("response--->",result);
     const user=result.rows[0];
     if(user)
     {
         const isPasswordSame=await bcrypt.compare(reqPassword,user.password)
               if(isPasswordSame)
               {
                  //Generate JWT token
                  const token=jwt.sign({userId:user.id},'qazwsxplmokn',{expiresIn:'1h'});
                  
                  return {
                    error:false,
                    token:token,
                    message:"User login successful"
                  }
                }
                else
                {
                  console.log("PASSWORD DOEN'T MATCH");
                  return {
                    error:true,
                    message:"User doesn't exist"
                  }
               }
     }
     else{
        console.log("[-]USER DOES NOT EXISTS")
        return {
          error:true,
          message:"User doesn't exist."
        }
     }
  } catch (error) {
      console.log("[-]LOGIN QUERY FAILED");
      console.log("--->",error);
      return {
        error:true,
        message:error.detail
      }
  }
  finally{
    await client.release();
    console.log("[+]DISCONNECTED");
  }
}
module.exports={signup,login}