const express = require("express");
const { applyDefaults } = require("../models/reviews");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listing = require("../models/listing.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const flash = require("connect-flash");
const { isLoggedin, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

//index route
router.get("/", listingController.index);

//new route
router.get("/new", isLoggedin, listingController.renderNewForm);

//create route
router.post(
  "/new",
  isLoggedin,
  upload.single("listing[image]"),
  wrapAsync(listingController.createListing)
);


//trending route
router.get("/trending", async(req,res)=>{
  let listingArray = await listing.find({});
  //console.log(listingArray);
  let comp=(a,b)=>{
    return b.reviews.length-a.reviews.length
  }
  let reviewArray=listingArray.sort(comp)
  
  // console.log(reviewArray);

  let trendingListing = reviewArray.filter((listing)=>{
    if(listing.reviews.length>=1){
      return listing;
    }
  })
  // console.log(trendingListing);
 

  res.render("listings/trending.ejs" , {trendingListing});
  
})


//search route
router.get("/search", async(req,res)=>{
  let {searchQuery} = req.query;
  let listingArray = await listing.find({title:{$regex:searchQuery,$options:"i"}});
  // console.log(listingArray);

  res.render("listings/search.ejs" , {listingArray , searchQuery});
})

router.get("/mountains" , async(req,res)=>{
    let listingArray = await listing.find({category : "mountains"});
    console.log(listingArray);
    res.render("listings/fillter.ejs" , {listingArray});
});

router.get("/castle" , async(req,res)=>{
  let listingArray = await listing.find({category : "castle"});
  console.log(listingArray);
  res.render("listings/fillter.ejs" , {listingArray});
});

router.get("/pools" , async(req,res)=>{
  let listingArray = await listing.find({category : "pools"});
  console.log(listingArray);
  res.render("listings/fillter.ejs" , {listingArray});
});

router.get("/camping" , async(req,res)=>{
  let listingArray = await listing.find({category : "camping"});
  console.log(listingArray);
  res.render("listings/fillter.ejs" , {listingArray});
});

router.get("/")


//edit route
router.get("/:id/edit", isLoggedin, isOwner, listingController.renderEditForm);

//update through edit
router.patch(
  "/:id",
  isLoggedin,
  isOwner,
  upload.single("listing[image]"),
  listingController.updateListing
);

//delete route
router.delete("/:id", isLoggedin, isOwner, listingController.delete);

//Show route
router.get("/:id", wrapAsync(listingController.showListings));





module.exports = router;
