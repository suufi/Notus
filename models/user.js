// get an instance of mongoose and mongoose.Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

// set up a mongoose model and pass it using module.exports
const userSchema = new Schema({
  email: String,
  admin: Boolean,
  verified: Boolean,
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

userSchema.plugin(passportLocalMongoose, ({usernameLowerCase: true, usernameQueryFields: ['email'], limitAttempts: true, maxAttempts: 20}));

// override toJSON so that the password hash isn't returned
userSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password;
  return obj;
};

// create the model for users and expose to the app
module.exports = mongoose.model('User', userSchema);
