const mongoose=require('mongoose');
const cities=require('./cities')
const {places,descriptors}=require('./seedHelpers')
const Campground=require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser:true,
    //useCreateIndex:true,
    useUnifiedTopology:true
});

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("database connected");
});

const sample=array=>array[Math.floor(Math.random()*array.length)];

const seedDB=async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            author:'633e679ce7a03830448033b3',
            location:`${cities[random1000].city},${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            //image:'https://source.unsplash.com/collection/483251',
            description:'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sed at, veniam deserunt cupiditate dicta neque voluptate dolor similique voluptas quia odit repudiandae veritatis, maiores obcaecati doloremque eligendi reiciendis unde quasi!',
            price,
            images: [
                {
                  url: 'https://res.cloudinary.com/drmzf8pte/image/upload/v1666835044/YelpCamp/wx88diwsa69stageqxmw.jpg',
                  filename: 'YelpCamp/wx88diwsa69stageqxmw',
                },
                {
                  url: 'https://res.cloudinary.com/drmzf8pte/image/upload/v1666835047/YelpCamp/as8r2ck67ug96sbchgbk.jpg',
                  filename: 'YelpCamp/as8r2ck67ug96sbchgbk',
                }
            ]
        })
        await camp.save()
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})