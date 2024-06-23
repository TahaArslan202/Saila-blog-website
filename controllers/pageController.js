import User from "../models/userModel.js";

const getIndexPage = (req,res)=>{
    res.render("index",{
        link: "index",
    });
};

const getAboutPage = (req,res)=>{
    res.render("about",{
        link:"about",
    });
};

const getRegisterPage = (req,res)=>{
    res.render("register",{
        link:"register",
    });
};

const getLoginPage = (req,res)=>{
    res.render("login",{
        link:"login",
    });
};

const getLogoutPage = async (req,res)=>{
    const user = await User.findById({_id:res.locals.user._id});
    user.onlineoffline = "red";
    await user.save();
    res.cookie("jsonwebtoken","",{
        maxAge:1,
    });
    res.redirect("/");
};

export {getIndexPage,getAboutPage,getRegisterPage,getLoginPage,getLogoutPage}