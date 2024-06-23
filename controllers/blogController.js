import  Blog from "../models/bologModel.js";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/userModel.js";
import { error } from "console";
import { create } from "domain";
import fs from "fs";
import path from 'path';

const createBlog = async (req,res)=>{
    let errors1 ={};

   try {
        if(req.body.name && req.body.description && req.files){
        const result = await cloudinary.uploader.upload(
            req.files.image.tempFilePath,
            {
                use_filename:true,
                folder:"SAİLA",
            }
        );

        try {
            await Blog.create({
                name:req.body.name,
                description:req.body.description,
                category:req.body.category,
                user:res.locals.user._id,
                url:result.secure_url,
                image_id:result.public_id
            });

            fs.unlinkSync(req.files.image.tempFilePath);

            res.status(201).json({user:res.locals.user._id});

            tempFileDelete();

            const user = await User.findById({_id:res.locals.user._id});

            user.point += 100;

            await user.save();
        } 

        catch (error) {
            res.status(500).json({
                succeded :false,
                error,
            });
        }

        }
        if(!req.files){
            errors1.image = 'Image area is required';
        }
        if(req.files){
            delete errors1.image;
        }
        if(!req.body.description){
            errors1.description = 'Blog area is required';
        }
        if(req.body.description){
            delete errors1.description;
        }
        if(!req.body.name){
            errors1.name = 'Title area is required';
        }
        if(req.body.name){
            delete errors1.name;
        }
        if(Object.keys(errors1).length > 0){
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

const getAllBlogs= async (req,res)=>{
    try {
        if(req.params.search==="search"){
            const query = req.query.query;

            const blogsenson = await Blog.find().sort({blogread:-1}).limit(4).populate("user");

            const categories = ['Love', 'Technology', 'Life', 'Travel', 'Animal', 'Nature', 'Movie'];
            const blogCounts = {};
        
            for (const category of categories) {
              blogCounts[category] = await Blog.countDocuments({ category });
            }
        
            const allBlogsCount = await Blog.countDocuments();
        
            const blogs = await Blog.find({
              $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
              ]
            });

            res.status(200).render("blogs",{
                blogs,
                link : "blogs",
                blogsenson,
                blogCounts,
                allBlogsCount
            });
        }
        else{
            if(req.params.category){
                const category = req.params.category;
                const blogsenson = await Blog.find().sort({blogread:-1}).limit(4).populate("user");
    
                const categories = ['Love', 'Technology', 'Life', 'Travel', 'Animal', 'Nature', 'Movie'];
                const blogCounts = {};
        
                for (const category of categories) {
                    blogCounts[category] = await Blog.countDocuments({ category });
                }
        
                const allBlogsCount = await Blog.countDocuments();
    
                const blogs = await Blog.find({ category });
                res.status(200).render("blogs",{
                    blogs,
                    link : "blogs",
                    blogsenson,
                    blogCounts,
                    allBlogsCount
                });
            } 
            else{
    
                const blogs = await Blog.find({}).populate("user");
                const blogsenson = await Blog.find().sort({blogread:-1}).limit(4).populate("user");

                const categories = ['Love', 'Technology', 'Life', 'Travel', 'Animal', 'Nature', 'Movie'];
                const blogCounts = {};
        
                for (const category of categories) {
                    blogCounts[category] = await Blog.countDocuments({ category });
                }
        
                const allBlogsCount = await Blog.countDocuments();
    
                res.status(200).render("blogs",{
                    blogs,
                    link : "blogs",
                    blogsenson,
                    blogCounts,
                    allBlogsCount
                });
            }
        }
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            succeded :false,
            error,
        });
    }
}

const getABlogs= async (req,res)=>{
    try {

        const blog = await Blog.findById(req.params.id).populate('user').populate({
            path: 'comments.author', // Yorumların yazarlarını populate et
            model: 'User'
        }).populate({
            path: 'comments.commentscomment.author', // Yorumlardaki yorumların yazarlarını populate et
            model: 'User'
        }).populate({
            path: 'comments.commentscomment.personanswer', // Yorumlardaki yorumların kime yazıldığını populate et
            model: 'User'
        });

        const blogcomments = blog.comments;

        res.status(200).render("blog",{
            blog,
            link : "blogs",
            blogcomments
        });
    } catch (error) {
        res.status(500).json({
            succeded :false,
            error,
        });
    }
}

const deleteUserBlog = async (req,res)=>{
    try {
      const blog = await Blog.findById(req.params.id);

  
      const blogId = blog.image_id
        
      await cloudinary.uploader.destroy(blogId);
      await Blog.findOneAndDelete({_id: blog.id});
  
      res.status(200).redirect("/users/dashboard");
  
    } catch (error) {
        res.status(500).json({
            succeded :false,
            error,
        });
    }
}

const updateUserBlog = async (req,res)=>{
    try {
      const blog = await Blog.findById(req.params.id);

      if(req.files){
        const blogId = blog.image_id
        await cloudinary.uploader.destroy(blogId);

        const result = await cloudinary.uploader.upload(
            req.files.image.tempFilePath,
            {
                use_filename:true,
                folder:"SAİLA",
            }
        );

        blog.url = result.secure_url;
        blog.image_id = result.public_id;

        fs.unlinkSync(req.files.image.tempFilePath);
      }
      else{
       
      }

      if(req.body.name){
        blog.name=req.body.name;
      }

      if(req.body.description){
        blog.description=req.body.description;
      }

      if(req.body.category){
        blog.category=req.body.category;
      }

      blog.save();


      res.status(200).redirect("/users/dashboard");

      tempFileDelete();

    } 
    catch (error) {
        res.status(500).json({
            succeded :false,
            error,
        });
    }
}

const createComment = async (req,res)=>{
    try {
      const blog = await Blog.findById(req.params.id);

      const content = req.body.commentContent;
    
      if(content){
        const newComment = {
            author:res.locals.user._id,
            content:content,
            blognameid:req.params.id,
            createdAt:new Date()
          }
    
          blog.comments.push(newComment);
    
          blog.save()
    
          res.status(201).json({ user : res.locals.user._id})
      }
      else{
        const error={}
        error.content="Content area is required";
        res.status(400).json(error);
      }

    } 
    catch (error) {
        res.status(500).json({
            succeded :false,
            error,
        });
    }
}

const deleteComment = async (req,res)=>{
    try {

        let comment = null;
        const commentcommentid = req.params.commentcommentid;

        if(commentcommentid){
            const commentid = req.params.commentid;
            const blogs = await Blog.find({ "comments.commentscomment._id":commentcommentid });

            const usercomments = blogs.flatMap(blog => {
                return blog.comments.flatMap(comment => {
                    return comment.commentscomment.filter(commentcomment => {
                        return commentcomment.author.toString() === res.locals.user._id.toString();
                    });
                });
              });

            if (usercomments.length > 0) {
                comment = usercomments[0];
            } else {
                console.log('Comment not found');
            }
          
            const blog = await Blog.findByIdAndUpdate(
                { _id: comment.blognameid },
                {
                  $pull: {
                    'comments.$[outer].commentscomment': { _id: req.params.commentcommentid }
                  }
                },
                {
                  arrayFilters: [{ 'outer._id': req.params.commentid }],
                  new: true
                }
              );

            res.status(200).redirect("/users/dashboard");
        }
        else{
            const commentid = req.params.commentid;

            const blogs = await Blog.find({ "comments._id":commentid });

            const usercomments = blogs.flatMap(blog => blog.comments.filter(comment => comment._id.toString() === req.params.commentid.toString()));
    
            if (usercomments.length > 0) {
                comment = usercomments[0];
            } else {
                console.log('Comment not found');
            }

            const blog = await Blog.findByIdAndUpdate(
                {_id:comment.blognameid},
                {
                  $pull:{comments:{_id:commentid}}
                },
                {new:true}
              );
    
            res.status(200).redirect("/users/dashboard");
        }
  
    } catch (error) {
        console.log(error)
        res.status(500).json({
            succeded :false,
            error,
        });
    }
}

const createCommentComment = async (req,res)=>{
    try {

        const blog = await Blog.findById(req.params.blogid);

        const content = req.body.commentCommentContent;
        
        const comment = blog.comments.id(req.params.commentid);

        const commentcomment = req.params.commentcommentid;

    if(commentcomment){
        if(content){
            const newComment = {
                author:res.locals.user._id,
                content:content,
                personanswer:commentcomment,
                blognameid:req.params.blogid,
                commentpersonanswer:comment.id,
                commentpersonanswerauthor:comment.author,
                createdAt:new Date()
              }
    
              comment.commentscomment.push(newComment);
     
              blog.save()
       
              res.status(200).redirect(`/blogs/${req.params.blogid}`);
          }
          else{
            res.status(200).redirect(`/blogs/${req.params.blogid}`);
          }
    }
    else{
        if(content){
            const newComment = {
                author:res.locals.user._id,
                content:content,
                personanswer:comment.author,
                blognameid:req.params.blogid,
                commentpersonanswer:comment.id,
                commentpersonanswerauthor:comment.author,
                createdAt:new Date()
              }
    
              comment.commentscomment.push(newComment);
     
              blog.save()
       
              res.status(200).redirect(`/blogs/${req.params.blogid}`);
          }
          else{
            res.status(200).redirect(`/blogs/${req.params.blogid}`);
          }
    }

    } 
    catch (error) {
        console.log(error)
        res.status(500).json({
            succeded :false,
            error,
        });
    }
}

const blogread = async (req,res)=>{

    try {

        const blog = await Blog.findById( req.params.id );

        const same = blog.blogread.includes(res.locals.user._id);

        if(!same){

            let blogread = await Blog.updateOne(
                {_id:req.params.id},
                {
                    $push:{blogread:res.locals.user._id}
                },
                {new:true}
            );
        }
        else{

        }

        const updatedBlog = await Blog.findById( req.params.id );
  
        res.json({
            succeeded: true,
            blog: updatedBlog
        });

    } 

    catch (error) {
        res.status(500).json({
            succeded :false,
            error,
        });
    }

  };

const bloglike = async (req,res)=>{

    try {

        const blog = await Blog.findById( req.params.id );

        const same = blog.likes.includes(res.locals.user._id);

        if(!same){

            let bloglikedislike = await Blog.updateOne(
                {_id:req.params.id},
                {
                    $push:{likes:res.locals.user._id}
                },
                {new:true}
            );

            const blog = await Blog.findById( req.params.id );

            const same = blog.dislikes.includes(res.locals.user._id);
    
            if(same){
                bloglikedislike = await Blog.updateOne(
                    {_id:req.params.id},
                    {
                        $pull:{dislikes:res.locals.user._id}
                    },
                    {new:true}
                );
            }

        }

        else{
            const blog = await Blog.findById( req.params.id );

            let bloglikedislike = await Blog.updateOne(
                {_id:req.params.id},
                {
                    $pull:{likes:res.locals.user._id}
                },
                {new:true}
            );

        }

        const updatedBlog = await Blog.findById( req.params.id );
  

        res.json({
            succeeded: true,
            blog: updatedBlog
        });
    } 

    catch (error) {
        res.status(500).json({
            succeded :false,
            error,
        });
    }

  };



  const blogdislike = async (req,res)=>{

    try {

        const blog = await Blog.findById( req.params.id );

        const same = blog.dislikes.includes(res.locals.user._id);

        if(!same){

            let bloglikedislike = await Blog.updateOne(
                {_id:req.params.id},
                {
                    $push:{dislikes:res.locals.user._id}
                },
                {new:true}
            );

            const blog = await Blog.findById( req.params.id );

            const same = blog.likes.includes(res.locals.user._id);
    
            if(same){
                bloglikedislike = await Blog.updateOne(
                    {_id:req.params.id},
                    {
                        $pull:{likes:res.locals.user._id}
                    },
                    {new:true}
                );
            }

        }

        else{
            const blog = await Blog.findById( req.params.id );

            let bloglikedislike = await Blog.updateOne(
                {_id:req.params.id},
                {
                    $pull:{dislikes:res.locals.user._id}
                },
                {new:true}
            );

        }

        const updatedBlog = await Blog.findById( req.params.id );
  

        res.json({
            succeeded: true,
            blog: updatedBlog
        });
    } 

    catch (error) {
        res.status(500).json({
            succeded :false,
            error,
        });
    }

  };



  
const commentlike = async (req,res)=>{

    try {

        const blog = await Blog.findOne({ 'comments._id': req.params.commentid });
        const comment = blog.comments.id(req.params.commentid);
        const same = comment.likes.includes(res.locals.user._id);

        if(!same){

            let comment = await Blog.updateOne(
                {'comments._id': req.params.commentid },
                {
                    $push: { 'comments.$.likes': res.locals.user._id }
                },
                {new:true}
            );

            const blog = await Blog.findOne({ 'comments._id': req.params.commentid });
            const coment = blog.comments.id(req.params.commentid);
            const same = coment.dislikes.includes(res.locals.user._id);
    
            if(same){
                comment = await Blog.updateOne(
                    {'comments._id': req.params.commentid },
                    {
                        $pull: { 'comments.$.dislikes': res.locals.user._id }
                    },
                    {new:true}
                );
            }

        }

        else{
            const blog = await Blog.findOne({ 'comments._id': req.params.commentid });
            const coment = blog.comments.id(req.params.commentid);

            let comment = await Blog.updateOne(
                {'comments._id': req.params.commentid },
                {
                    $pull: { 'comments.$.likes': res.locals.user._id }
                },
                {new:true}
            );

        }

        const updatedBlog = await Blog.findOne({ 'comments._id': req.params.commentid });
        const updatedComment = updatedBlog.comments.id(req.params.commentid);

        res.json({
            succeeded: true,
            comment: updatedComment
        });
    } 

    catch (error) {
        res.status(500).json({
            succeded :false,
            error,
        });
    }

  };


  


const commentdislike = async (req,res)=>{

    try {

        const blog = await Blog.findOne({ 'comments._id': req.params.commentid });
        const comment = blog.comments.id(req.params.commentid);
        const same = comment.dislikes.includes(res.locals.user._id);

        if(!same){

            let comment = await Blog.updateOne(
                {'comments._id': req.params.commentid },
                {
                    $push: { 'comments.$.dislikes': res.locals.user._id }
                },
                {new:true}
            );

            const blog = await Blog.findOne({ 'comments._id': req.params.commentid });
            const coment = blog.comments.id(req.params.commentid);
            const same = coment.likes.includes(res.locals.user._id);
    
            if(same){
                comment = await Blog.updateOne(
                    {'comments._id': req.params.commentid },
                    {
                        $pull: { 'comments.$.likes': res.locals.user._id }
                    },
                    {new:true}
                );
            }
    
        }

        else{
            
            let comment = await Blog.updateOne(
                {'comments._id': req.params.commentid },
                {
                    $pull: { 'comments.$.dislikes': res.locals.user._id }
                },
                {new:true}
            );

        }

        const updatedBlog = await Blog.findOne({ 'comments._id': req.params.commentid });
        const updatedComment = updatedBlog.comments.id(req.params.commentid);

        res.json({
            succeeded: true,
            comment: updatedComment
        });
    } 
    
    catch (error) {
        res.status(500).json({
            succeded :false,
            error,
        });
    }

  };


  const commentcommentlike = async (req,res)=>{

    try {

        const blog = await Blog.findOne({ 'comments.commentscomment._id': req.params.commentcommentid });
        const comment = blog.comments.find(comment => 
            comment.commentscomment.some(cc => cc._id.equals(req.params.commentcommentid))
        );
        const commentComment = comment.commentscomment.id(req.params.commentcommentid);
        const same = commentComment.likes.includes(res.locals.user._id);

        if(!same){

            let comment = await Blog.updateOne(
                { 'comments.commentscomment._id': req.params.commentcommentid },
                {
                    $push: { 'comments.$[outer].commentscomment.$[inner].likes': res.locals.user._id },
                },
                {
                    arrayFilters: [
                        { 'outer._id': req.params.commentid },
                        { 'inner._id': req.params.commentcommentid }
                    ],
                    new: true
                }
            );

            const blog = await Blog.findOne({ 'comments.commentscomment._id': req.params.commentcommentid });
            const coment = blog.comments.find(comment => 
                comment.commentscomment.some(cc => cc._id.equals(req.params.commentcommentid))
            );
            const commentComment = coment.commentscomment.id(req.params.commentcommentid);
            const same = commentComment.dislikes.includes(res.locals.user._id);
    
            if(same){
                let comment = await Blog.updateOne(
                    { 'comments.commentscomment._id': req.params.commentcommentid },
                    {
                        $pull: { 'comments.$[outer].commentscomment.$[inner].dislikes': res.locals.user._id },
                    },
                    {
                        arrayFilters: [
                            { 'outer._id': req.params.commentid },
                            { 'inner._id': req.params.commentcommentid }
                        ],
                        new: true
                    }
                );
            }
    
        }

        else{
            let comment = await Blog.updateOne(
                { 'comments.commentscomment._id': req.params.commentcommentid },
                {
                    $pull: { 'comments.$[outer].commentscomment.$[inner].likes': res.locals.user._id },
                },
                {
                    arrayFilters: [
                        { 'outer._id': req.params.commentid },
                        { 'inner._id': req.params.commentcommentid }
                    ],
                    new: true
                }
            );

        }

        const updatedBlog = await Blog.findOne({ 'comments.commentscomment._id': req.params.commentcommentid });
        const coment = updatedBlog.comments.find(comment => 
            comment.commentscomment.some(cc => cc._id.equals(req.params.commentcommentid))
        );
        const updatedComment = coment.commentscomment.id(req.params.commentcommentid);

        res.json({
            succeeded: true,
            comment: updatedComment
        });
    } 

    catch (error) {
        res.status(500).json({
            succeded :false,
            error,
        });
    }

  };



const commentcommentdislike = async (req,res)=>{

    try {

        const blog = await Blog.findOne({ 'comments.commentscomment._id': req.params.commentcommentid });
        const comment = blog.comments.find(comment => 
            comment.commentscomment.some(cc => cc._id.equals(req.params.commentcommentid))
        );
        const commentComment = comment.commentscomment.id(req.params.commentcommentid);
        const same = commentComment.dislikes.includes(res.locals.user._id);

        if(!same){

            let comment = await Blog.updateOne(
                { 'comments.commentscomment._id': req.params.commentcommentid },
                {
                    $push: { 'comments.$[outer].commentscomment.$[inner].dislikes': res.locals.user._id },
                },
                {
                    arrayFilters: [
                        { 'outer._id': req.params.commentid },
                        { 'inner._id': req.params.commentcommentid }
                    ],
                    new: true
                }
            );

            const blog = await Blog.findOne({ 'comments.commentscomment._id': req.params.commentcommentid });
            const coment = blog.comments.find(comment => 
                comment.commentscomment.some(cc => cc._id.equals(req.params.commentcommentid))
            );
            const commentComment = coment.commentscomment.id(req.params.commentcommentid);
            const same = commentComment.likes.includes(res.locals.user._id);
    
            if(same){
                let comment = await Blog.updateOne(
                    { 'comments.commentscomment._id': req.params.commentcommentid },
                    {
                        $pull: { 'comments.$[outer].commentscomment.$[inner].likes': res.locals.user._id },
                    },
                    {
                        arrayFilters: [
                            { 'outer._id': req.params.commentid },
                            { 'inner._id': req.params.commentcommentid }
                        ],
                        new: true
                    }
                );
            }
    
        }

        else{
            let comment = await Blog.updateOne(
                { 'comments.commentscomment._id': req.params.commentcommentid },
                {
                    $pull: { 'comments.$[outer].commentscomment.$[inner].dislikes': res.locals.user._id },
                },
                {
                    arrayFilters: [
                        { 'outer._id': req.params.commentid },
                        { 'inner._id': req.params.commentcommentid }
                    ],
                    new: true
                }
            );

        }
        const updatedBlog = await Blog.findOne({ 'comments.commentscomment._id': req.params.commentcommentid });
        const coment = updatedBlog.comments.find(comment => 
            comment.commentscomment.some(cc => cc._id.equals(req.params.commentcommentid))
        );
        const updatedComment = coment.commentscomment.id(req.params.commentcommentid);

        res.json({
            succeeded: true,
            comment: updatedComment
        });
    } 

    catch (error) {
        res.status(500).json({
            succeded :false,
            error,
        });
    }

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


export {createBlog ,getAllBlogs,getABlogs,deleteUserBlog,updateUserBlog,createComment,deleteComment,createCommentComment,commentlike,commentdislike,commentcommentlike,commentcommentdislike,bloglike,blogdislike,blogread};