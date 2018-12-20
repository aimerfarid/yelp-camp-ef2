var Campground = require("../models/campground");
var Comment = require("../models/comment");

// all the middlware goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    // is user logged in
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function(err, foundCampground){
            if (err || !foundCampground) {
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                //does user own the campground?
                /*console.log(foundCampground.author.id);
                console.log(req.user._id);*/
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin ) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that!");
                    console.log("YOU DO NOT HAVE PERMISSION TO DO THAT!!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        console.log("YOU NEED TO BE LOGGED IN TO DO THAT!!");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
    // is user logged in
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if (err || !foundComment) {
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                //does user own the campground?
                /*console.log(foundCampground.author.id);
                console.log(req.user._id);*/
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin ) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that!");
                    console.log("YOU DO NOT HAVE PERMISSION TO DO THAT!!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        console.log("YOU NEED TO BE LOGGED IN TO DO THAT!!");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
}

module.exports = middlewareObj;