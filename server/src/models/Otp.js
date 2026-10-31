import mongoose from "mongoose";
const schema=new mongoose.Schema({email:{type:String,required:true,lowercase:true,index:true},purpose:{type:String,enum:["register","login"],required:true},codeHash:{type:String,required:true},payload:{type:mongoose.Schema.Types.Mixed,default:null},expiresAt:{type:Date,required:true,expires:0},attempts:{type:Number,default:0}},{timestamps:true});
export default mongoose.model("Otp",schema);
