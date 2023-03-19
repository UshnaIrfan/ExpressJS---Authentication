const router = require('express').Router();
const { Signup,Login,updatePassword,forgetPassword,create,deleteBlog,updateBlog, getBlogs ,getBlogData , mailSent } = require("../controllers/blogController");

const multer = require('multer');
const  storage = multer.diskStorage(
    {
        destination:function (req,file,cb)
        {
            cb(null,'./uploads/')
        },
        filename:function (req,file,cb)
        {
            cb(null, new Date().toISOString()+ file.originalname);
        }
    });
    const fileFilter = (req , file ,cb) =>
    {
        if(file.mimetype==='image/jpeg' || file.mimetype==='image/png' )
        {
            cb( null,true);
        }
        else
        {
            cb( null,false);
        }
    };

const  upload = multer({
       storage: storage ,limits :{
        fileSize: 1024* 1024*5
    },
    fileFilter:fileFilter
});

//blog info
router.post("/user-signup" ,Signup);
router.post("/user-login" ,Login);
router.patch("/change-password",updatePassword);
router.patch("/forget-password/:email",forgetPassword);
router.post("/mail-sent",mailSent)
router.post("/get-data",getBlogData);
router.post("/create", upload.single('blogImage'),create);
router.delete("/delete-Blog/:id" ,deleteBlog);
router.patch("/update-Blog/:id" ,updateBlog);
router.get("/getAll-Blog" ,getBlogs);

module.exports= router;