const Campground=require('../models/campground');
module.exports.index=async(req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds})
}

module.exports.renderNewForm=(req,res)=>{
    res.render('campgrounds/new');
}

// module.exports.createCampground=async(req,res,next)=>{
//     const campground=new Campground(req.body.campground);
//     campground.author=req.user._id;
//     await campground.save();
//     req.flash('success','successfully made a new campground')
//     res.redirect(`/campgrounds/${campground._id}`)
// }