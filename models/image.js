var mongoose = require("mongoose");

var ImgSchema = mongoose.Schema({
	user: String,
	img: String
});

module.exports = mongoose.model("image", ImgSchema);