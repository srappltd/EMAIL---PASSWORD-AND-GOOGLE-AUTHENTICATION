const express = require('express');
const passport = require('passport');
const router = express.Router();
const userModel = require("../models/user")
// passport google auth
const googleStrategy = require("passport-google-oauth20").Strategy


// middleware create
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect("/login")
}


/* GET home page. */
router.get('/',isLoggedIn, function(req, res, next) {
  console.log(req.user)
  res.render('index',{user:req.user});
});
router.get('/login', function(req, res, next) {
  res.render('login');
});
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Express' });
});

// email and password authentication ----------------------------------------------------------------
router.post('/login', passport.authenticate("local",{
  successRedirect:"/",
  failureRedirect:"/login"
}));
router.post('/register',async function(req, res, next) {
  const {username,email,password,mobile} =req.body
  const userFind = await userModel.findOne({email})
  if(userFind){
    return res.send("Allready registered")
  }
  userModel.register(new userModel({username,email,mobile}),password).then(register=>{
    passport.authenticate("local")(req,res,()=>{
      return res.redirect("/")
    })
  })
});


// google authentication provider ----------------------------------------------------------------
router.get("/login/federated/google",passport.authenticate("google"))
router.get("/oauth2/redirect/google",passport.authenticate("google",{
  successRedirect:"/",
  failureRedirect:"/login"
}))

passport.use(new googleStrategy({
  clientID:process.env.GOOGLE_ID,
  clientSecret:process.env.GOOGLE_SEC,
  callbackURL:"/oauth2/redirect/google",
  scope:["email",'profile','openid']
},async (accessToken,refreshToken,profile,cb)=>{
  console.log(profile)
  const userFind = await userModel.findOne({email:profile.emails[0].value})
  if(userFind){
    return cb(null,userFind)
  }
  const userData = await userModel.create({
    googleid:profile.id,
    username:profile.displayName,
    picture:profile.photos[0].value,
    email:profile.emails[0].value,
  })
  return cb(null,userData)
}))


// user logout ----------------------------------------------------------------
router.get("/logout",(req,res)=>{
  if(req.isAuthenticated()){
    req.logOut(err=>{
      if(err){
        return res.redirect("/login")
      } 
      return res.redirect("/login")
    })
  }
})

module.exports = router;
