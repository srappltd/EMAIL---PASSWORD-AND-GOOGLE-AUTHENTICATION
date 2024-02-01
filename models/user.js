const mongoose = require("mongoose")
const plm = require("passport-local-mongoose")

const userSchema = new mongoose.Schema({
    googleid:{type:String, default:""},
    picture:{type:String, default:""},
    username:String,
    email:String,
    mobile:{type:String, default:""},
})
userSchema.plugin(plm,{ usernameField: 'email' })
module.exports   = mongoose.model("user",userSchema)