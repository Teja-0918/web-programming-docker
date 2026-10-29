const mongoose=require("mongoose");

//defining schema
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer',
    },
    phone: {
        type: String,
        trim: true,
        default: '',
    },
    address: {
        type: String,
        trim: true,
        default: '',
    },
    city: {
        type: String,
        trim: true,
        default: '',
    },
    state: {
        type: String,
        trim: true,
        default: '',
    },
    pincode: {
        type: String,
        trim: true,
        default: '',
    },
    age: {
        type: Number,
        min: 1,
    },
},
{
    timestamps: true,
}
);

module.exports=mongoose.model("User",userSchema);