var express = require("express");
var router = express.Router();
var numeral = require("numeral");
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);
/*
===============================
    CAMPGROUNDS ROUTES
===============================
*/

/*INDEX - show all campgrounds */
router.get("/", function(req, res){
    if (req.query.search) {
        // escapeRegex(req.query.searc)
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        Campground.find({name: regex}, function(err, allCampgrounds){
            if (err) {
                console.log(err);
            } else {
                if(allCampgrounds.length < 1) {
                    return res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds', "error": "No match! Please Try Again!"});
                }
                res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds'});
            }
        });
    } else {
        // Get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds){
            if (err) {
                console.log(err);
            } else {
                res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds'});            
            }
        });
    }
});

// cloudinary.v2.uploader.upload(req.file.path, function(err, result) {console.log(result, error)});
//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single("image"), function(req, res){
    // cloudinary configuration
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if (err) {
         req.flash("error", err.message);
         return res.redirect("back");
        }
        // geocoder configuration
        geocoder.geocode(req.body.location, function (err, data) {
            if (err || !data.length) {
                req.flash("error", "Invalid address");
                return res.redirect("back");
            }
            req.body.campground.lat = data[0].latitude;
            req.body.campground.lng = data[0].longitude;
            req.body.campground.location = data[0].formattedAddress;
            
            //numeral configuration
            req.body.campground.price = numeral(req.body.price).format('0,0.00');
            
            // add cloudinary url for the image to the campground object under image property
            req.body.campground.image = result.secure_url;
            // add image's public_id to campground object
            req.body.campground.imageId = result.public_id;
            // add author to campground
            req.body.campground.author = {
                id: req.user._id,
                username: req.user.username
            };
            // add to the Campground model
            Campground.create(req.body.campground, function(err, campground) {
                if (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
                res.redirect('/campgrounds/' + campground.id);
            });
        });
    });
});

/*NEW - Show form to create new campground*/
router.get("/new", middleware.isLoggedIn, function(req, res) {
   res.render("campgrounds/new");
});

/*SHOW - Show more info about one campground*/
router.get("/:id", function(req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
       if (err || !foundCampground) {
           req.flash("error", "Comment not found");
           res.redirect("back");
       } else {
        //   console.log(foundCampground);
           //render show template with that campground
           res.render("campgrounds/show", {campground: foundCampground});
       } 
    });
    req.params.id
    
    // console.log("THIS WILL BE THE SHOW PAGE ONE DAY!");
    // res.send("THIS WILL BE THE SHOW PAGE ONE DAY!");
});

/*EDIT - Edit Campground Route*/
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function(req, res){
  Campground.findById(req.params.id, function(err, campground){
      //google maps
      geocoder.geocode(req.body.location, async function (err, data) {
       if (err || !data.length) {
         req.flash("error", "Invalid address");
         return res.redirect('back');
       }
       campground.lat = data[0].latitude;
       campground.lng = data[0].longitude;
       campground.location = data[0].formattedAddress;
       //end of google maps
      if(err){
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        if(req.file) {
          try{
            await cloudinary.v2.uploader.destroy(campground.imageId);
            var result = await cloudinary.v2.uploader.upload(req.file.path);
            campground.imageId = result.public_id;
            campground.image = result.secure_url;
          } catch(err){
            req.flash("error", err.message);
            return res.redirect("back");
          }
        }
        campground.name = req.body.campground.name;
        //numeral configuration
        campground.price = numeral(req.body.campground.price).format('0,0.00');
        campground.description = req.body.campground.description;
        campground.save();
        req.flash("success","Successfully Updated!");
        res.redirect("/campgrounds/" + req.params.id);
        }
      });
  });
// geocoder.geocode(req.body.location, function (err, data) {
//     if (err || !data.length) {
//       req.flash('error', 'Invalid address');
//       return res.redirect('back');
//     }
//     req.body.campground.lat = data[0].latitude;
//     req.body.campground.lng = data[0].longitude;
//     req.body.campground.location = data[0].formattedAddress;

//     Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
//         if(err){
//             req.flash("error", err.message);
//             res.redirect("back");
//         } else {
//             req.flash("success","Successfully Updated!");
//             res.redirect("/campgrounds/" + campground._id);
//         }
//     });
//   });
});

/*DESTROY - Delete Campground Route*/
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    // res.send("YOU ARE TRYING TO DELETE SOMETHING");
    Campground.findByIdAndRemove(req.params.id, async function(err, campground){
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        } 
        try {
            /* code */
            await cloudinary.v2.uploader.destroy(campground.imageId);
            campground.remove();
            req.flash("success", "Campground deleted successfully!");
            res.redirect("/campgrounds");            
        } catch (err) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

/*CREATE - Add new campgrounds*/
/*router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var nameC = req.body.name;
    var priceC = numeral(req.body.price).format('0,0.00');
    var imageC = req.body.image;
    var descriptionC = req.body.description;
    var authorC = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: nameC, price: priceC, image: imageC, description: descriptionC, author:authorC};
    // campgrounds.push(newCampground);
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if (err) {
            console.log(err);
        } else {
            // redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    })

});
*/

/*UPDATE - Update Campground Route*/
/*router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
    // redirect somewher(show page)
})
*/

module.exports = router;