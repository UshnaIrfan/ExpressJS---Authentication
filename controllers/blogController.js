const express = require("express");
const {blogUser,User,userMail }= require("../models/blogModel")
const bcrypt = require("bcrypt")
const jwt=require('jsonwebtoken');
const saltRounds = 10
const app = express()
require('dotenv').config()
app.use(express.json());
require('dotenv').config()
var nodemailer = require('nodemailer');

// Sign up
const Signup = async (req ,res)=>
{
    let existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
        return res.status(409).json({
            message:'User exists'
        });
    }

    bcrypt.hash(req.body.password ,saltRounds ,(err ,hash) =>
    {
        if(err) {
            console.log('Error: ');
            return res.status(500).json({error:err});
        } else {

            const  user  = new User({
                user_id:req.body.user_id,
                name:req.body.name,
                email:req.body.email,
                address:req.body.address,
                phone:req.body.phone,
                password: hash
            });
            user.save().then(result =>
            {   console.log(result);
                res.status(201).json(
                    {
                        message:'user created'});
            })
                .catch( err =>
                {
                    console.log(err);
                    res.status(500).json({
                        error:err});
                });
        }
    })
}

// login
const Login = async  (req, res) => {
    console.log(req.body);
    let existUser = await User.findOne({ email: req.body.email });
    if (!existUser) {
        return res.status(401).json({
            message:'User does not exists'
        });
    }
    else
    {
        bcrypt.compare(req.body.password , existUser.password,(err,result)=>
        {
            if( err)
            {

                return res.status(401).json({  message:'Unauthorized'});
            }
            if(result)
            {
                const token = jwt.sign({
                        email: req.body.email
                    },process.env.JWT_KEY ,
                    {expiresIn:"1h"}
                );

                return res.status(200).json({  message:'successfully login' ,
                    token : token
                });
            }

            return res.status(401).json({  message:'Unauthorized'});
        })

    }
}

// forget password
const forgetPassword = async (req,res)=>
{
    try {
        const {   password, newPassword } = req.body;

        if (password != newPassword) {
            return res.status(400).send('Password not matched with confirm password');
        }

        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(401).send('Unauthorized ');
        }
        bcrypt.genSalt(12, function (err, salt) {
            bcrypt.hash(newPassword,saltRounds, (err, hash) => {
                user.password = hash;
                user.save();
                const obj = {
                    message: 'success',
                    data: user
                }
                return res.json(obj);
            });
        });

    } catch (err) {
        console.log(err);
        return res.status(400).send('Something went wrong. Try again');
    }
}

//update password
const updatePassword = async  (req, res) => {
    try {
        const tokenHeader = req.headers.authorization;
        const token = tokenHeader.replace('Bearer ','');
        const decodedTokenData = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        const user = await User.findOne({email: decodedTokenData.email});
        if(user)
        {
            const password = req.body.password;
            const newPassword = await bcrypt.genSalt(saltRounds).then(salt => {
                return bcrypt.hash(password, salt)
            });

            const userData= await User.updateOne({_id:user._id},{ $set :{password:newPassword}},  { new: true });
            console.log('Here: ', userData)
            res.status(200).send({
                success:true,
                msg:"user password has been reset",
                data:userData
            });

        }
        else
        {
            res.status(200).send({
                success:true,
                msg:"this link has been expired"
            });
        }
    }
    catch (error)
    {
        res.status(400).send(error.message);
    }
}

// get data from blog
const getBlogData = async (req ,res)=>
{
    try {
        const  header = req.header("authorization");
        const bearer = header.replace("Bearer" ," ")
        const parseJw = (token) =>
        {
            try
            {
                return JSON.parse(atob(token.split('.')[1]));
            }
            catch (e)
            {
                return null;
            }};
         const data= parseJw(bearer);


         const userData =   await User.findOne({email: data.email}).exec();
         let user = userData.user_id;
        const userblog = await blogUser.find({id: user}).exec();
         let blogData = {
                data: userblog
            }
              res.send(blogData);
    }
    catch (error)
    {
        res.status(400).send(error.message);
    }
}

// node mailer
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587 ,
    auth: {
        user: 'ushnairfan12345@gmail.com',
        pass: 'uoixkwdbhghnvvfo'
    }
});



const mailSent = async (req,res)=>
{
    const  mail = await new  userMail(req.body).save()
    transporter.sendMail({
        from:mail.from,
        to:mail.to,
        subject:"node js"
    });
    res.status(201).json({
        "status":"successfully email sent ",
    });
}

//  blog creation
const create = async (req ,res)=>
{
    let blog = '';
    const path = req.file.path ?? undefined;
    if (path) {
        blog = await new blogUser(
            {
                id:req.body.id,
                name: req.body.name,
                title: req.body.title,
                description: req.body.description,
                blogImage: path
            }).save();
    }

        console.log(blog)
        if (blog) {
            let dataCreate ={
                message: 'successfully created',
                data: blog
            }
            res.status(201).json({
                ...dataCreate
            });
        }

}

//get all blogs
const getBlogs = async (req ,res)=>
{
    try
    {
     const result = await  blogUser.find({},{__v:0});
        if (result) {
            let getBlog ={
                message: 'Api getting data successfully',
                data: result
            }
            res.status(200).json({
                ...getBlog
            });
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
}

//delete blog
const deleteBlog = async (req ,res)=>
{
    try
    {
        const id = req.params.id;
        const data = await  blogUser.findByIdAndDelete(id)
        if (data) {
            let dataDelete ={
                message: 'successfully deleted',
                data: {
                    id:data.id,
                    name:data.name,
                    description: data.description,
                    title:data.title
                }
            }
            res.status(200).json({
                dataDelete
            });
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// update blog
const updateBlog = async (req ,res)=>
{
    try
    {
        const id = req.params.id;
        const data = await blogUser.findByIdAndUpdate(id,req.body, {new: true})
        if (data) {
            let updateData ={
                message: 'successfully updated',
                data: data
            }
            res.send(updateData);
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}



module.exports =
    {
        Signup,
        Login,
        updatePassword,
        forgetPassword,
        create,
        deleteBlog,
        updateBlog,
        getBlogs,
        getBlogData,
        mailSent
    };



