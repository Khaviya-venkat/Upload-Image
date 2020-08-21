var express               = require("express"),
	multer				  = require("multer"),
	sharp				  = require("sharp"),
	path				  = require("path"),
	helpers 			  = require('./models/helpers'),
	app 				  = express(),
	path				  = require("path"),
    mongoose              = require("mongoose"),
	passport              = require("passport"),
	bodyParser            = require("body-parser"),
	User                  = require("./models/user"),
	Image				  = require("./models/image");
	LocalStrategy         = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	mongoDB = ("mongodb://localhost/Thumbnails");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

mongoose.set('useUnifiedTopology', true);
mongoose.connect(mongoDB, { useNewUrlParser: true });

app.set("view engine","ejs");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended : true}));
app.use(require("express-session")({
	  secret : "i love myself",
	  resave : false,
	  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use( new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/home",function(req,res){
	res.render("home");
});

app.get("/signup",function(req,res){
	res.render("signup");
});

app.post("/signup",function(req,res){
	req.body.username
	req.body.password
	User.register(new User({username : req.body.username}),req.body.password,function(err,user){
		passport.authenticate("local")(req,res,function(){
			res.redirect("/secret");
		});
	});
});

app.get("/",function(req,res){
	res.render("login");
	req.logout();
});

app.post("/login",passport.authenticate("local",{
	successRedirect:"/upload",
	failureRedirect:"/login"
}),function(req,res){
	req.body.username
	req.body.password
});

app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});

app.get("/upload", function(req, res){
	res.render("upload");
});

app.get("/:imgsrc/upload", function(req, res){
	Image.create({username: "Khaviya", img: req.params.imgsrc});
	res.render("upload");
});

const upload = multer({ storage: storage, fileFilter: fileFilter });

//Configure sharp

//Upload route
app.post('/upload', upload.single('image'), (req, res, next) => {
    try {
        sharp(req.file.path).resize(200, 200).toFile('public/' + 'uploads/' + 'thumbnails-' + req.file.originalname, (err, resizeImage) => {
            if (err) {
				console.log("First itself");
                console.log(err);
            } else {
				console.log("Im here");
                console.log(resizeImage);
				console.log(req.file.path); 
				var pathda = req.file.path;
				var pathba = "";
				for(var i = 6;i < pathda.length;i++){
					pathba += pathda[i]; 
				}
				var name = req.user.username;
				console.log(name);
				console.log(pathba);
				var newimage = {user: name, img: pathba};
				Image.create(newimage, function(err, img){
					if(err){
						console.log("Success is near");
						console.log(err);
					}
					else{
						console.log("Success is very near");
					  // res.send(`You have uploaded this image: <hr/><img src="${pathba}" width="500"><hr /><a href="./">Upload another image</a>`);
						res.redirect("/dashboard");
					}
				});
            }
        });
    } catch (error) {
        console.error(error);
    }
});

app.get("/dashboard", function(req, res){
	var name = req.user.username;
	Image.find({user: name}, function(err, allimgs){
		if(err){
			console.log(err);
		}
		else{
			res.render("dashboard", {imgs: allimgs});
		}
	})
});

app.get("/:id/view", function(req, res){
	Image.findById(req.params.id, function(err, image){
		if(err){
			console.log(err);
		}
		else{
			res.render("view", {image: image});
		}
	});
});

function islogin(req ,res ,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

app.listen(3000, function(){
  console.log("Server is listening");
});