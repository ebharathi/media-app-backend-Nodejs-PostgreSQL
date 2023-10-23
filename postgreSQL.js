const {Client,Pool}=require('pg');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken')
require('dotenv').config()
// const pool=new Pool(
//     {
//         host:'127.0.0.1',
//         user:'postgres',
//         database:'postgres',
//         password:'elaya55555',
//         port:5432
//     }
// )
const pool=new Pool(
  {
    connectionString:process.env.DB_URL
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
                  const token=jwt.sign({userId:user.id},'qazwsxplmokn',{expiresIn:'5h'});
                  
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
//get follower details
const follower_details=async(followerid)=>{
  const client=await pool.connect();
  console.log("[+}CONNECTED");
  try {
     const result=await client.query('SELECT users.id,users.name,user_image.img_id,user_image.img_name,user_image.img_data,user_image.img_mime_type FROM users LEFT JOIN user_image ON users.id=user_image.user_id WHERE users.id=$1',[followerid]);
     console.log("FOLLOWER DETAILS-->",result.rows[0]);
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
//for creating channel
const create_channel=async(userId,name,desc,fileName,fileBuffer,fileType)=>{
  const client=await pool.connect();
  console.log("[+]CONNECTED"); 
  try {
      const result=await client.query('INSERT INTO channel(name,owner,description,img_name,img_data,img_mime_type)VALUES($1,$2,$3,$4,$5,$6) RETURNING id',[name,userId,desc,fileName,fileBuffer,fileType])
      console.log("R-->",result.rows[0]);
      return {
        error:false,
        channelID:result.rows[0].id
      }
    } catch (error) {
      console.log("QUERY EXECUTION FAILED WHILE CREATING A CHANNEL");
      console.log(error);
      return {
        error:true,
        message:error.message
      }
   }
   finally{
    await client.release()
    console.log("[-]DISCONNECTED");
  }
}
//listing channels
const get_all_channels=async()=>{
  const client=await pool.connect();
  console.log("[+]CONNECTED");
  try {
      const result=await client.query('SELECT * FROM channel');
      return {
        error:false,
        channels:result.rows
      }
  } catch (error) {
       console.log("QUERY EXECUTION FAILED FOR FETCHING ALL CHANNELS");
       console.log(error);
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
//get details of a particular channel
const get_particular_channel_detail=async(id)=>{
  const client=await pool.connect();
  console.log("[+]CONNECTED");
  try {
      const result=await client.query('SELECT * FROM channel WHERE id=$1',[id]);
      const modifiedData = { ...result.rows[0] };
      console.log("img_data",modifiedData.img_data)
      if(modifiedData.img_data)
        modifiedData.img_data=modifiedData.img_data.toString('base64');
      return {
        error:false,
        data:modifiedData
      }
  } catch (error) {
     console.log("QUER EXECUTION FAILED");
     console.log(error);
     return {
      error:true,
      message:error.message
     }
  }
  finally{
    await client.release();
    console.log("DISCONNECTED");
  }
}
//user joining a channel
const join_channel=async(userId,channelId)=>{
  const client=await pool.connect();
  console.log("[+]CONNECTED");
    try {
        const check=await client.query('SELECT id,name FROM channel WHERE id=$1 AND $2=ANY(members)',[channelId,userId]);
        if(check.rows.length>0)
        {
          return {
            error:true,
            message:`User already Following`
          }
        }
       //else
        await client.query(`UPDATE channel SET members=array_append(members,$1) WHERE id=$2`,[userId,channelId]);
       return {
        error:false 
       }
    } catch (error) {
       console.log("QUERY EXECUTION FAILED FOR JOINING A CHANNEL");
       console.log("error:  ",error);
       return {
        error:true,
        message:error.message
       }
    }
    finally{
      await client.release();
      console.log("[-]DISCONNECTED");
    }
}
//creating a message
const add_message=async(userId,channelId,text)=>{
  const client=await pool.connect();
  console.log("[+]CONNECTED");
    try {
      const result=await client.query('INSERT INTO message(user_id,channel_id,msge)VALUES($1,$2,$3) RETURNING id',[userId,channelId,text]);
      return {
           error:false,
           id:result.rows[0].id
      }
    } catch (error) {
       console.log("QUERY EXECUTION FAILED AT ADDING MESSAGE");
       console.log(error);
       return {
        error:true,
        message:error.message
       }
    }
    finally{
      await client.release();
      console.log("[-]DSICONNECTED");
    }
}
//listing all messages in a channel
const list_messages=async(channelId)=>{
  const client=await pool.connect();
  console.log("[+]CONNECTED");
  try {
     const result=await client.query('SELECT * FROM message WHERE channel_id=$1 ORDER BY id',[channelId]);
      if(result.rows.length==0)
        return {
          error:false,
          data:[]
        }
     return {
      error:false,
      data:result.rows
     }
  } catch (error) {
      console.log("QUERY EXECUTION FAILED FOR LISTING MESG")
      console.log(error);
      return {
        error:true,
        message:error.message
      }
  }
  finally{
    await client.release();
    console.log("[-]DISCONNECTED");
  }
}
module.exports={signup,login,uploadImage,user_details,follower_details,create_channel,get_all_channels,get_particular_channel_detail,join_channel,add_message,list_messages}