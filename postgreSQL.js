const {Client}=require('pg');

const client=new Client(
    {
        host:'127.0.0.1',
        user:'postgres',
        database:'postgres',
        password:'elaya55555',
        port:5432
    }
)
const insert=async(name,password)=>{
  try {
     console.log("[+]INSERTION CALLED[+]")
     await client.connect();
     console.log("[+]CONNECTED")
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
    await client.end();
    console.log("[+]DISCONNECTED")
  }
}
module.exports={insert}