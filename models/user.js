let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

let UserSchema = new Schema({
    username:{type:String,required:true},
    name:{type:String,required:true,maxlength:20},
    password:{type:String,required:true,maxlength:20},
    admin:{type:Boolean,required:true}
});

UserSchema.virtual('url').get(function(){
    return `/catalog/user/${this._id}`;
});

UserSchema.pre('save',function(next){
    let user = this;
    // only hash the password if it has been modified (or is new)
    if(!user.isModified('password')){
        return next();
    }
    // hash the password using our new salt
    bcrypt.hash(user.password,10,function(err,hash){
        if(err){
            return next(err);
        }
         // override the cleartext password with the hashed one
        user.password=hash;
        next();
    });

});

module.exports = mongoose.model('User',UserSchema);