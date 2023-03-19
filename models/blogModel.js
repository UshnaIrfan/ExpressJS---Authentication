const mongoose = require("mongoose");
//bog creation schema
const  blogSchema = new mongoose.Schema(
    {
        id:
            {
                type: Number,
            },
        name:
            {
                type:String,
            },
        title:
            {
                type:String,
            },
        subTittle:
            {
                type:String
            },
        description:
            {
                type:String,
            },
        blogImage:{
            type:String,
         }
    }
)
const  blogUser = new mongoose.model('blogUsers' , blogSchema);
// user creation Schema
const  UserSchema = new mongoose.Schema(

    {
      user_id:
            {
                type: Number

            },
        name:
            {
                type:String,
                required:true
            },
        email:
            {
                type:String,
                required:true
            },
        password:
            {
                type:String,
                required:true,

            },
        newPassword:
            {
                type:String,

            },
        address:
            {
                type:String,
            },
        phone:
            {
                type: String,
                match: [  /^(\()?\d{4}(\))?(-|\s)\d{7}$/, 'Enter a valid phone number']
            }
    }
)
const  User = new mongoose.model('users' , UserSchema);

const  mailSchema = new mongoose.Schema(
    {
        from:
            {
                type: String
            },
        to:
            {
                type: String,
            }

    }
)
const  userMail = new mongoose.model('usersMail' , mailSchema);

module.exports =
    {
        blogUser,
        User,
        userMail
    };





