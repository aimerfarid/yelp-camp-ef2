#Style the campgrounds page
* Add a better header/title
* Make campgrounds display in a grid

#Style the Navbar and Form
* Add a navbar to all templates
* Style the new campground form

#Add Mongoose
* Install and configure mongoose
* Setup campground model
* Use campground model insider of our routes

#Show Page
* Review the RESTful routes we've seen so far
* Add description to our campground model
* Show db.collection.drop()
* Add a show route/template

#Refactor Mongoose Code
* Create a models directory
* Use module.exports
* Require everything correctly!

#Add Seeds File
* Add a seeds.js file
* Run the seeds file every time the server starts

#Add the comment model!
* Make our errors go away!
* Display comments on campground show page

#Comment New/Create
* Discuss

##Style Show Page
* Add siderbar to show page
* Display comment nicely

##Finish Styling Show Page
* Add public directory
* Add custom stylesheet

##Auth Pt. 1 - Add User Model 
* Install all packages needed for auth
* Define User Model

##Auth Pt. 2 -
* Configure Passport
* Add register routes
* Add register template

##Auth Pt. 3 - 
* Add login routes
* Add login template

##Auth Pt. 4 - 
* Add logout route
* Prevent user from adding a comment if not signed in
* Add links to navbar

##Auth Pt. 5 - 
* Show/hide auth links in navbar correctly


##Refactor the Routes
* Use Express router to reorganize all routes

##Users + Comments
* Associate users and comments
* Save author's name to a comment automatically

##Users + Campgrounds
* Prevent an unauthenticated user from creating a campground
* Save username+id to newly created campground

RESTFUL ROUTES

name     url    verb    desc.
=================================================
INDEX   /dogs       GET     Display a list of all dog
NEW     /dogs/new   GET     Displays form to make a new dog
CREATE  /dogs       POST    Add new dog to DB
SHOW    /dogs/:id   GET     Shows info about one dog

INDEX   /campgrounds
NEW     /campgrounds
CREATE  /campgrounds
SHOW    /campgrounds/:id

NEW     campgrounds/:id/comments/new    GET
CREATE  campgrounds/:id/comments        POST