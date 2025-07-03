import mongoose from 'mongoose';
import Writing from '../models/category/Writing.js';
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('', 'utf-8'));

await mongoose.connect('mongodb+srv://1endloopdaywrite:1234@cluster0.eibaawc.mongodb.net/'); 

await Writing.insertMany(data);
console.log('Dummy data uploaded!');
process.exit();
