import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Blog from "../models/bologModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from 'path';


const createUser = async (req,res)=>{
  try {
    // const user= await User.create(req.body);
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      onlineoffline:"red",
      point:0,
      profileframe:"default",
      profile: {
          profilejob: "varsayılan_profilejob",
          profileUrl: "varsayılan_profileUrl",
          profileimageid: "varsayılan_profileimageid",
          profileBackroundUrl: "varsayılan_profileBackroundUrl",
          profileBackroundimageid: "varsayılan_profileBackroundimageid",
          profileaboutMe: "varsayılan_profileaboutMe",
          profileinstegram: "varsayılan_profileinstegram",
          profilefacebook: "varsayılan_profilefacebook",
          profiletwitter: "varsayılan_profiletwitter",
          profilepinterest: "varsayılan_profilepinterest"
      }
  });
    res.status(201).json({user : user._id})
  } 

  catch (error) {
    let errors2 ={}

    if (error.keyPattern && error.keyPattern.username === 1) {
      errors2.username="The username is already register"
    }

    if (error.keyPattern && error.keyPattern.email === 1) {
      errors2.email="The email is already register"
    }
  
    if(error.name === "ValidationError"){
      Object.keys(error.errors).forEach((key)=>{
        errors2[key] = error.errors[key].message;
      });
    }

    res.status(400).json(errors2);

  }
};

const loginUser = async (req,res)=>{
  try {
      const{username ,password} = req.body;

      const user =await User.findOne({username});

      let same = false;

      let errors1 ={}

      if(user){
        same = await bcrypt.compare(password ,user.password)
      }

      if(same){
        const token =creatToken(user._id)

        res.cookie("jsonwebtoken",token,{
          httpOnly:true,
          maxAge: 1000*60*60*24,
        });

        res.status(201).json({user : user._id})

        user.onlineoffline = "yellow";
        await user.save();
      }

      else{
        if(username === ""){
          errors1.username ="User area is required";
        }
        else if(!user){
          errors1.username = 'There is no such user';
        }

        if(password === ""){
          errors1.password="Password area is required";
        }

        else if(!same){
          errors1.password = 'Pasword are not matched';
        }
        res.status(400).json(errors1);

      }
  } 
  
  catch (error) {
    res.status(500).json({
        succeded :false,
        error,
    });
  }

};

const creatToken = (userId)=>{
  return jwt.sign({userId},process.env.JWT_SECRET,{
    expiresIn:"1d",
  })
};

const getDashboardPage = async (req,res)=>{
  const blogs = await Blog.find({user:res.locals.user._id});

  const user = await User.findById({_id:res.locals.user._id}).populate(["following","followers"]);

  const blogsWithComments  = await Blog.find({ "comments.author": res.locals.user._id }).populate("comments.blognameid");

  const comments = blogsWithComments.flatMap(blog => blog.comments.filter(comment => comment.author.toString() === res.locals.user._id.toString()));

  const blogsWithCommentcomments  = await Blog.find({ "comments.commentscomment.author": res.locals.user._id }).populate({
    path: 'comments.commentscomment',
    populate: [
        { path: 'personanswer', model: 'User' },
        { path: 'commentpersonanswerauthor', model: 'User' },
        { path: 'blognameid', model: 'Blog' },
    ]
});

const commentcomments = blogsWithCommentcomments.flatMap(blog => {
  return blog.comments.flatMap(comment => {
      return comment.commentscomment.filter(commentcomment => {
          return commentcomment.author.toString() === res.locals.user._id.toString();
      });
  });
});

  res.render("dashboard",{
      link:"dashboard",
      blogs,
      user,
      comments,
      commentcomments
  });

};

const getAllUsers= async (req,res)=>{
  try {
      const users = await User.find({_id:{$ne:res.locals.user._id}});
      res.status(200).render("users",{
          users,
          link : "users",
      });
      
  } catch (error) {
      res.status(500).json({
          succeded :false,
          error,
      });
  };
};

const getAUser= async (req,res)=>{
  try {
      const oankiuser = await User.findById({ _id : res.locals.user._id})
      const user = await User.findById({ _id : req.params.id }).populate(["following","followers"]);

      const blogsWithComments  = await Blog.find({ "comments.author": req.params.id }).populate("comments.blognameid");

      const comments = blogsWithComments.flatMap(blog => blog.comments.filter(comment => comment.author.toString() === req.params.id.toString()));

      const infollowers = user.followers.some((follower)=>{
        return follower.equals(res.locals.user._id)
      });

      const blogsWithCommentcomments  = await Blog.find({ "comments.commentscomment.author": req.params.id }).populate({
        path: 'comments.commentscomment',
        populate: [
            { path: 'personanswer', model: 'User' },
            { path: 'commentpersonanswerauthor', model: 'User' },
            { path: 'blognameid', model: 'Blog' },
        ]
    });
    
    const commentcomments = blogsWithCommentcomments.flatMap(blog => {
      return blog.comments.flatMap(comment => {
          return comment.commentscomment.filter(commentcomment => {
              return commentcomment.author.toString() === req.params.id.toString();
          });
      });
    });

      const userblogs = await Blog.find({ user: user._id });
      res.status(200).render("user",{
          userblogs,
          user,
          infollowers,
          comments,
          link : "users",
          commentcomments,
          oankiuser
      });
  } 
  catch (error) {
      res.status(500).json({
          succeded :false,
          error,
      });
  };
};

const follow = async (req,res)=>{
  try {

    let user = await User.findByIdAndUpdate(
      {_id:req.params.id},
      {
        $push:{followers:res.locals.user._id}
      },
      {new:true}
    );

    user = await User.findByIdAndUpdate(
      {_id : res.locals.user._id},
      {
        $push:{following:req.params.id}
      },
      {new:true}
    );

    res.status(200).redirect(`/users/${req.params.id}`);
    
  } 
  catch (error) {
      res.status(500).json({
          succeded :false,
          error,
      });
  };
};

const unfollow = async (req,res)=>{
  try {

    let user = await User.findByIdAndUpdate(
      {_id:req.params.id},
      {
        $pull:{followers:res.locals.user._id}
      },
      {new:true}
    );

    user = await User.findByIdAndUpdate(
      {_id : res.locals.user._id},
      {
        $pull:{following:req.params.id}
      },
      {new:true}
    );

    res.status(200).redirect(`/users/${req.params.id}`);
    
  } 
  catch (error) {
      res.status(500).json({
          succeded :false,
          error,
      });
  };
};

const profileUpdate = async (req,res)=>{
  try {
      const user = await User.findById(res.locals.user);

      const profilePicture = req.files ? req.files.profilePicture : null;
      const backgroundPicture = req.files ? req.files.profilebackgroundPicture : null;

      if(profilePicture){

        if(user.profile.profileUrl === "varsayılan_profileUrl"){
          const result = await cloudinary.uploader.upload(
            req.files.profilePicture.tempFilePath,
            {
                use_filename:true,
                folder:"SAİLA_PROFİLE",
            }
          );
 
          fs.unlinkSync(req.files.profilePicture.tempFilePath);
  
          user.profile.profileUrl = result.secure_url;
          user.profile.profileimageid = result.public_id;

        }
        else{
          const userId = user.profile.profileimageid;
          await cloudinary.uploader.destroy(userId);
  
          const result = await cloudinary.uploader.upload(
              req.files.profilePicture.tempFilePath,
              {
                  use_filename:true,
                  folder:"SAİLA_PROFİLE",
              }
          );
          
          fs.unlinkSync(req.files.profilePicture.tempFilePath);

          user.profile.profileUrl = result.secure_url;
          user.profile.profileimageid = result.public_id;

        }

      }

      if(backgroundPicture){
        
        if(user.profile.profileBackroundUrl === "varsayılan_profileBackroundUrl"){
          const result = await cloudinary.uploader.upload(
            req.files.profilebackgroundPicture.tempFilePath,
            {
                use_filename:true,
                folder:"SAİLA_PROFİLE",
            }
          );
 
          fs.unlinkSync(req.files.profilebackgroundPicture.tempFilePath);
  
          user.profile.profileBackroundUrl = result.secure_url;
          user.profile.profileBackroundimageid = result.public_id;

        }
        else{
          const userId = user.profile.profileBackroundimageid;
          await cloudinary.uploader.destroy(userId);
  
          const result = await cloudinary.uploader.upload(
              req.files.profilebackgroundPicture.tempFilePath,
              {
                  use_filename:true,
                  folder:"SAİLA_PROFİLE",
              }
          );
          
          fs.unlinkSync(req.files.profilebackgroundPicture.tempFilePath);

          user.profile.profileBackroundUrl = result.secure_url;
          user.profile.profileBackroundimageid = result.public_id;

        }
      }

      if(req.body.profileusername){
        var username = req.body.profileusername;
        username = username.trim();
        username = username.replace(/\s+/g, ' ');
        user.username = username;
      }

      if(req.body.profileemail){
        user.email = req.body.profileemail;
      }

      if(req.body.profilepassword){
        user.password = req.body.profilepassword;
      }

      if(req.body.profilejob){
        user.profile.profilejob = req.body.profilejob;
      }

      if(req.body.profileabout){
        user.profile.profileaboutMe = req.body.profileabout;
      }

      if(req.body.profiletwitter){
        user.profile.profiletwitter = req.body.profiletwitter;
      }

      if(req.body.profileinstagram){
        user.profile.profileinstegram = req.body.profileinstagram;
      }

      if(req.body.profilefacebook){
        user.profile.profilefacebook = req.body.profilefacebook;
      }

      if(req.body.profilepinterest){
        user.profile.profilepinterest = req.body.profilepinterest;
      }

      await user.save();

      res.status(201).json({user:res.locals.user._id});

      tempFileDelete();

  } 

  catch (error) {
    let errors2 ={}

    if (error.keyPattern && error.keyPattern.username === 1) {
      errors2.username="The username is already register"
    }

    if (error.keyPattern && error.keyPattern.email === 1) {
      errors2.email="The email is already register"
    }
  
    if(error.name === "ValidationError"){
      Object.keys(error.errors).forEach((key)=>{
        errors2[key] = error.errors[key].message;
      });
    }

    res.status(400).json(errors2);

    tempFileDelete();

  };
};


const getShopPage = async (req,res)=>{
  const profileframes = ["avatar-frame.png","avatar-frame2.png","avatar-frame3.png","avatar-frame4.png","avatar-frame5.png"]

  const user = await User.findById({_id:res.locals.user._id})

  const myprofileframes = user.profileframecount;


  const filteredArray = profileframes.filter(item => !myprofileframes.includes(item));

  res.render("shop",{
      link:"shop",
      filteredArray,
      myprofileframes
  });

};

const Shoppping = async (req,res)=>{

  const user = await User.findById({_id:res.locals.user._id});

  const point = user.point;

  const imageId =req.params.imageid;

  if(point=>100){
    const user = await User.findByIdAndUpdate(
      {_id:res.locals.user._id},
      {
        $push:{profileframecount:imageId}
      },
      {new:true}
    );
  
    user.point -= 100;

    await user.save();
  
    res.status(200).redirect("/users/shop");
  }
  else{
    res.status(200).redirect("/users/shop");
  }

};

const equipProfileFrame = async (req,res)=>{

  const user = await User.findById({_id:res.locals.user._id});

  if(req.params.equip == "Equip"){

    user.profileframe = req.params.imageid;

    await user.save();
  }

  if(req.params.equip == "Equipped"){

    user.profileframe = "default";

    await user.save();
  }

  res.status(200).redirect("/users/shop");
};



function tempFileDelete() {
  setTimeout(function() {
      const tmpKlasor = 'tmp';
      const dosyalar = fs.readdirSync(tmpKlasor);
  
      if (dosyalar.length > 0) {
          console.log("Geçici klasörde dosya bulunuyor.");
          dosyalar.forEach(dosya => {
              const dosyaYolu = path.join(tmpKlasor, dosya);
              fs.unlinkSync(dosyaYolu);
              console.log(`${dosyaYolu} dosyası silindi.`);
          }); 
      } 
      else 
      {
          console.log("Geçici klasörde dosya bulunmuyor.");
      }
  }, 1000);
}

export {createUser,loginUser,getDashboardPage,getAllUsers,getAUser,follow,unfollow,profileUpdate,getShopPage,Shoppping,equipProfileFrame};