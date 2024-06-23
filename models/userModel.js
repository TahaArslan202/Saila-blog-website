import mongoose from "mongoose";
import bcrypt, { hash } from "bcrypt";
import validator from "validator";

const {Schema}=mongoose

const profileSchema = new Schema({
    profilejob:{
        type: String
    },
    profileUrl:{
        type:String
    },
    profileimageid:{
        type:String
    },
    profileBackroundUrl:{
        type:String
    },
    profileBackroundimageid:{
        type:String
    },
    profileaboutMe:{
        type:String
    },
    profileinstegram:{
        type:String
    },
    profilefacebook:{
        type:String
    },
    profiletwitter:{
        type:String
    },
    profilepinterest:{
        type:String
    }
});

const userSchema =new Schema({
    username: {
        type: String,
        required:  [true, "User area is required"],
        unique:true
    },
    email: {
        type: String,
        required: [true, "Email area is required"],
        validate: [validator.isEmail,"Valid email is required"],
    },
    password:{
        type:String,
        required:  [true, "Password area is required"],
        minLength:[4,"At least 4 character"]
    },
    onlineoffline:{
        type: String
    },
    followers:[
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    following:[
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    profile: {
        type: profileSchema 
    },
    point:{
        type: Number
    },
    profileframe:{
        type: String
    },
    profileframecount:[
        {
            type: String
        }
    ]
},
{
    timestamps :true,
});


userSchema.pre('save', async function (next) {
    const user = this;
  
    if (user.isModified('password')) {
      try {
        const hash = await bcrypt.hash(user.password, 10);
        user.password = hash;
      } catch (err) {
        return next(err);
      }
    }
  
    next();
  });

const User = mongoose.model("User",userSchema);

export default User;