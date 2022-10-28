const express=require('express');
const router=express.Router();
const campgrounds=require('../controllers/campgrounds');
const catchAsync=require('../utils/catchAsync');
// const {campgroundSchema}=require('../schemas.js');
//const Review=require('./models/review');
const {isLoggedIn,isAuthor,validateCampground}=require('../middleware');
const multer=require('multer')
const {storage, cloudinary}=require('../cloudinary');
const upload=multer({storage});

//const ExpressError=require('../utils/ExpressError');
const Campground=require('../models/campground');
const campground = require('../models/campground');
const { request } = require('express');

router.get('/',catchAsync(campgrounds.index));
//router.post('/',isLoggedIn,validateCampground,upload.array('image'),catchAsync(campgrounds.createCampground))

router.post('/',isLoggedIn,upload.array('image'),validateCampground,catchAsync(async(req,res,next)=>{
        const campground=new Campground(req.body.campground);
        campground.images=req.files.map(f=>({url:f.path,filename:f.filename}))
        campground.author=req.user._id;
        await campground.save();
        console.log(campground);
        req.flash('Success','successfully made a new Hotel')
        res.redirect(`/campgrounds/${campground._id}`)
}))
// router.post('/',upload.array('image'),(req,res)=>{
//     console.log(req.body,req.files);
//     res.send('it worked')
// })

router.get('/new',isLoggedIn,campgrounds.renderNewForm)

router.get('/:id', catchAsync(async(req,res)=>{
    const campground=await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    console.log(campground);
    if(!campground){
        req.flash('Error','cannot find that Hotel')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
}));

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(async(req,res)=>{
    const{id}=req.params;
    const campground=await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('Error','you do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    res.render('campgrounds/edit',{campground});
}))

router.put('/:id',isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsync(async(req,res)=>{
    const{id}=req.params;
    console.log(req.body);
    const campground=await Campground.findByIdAndUpdate(id,{ ...req.body.campground});
    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
    }
    req.flash('Success','Successfully updated Hotel');
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id',isLoggedIn,isAuthor,catchAsync(async(req,res)=>{
    const{id}=req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('Success','Successfully deleted a Hotel');
    res.redirect('/campgrounds');
}))


module.exports=router;