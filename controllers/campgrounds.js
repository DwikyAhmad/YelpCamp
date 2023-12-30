const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const axios = require("axios");

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("./campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render("./campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);

    const locationCords = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${req.body.campground.location}&apiKey=${process.env.GEO_API_KEY}`
    );
    const {
        features: [{ geometry }],
    } = locationCords.data;
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));
    campground.author = req.user._id;
    campground.geometry = geometry;
    await campground.save();
    console.log(campground);
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("author");
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        res.redirect("/campgrounds");
    }
    res.render("./campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        res.redirect("/campgrounds");
    }

    res.render("./campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const locationCords = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${req.body.campground.location}&apiKey=${process.env.GEO_API_KEY}`
    );
    const {
        features: [{ geometry }],
    } = locationCords.data;
    const campground = await Campground.findByIdAndUpdate(
        id,
        req.body.campground
    );
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    campground.geometry = geometry
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } },
        });
        console.log(campground);
    }
    req.flash("success", "successfully updated campground!");
    res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
};
