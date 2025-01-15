if(process.env.NODE_ENV != "production"){
  require("dotenv").config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
// Use method-override to look for _method in query string
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));



const dbUrl = process.env.ATLASDB_URL
main()
  .then(() => {
    console.log("connection to DB !!");
  })
  .catch((err) => console.log(err));

async function main() {
  console.log(dbUrl);
  await mongoose.connect(dbUrl);
}


// app.get("/", (req, res) => {
//   res.send("server working");
// });


const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto : {
    secret : process.env.SECRET,
  },
  touchAfter : 24*3600,
});


store.on("error" , ()=>{
  console.log("error in mongo session store" , err);
})

// SESSION
const sessionOptions = {
  store,
  secret : process.env.SECRET,
  resave : false,
  saveUninitialized : false,
  cookie: {
    expires : Date.now() + 1000 * 60 * 60 * 24 * 7, 
    maxAge : 1000 * 60 * 60 * 24 * 7, 
    httpOnly : true,
  }
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

//demo user
// app.get("/demouser" , async (req,res)=>{
//   let fakeUser = new User({
//     email : "student@gmail.com",
//     username : "delta-student",
//   });
//   let registerUser = await User.register(fakeUser , "helloworld");
//   res.send(registerUser);
// });



app.listen(port, () => {
  console.log('listing to port ${port}');
});
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));



app.use("/listings", listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/" , userRouter)


app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went Wrong" } = err;
  res.status(statusCode).render("error.ejs", { err });
  //res.status(statusCode).send(message);
});