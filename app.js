if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}

// console.log(process.env.SECRET)
// console.log(process.env.API_KEY)

const express=require('express');
const path=require('path');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');



//const Joi=require('joi');
//const {campgroundSchema,reviewSchema}=require('./schemas.js');
//const catchAsync=require('./utils/catchAsync');
const session=require('express-session');
const flash=require('connect-flash');
const ExpressError=require('./utils/ExpressError');
const methodOverride=require('method-override');
//const Campground=require('./models/campground');
//const Review=require('./models/review');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user');

const userRoutes=require('./routes/users');
const campgroundRoutes=require('./routes/campgrounds');
const reviewRoutes=require('./routes/reviews');
const campground = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser:true,
    //useCreateIndex:true,
    useUnifiedTopology:true,
    //useFindAndModify:false
});

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("database connected");
});

const app=express();

app.engine('ejs',ejsMate)
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))

const sessionConfig={
    secret:'thisshouldbeabettersecret!',
    resave:false,
    saveUnintialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()*1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// const validateReview=(req,res,next)=>{
//     const{error}=reviewSchema.validate(req.body);
//     if(error){
//         const msg=error.details.map(el=>el.message).join(',')
//         throw new ExpressError(msg,400)
//     }
//     else{
//         next();
//     }
// }

app.use((req,res,next)=>{
    console.log(req.session);
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

app.use('/',userRoutes)
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)

app.get('/',(req,res)=>{
    res.render('home')
})

app.get('/about',async(req,res)=>{
    const about=await campground.find({});
    res.render('campgrounds/about')
})



// app.get('/makecampground',async(req,res)=>{
//     const camp=new Campground({title:'my backyard',description:'cheap camping'});
//     await camp.save();
//     res.send(camp)
// })

app.all('*',(req,res,next)=>{
    next(new ExpressError('page not found',404))
})

app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    if(!err.message)err.message='oh no,something went wrong!'
    res.status(statusCode).render('error',{err})
    
})

app.listen(3000,()=>{
    console.log('serving on port 3000')
})