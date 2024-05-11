const mongoose = require( "mongoose");

async function ConnectDB(){
    try {
        await mongoose.connect(`${process.env.MONGO_DB_URL}/${process.env.DB_NAME}`);
        console.log("MONGODB connection Successful !! ")
    } catch (error) {
        console.log("MONGO DB ERROR",error);
    }

}

module.exports = ConnectDB;