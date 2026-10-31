import mongoose from "mongoose";
const voteSchema=new mongoose.Schema({
 challengeId:{type:mongoose.Schema.Types.ObjectId,ref:"Challenge",required:true},
 fanId:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 voterKey:{type:String,required:true},
 verdict:{type:String,enum:["PASS","FAIL"],required:true},
 feedback:{type:String,trim:true,maxlength:1000,default:""}
},{timestamps:true});
voteSchema.index({challengeId:1,voterKey:1},{unique:true});
export default mongoose.model("Vote",voteSchema);
