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
const executeQuery=async(query)=>{
      try {
        console.log("[+]QUERY EXECUTION CALLED");
        await client.connect().then(()=>console.log("[+]CONNECTED"));
        await client.query(query);
        return {
            error:false,
            message:"Query executed succesfully"
        }
      } catch (error) {
        console.log("[-]QUERY EXECUTON FAILED");
        return {
            error:true,
            message:error.message
        }
      }
      finally{
        await client.end().then(()=>console.log("[+]DISCONNECTED"))
      }
}
module.exports={executeQuery}