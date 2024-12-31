
const express=require("express");
const {serverConfig,logger} =require("./config/index");

const apiRoutes=require("./routes/index"); 
const CRON = require('./utils/common/cron-jobs');


const app=express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/api",apiRoutes);
//app.use("/bookingService/api",apiRoutes);



app.listen(serverConfig.PORT,()=>{
    console.log(`Listening to port ${serverConfig.PORT }`);
    CRON();
    //logger.info('succesfully started server')
}) 