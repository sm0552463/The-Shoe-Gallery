import express from 'express';
import colors from 'colors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoute.js'
import cors from 'cors';
import categoryRoutes from './routes/categoryRoutes.js'
import productRoutes from './routes/productRoutes.js'
import path from 'path'
//confugure env
dotenv.config();

//db config
connectDB();
//rest object
const app=express()

//middleware
app.use(cors());
app.use(express.json())
app.use(morgan('dev'))
app.use(express.static(path.join(__dirname,'./clients/build')))

//routes
app.use("/api/v1/auth",authRoutes);
app.use('/api/v1/category',categoryRoutes);
app.use('/api/v1/product',productRoutes)
//rest api
app.use('*',function(req,res){
    res.sendFile(path.join(__dirname,'./clients/build/index.html'));
})

//port
const PORT= process.env.PORT ||8080;

//run listen
app.listen(PORT,()=>{
    console.log(`Server Running on ${PORT}`.bgCyan.white);
    
})