import mongoose from "mongoose";
import validator from "validator";

const {Schema}=mongoose

const commentscommentSchema = new Schema({
    author:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    content: {
        type: String,
        required: [true, "Content area is required"],
        trim: true
    },
    personanswer:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    blognameid:{
        type:Schema.Types.ObjectId,
        ref:"Blog"
    },
    commentpersonanswer:{
        type:Schema.Types.ObjectId,
    },
    commentpersonanswerauthor:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    likes:[
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    dislikes:[
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const commentSchema = new Schema({
    author:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    content: {
        type: String,
        required: [true, "Content area is required"],
        trim: true
    },
    blognameid:{
        type:Schema.Types.ObjectId,
        ref:"Blog"
    },
    likes:[
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    dislikes:[
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    commentscomment: [commentscommentSchema]
});

const blogSchema =new Schema({
    name: {
        type: String,
        required: [true, "Title area is required"],
        trim: true
    },
    category : {
        type: String,
        required: true,
        trim: true
    },
    description : {
        type: String,
        required: [true, "Blog area is required"],
        trim: true
    },
    uploadedAt:{
        type: Date,
        default : Date.now,
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    url:{
        type:String,
        required:true,
    },
    image_id:{
        type:String,
    },
    likes:[
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    dislikes:[
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    blogread:[
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    comments: [commentSchema]
});

const Blog = mongoose.model("Blog",blogSchema);

export default Blog;