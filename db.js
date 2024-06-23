import mongoose from "mongoose";

const conn = () => {
    mongoose.connect(process.env.DB_URI,{
        dbName :"Saila", 
    }).then(()=>{
        console.log("connected to the Db succesfully")
    }).catch((err)=>{
        console.log(`Db connection err : , ${err}`)
    });
};

export default conn;
