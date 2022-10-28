const express=require('express');
const router=express.Router();
const catchAsync=require('../utils/catchAsync');
const User=require('../models/user');
const users=require('../controllers/users');
const passport = require('passport');
const { application } = require('express');
//const { remove }=require('../models/user');

router.get('/register',users.renderRegister);

router.post('/register',catchAsync(users.register));

router.get('/login',users.renderLogin)

router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),users.login)

// router.get('/logout',(req,res)=>{  it is an older version
//     req.logout();
//     req.flash('success',"goodbye");
//     res.redirect('/campgrounds');
// })

//it is an newer version
router.get('/logout',users.logout);

module.exports=router;