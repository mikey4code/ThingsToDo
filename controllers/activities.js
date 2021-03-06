const Activities = require('../models/activitie');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");
const euclideanDistance = require('euclidean-distance');

module.exports.index = async (req, res) => {
    const activities = await Activities.find({}).populate('reviews').populate('popupText');

    activities.forEach(async function (rating) {
        if (rating.reviews.length < 1) {
            rating.rateAvg = 0;
            rating.rateCount = 0
        } else {

            let sumrating = 0
            for (var i = 0, l = rating.reviews.length; i < l; i++) {
                var obj = rating.reviews[i];
                sumrating += obj.rating
            }

            rating.rateAvg = Math.floor(sumrating / rating.reviews.length);
            rating.rateCount = rating.reviews.length;
        }
        await rating.save();
    })
    
    if (req.query.search) {
        const data = await Activities.find({
            $or: [
                { title: { '$regex': req.query.search, $options: 'i' } },
                { city: { '$regex': req.query.search, $options: 'i' } },
                { state: { '$regex': req.query.search, $options: 'i' } },
                { tags: { '$regex': req.query.search, $options: 'i' } }
            ]
        }) 
        if (!data) {
            req.flash('error', 'Sorry, not match for that search!');
            return res.redirect('/activities');
        }
        res.render('activities/index', { activities: data })
        
    } else if (req.query.sortby) {
        if (req.query.sortby === "rateCount") {
            let data = await Activities.find({}).sort({ reviews: -1 })
            res.render('activities/index', { activities: data });
        } else if (req.query.sortby === "rateHigh") {
            let data = await Activities.find({}).sort({ rateAvg: -1 })
            res.render('activities/index', { activities: data });
        }else if (req.query.sortby === "priceLow") {
            let data = await Activities.find({}).sort({ price: 1 })
            res.render('activities/index', { activities: data });

        } else if (req.query.sortby === "priceHigh") {
            let data = await Activities.find({}).sort({ price: -1 })
            res.render('activities/index', { activities: data });
        }else if (req.query.sortby === "priceHigh") {
            let data = await Activities.find({}).sort({ price: -1 })
            res.render('activities/index', { activities: data });
        }
    }
    else {
        res.render('activities', { activities })
    }
}

module.exports.renderNewForm = (req, res) => {
    res.render('activities/new');
}

module.exports.createActivities = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.activities.address+ " " + req.body.activities.city + " " + req.body.activities.state,
        limit: 1
    }).send()
    const activities = new Activities(req.body.activities);
    activities.geometry = geoData.body.features[0].geometry;
    activities.images = req.files.map(f => ({ url: f.path, filename: f.filename, }));
    activities.author = req.user._id;
    await activities.save();
    req.flash('success', 'Successfully made a new activities!');
    res.redirect(`/activities/${activities._id}`)
}

module.exports.showActivities = async (req, res,) => {
    const activities = await Activities.findById(req.params.id).sort({ reviews: -1 }).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
 
    let lis = [];
    const data = await Activities.find({});
    data.forEach(function (key) {
        let result = euclideanDistance(activities.geometry.coordinates, key.geometry.coordinates)
        if (result < 1 && (activities.title != key.title)) {
            lis.push(key)
        }
    });
    if (!activities) {
        req.flash('error', 'Cannot find that activities!');
        return res.redirect('/activities');
    }
    res.render('activities/show', { activities, lis });
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
    //console.log(activities.images);
    req.flash('success', 'Successfully updated activities!');
    res.redirect(`/activities/${activities._id}`)
}

module.exports.deleteActivities = async (req, res) => {
    const { id } = req.params;
    await Activities.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted activities')
    res.redirect('/activities');
}