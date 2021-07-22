const Activities = require('../models/activitie');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const activities = await Activities.find({}).populate('popupText');
    res.render('activities/index', { activities })
}

module.exports.renderNewForm = (req, res) => {
    res.render('activities/new');
}

module.exports.createActivities = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.activities.location,
        limit: 1
    }).send()
    const activities = new Activities(req.body.activities);
    activities.geometry = geoData.body.features[0].geometry;
    activities.images = req.files.map(f => ({ url: f.path, filename: f.filename, }));
    activities.author = req.user._id;
    await activities.save();
    console.log(activities)
    req.flash('success', 'Successfully made a new activities!');
    res.redirect(`/activities/${activities._id}`)
}

module.exports.showActivities = async (req, res,) => {
    const activities = await Activities.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!activities) {
        req.flash('error', 'Cannot find that activities!');
        return res.redirect('/activities');
    }
    console.log(activities)
    res.render('activities/show', { activities });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const activities = await Activities.findById(id)
    if (!activities) {
        req.flash('error', 'Cannot find that activities!');
        return res.redirect('/activities');
    }
    res.render('activities/edit', { activities });
}

module.exports.updateActivities = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const activities = await Activities.findByIdAndUpdate(id, { ...req.body.activities });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    activities.images.push(...imgs);
    await activities.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await activities.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    console.log(activities.images);
    req.flash('success', 'Successfully updated activities!');
    res.redirect(`/activities/${activities._id}`)
}

module.exports.deleteActivities = async (req, res) => {
    const { id } = req.params;
    await Activities.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted activities')
    res.redirect('/activities');
}