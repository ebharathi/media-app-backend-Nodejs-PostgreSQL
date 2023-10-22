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
//sgnup
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
//img upload
const uploadImage=async(userId,filename,filebuffer,filetype)=>{
  const client=await pool.connect()
  console.log("[+]CONNECTED");
  try {
    //if the user already has an img, update it
     const user=await client.query('SELECT img_id FROM user_image WHERE user_id=$1',[userId]);
     if(user.rows.length>0)
     {
          const result=await client.query('UPDATE user_image SET img_name=$1,img_data=$2,img_mime_type=$3 WHERE img_id=$4 RETURNING img_id,user_id',[filename,filebuffer,filetype,user.rows[0].img_id])
          console.log("UPDATED IMAGE--->",result.rows[0]);
          return {
            error:false,
            img_id:result.rows[0].img_id,
          }
     }
     else{
        const result=await client.query('INSERT INTO user_image(user_id,img_name,img_data,img_mime_type)VALUES($1,$2,$3,$4) RETURNING img_id',[userId,filename,filebuffer,filetype]);
        console.log("RESPONSE FOR QUERY-->",result.rows[0]);
        return {
          error:false,
          img_id:result.rows[0].img_id,
        }
     }
  } catch (error) {
      console.log("QUERY EXECUTION FAILED FOR IMG UPLOAD;");
      console.log(error);
      return {
        error:true,
        message:error.message
      }
  }
  finally{
    await client.release();
    console.log("[+]DISCONECTED")
  }
}
//get user data
const user_details=async(userId)=>{
  const client=await pool.connect();
  console.log("[+}CONNECTED");
  try {
     const result=await client.query('SELECT users.id,users.name,user_image.img_id,user_image.img_name,user_image.img_data,user_image.img_mime_type FROM users LEFT JOIN user_image ON users.id=user_image.user_id WHERE users.id=$1',[userId]);
     console.log("USER DETAILS-->",result.rows[0]);
     const {id,name,img_id,img_name,img_data}=result.rows[0];
     const modifiedData = { ...result.rows[0] };

     // Check if img_data is not null and modify it
     if (img_data !== null) {
        modifiedData.img_data = img_data.toString('base64');
     }
     return {
      error:false,
      data:modifiedData
     }
  } catch (error) {
      console.log("QUERY FAILED ON GETTING USER DETAILS");
      console.log("ERROR-->",error);
      return {
        error:true,
        message:error.message
      }
  }
  finally{
     await client.release();
     console.log("[+]DISCONNECTED");
  }
}
module.exports={signup,login,uploadImage,user_details}