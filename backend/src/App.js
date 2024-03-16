import 'dotenv/config'
import ConnectDB from './db/index.js'
import express from 'express';

const app = express();

// Middlewares
app.use(express.json());

ConnectDB()
.then(()=>{
    app.listen(process.env.PORT || 3000 , ()=>{
        console.log(`App is listening on Port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("ERROR IN CONNECTION || CONNECTION FAILED", err);
})