let User = require('../models/user');
let Post = require('../models/posts');
let passport = require('../passport');
require('dotenv').config();


let async = require('async');
let {body,validationResult} = require("express-validator");
const { findByIdAndRemove } = require('../models/user');




exports.sign_up_get = function(req,res,next){
    res.render('sign-up',{title:'Sign-up Form',msg:" "});
};

exports.sign_up_post = [
  body('username').trim().isLength({min:1}).escape(),
  
  (req,res,next)=>{
      const errors = validationResult(req);

      let user = new User({
          username:req.body.username,
          name:req.body.name,
          password:req.body.password,
          admin:false
          
      });

      if(!errors.isEmpty()){
          res.render('sign-up',{title:'Sign-Up',msg:' ',errors:errors.array()});
          return;
      }
      if(req.body.password != req.body.confirm_pw){
          res.render('sign-up',{title:'Sign-Up',msg:'Password not matched with confirmPassword'});
          return;
      }

      User.findOne({'username':user.username}).exec(function(err,result){
          if(result){
              res.render('sign-up',{title:'Sign-Up',msg:'Username taken'});
              return;
          }
          else{
              //username not exist,save the user
              user.save(function(err){
                  if(err){
                      next(err);
                  }
                  res.redirect('/catalog/login');
              })
          }
      });

  }
];

exports.login_get = function(req,res,next){
    res.render('log_in',{title:"Log-In"});
}

exports.login_post =  
passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/catalog/login',
    
});


exports.logout = function(req,res,next){
    req.logout();
    res.redirect('/catalog');
}

exports.create_post = function(req,res,next){
    res.render('create_post_form',{title:'Create Post'});
}
exports.create_post_post = function(req,res,next){
    console.log(res.locals.currentUser._id);
    const date = new Date().toLocaleTimeString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    });
    let post = new Post({
        title:req.body.title,
        message:req.body.message,
        user:res.locals.currentUser._id,
        time:date,
    });

    post.save(function(err){
        if(err){
            return next(err);
        }
        res.redirect('/catalog');
    });
}

exports.admin = function(req,res,next){
    res.render('admin',{title:'Admin_form',msg:' '});
}
exports.admin_post = function(req,res,next){
    let useru= new User({
        username:res.locals.currentUser.username,
        name:res.locals.currentUser.name,
        password:res.locals.currentUser.password,
        admin:true,
        _id:res.locals.currentUser._id
    });

    
    if(req.body.admin == process.env.admin){
        User.findByIdAndUpdate(res.locals.currentUser._id,useru,{},function(err,uuser){
            res.redirect('/catalog');
        });
    }else{
        res.render('admin',{title:'Admin_form',msg:'Wrong password'})
    }
    
}

exports.delete = function(req,res,next){
    Post.findByIdAndRemove(req.body.delete,function(err){
        if(err){
            return next(err);
        }
        res.redirect('/catalog');
    })
}
