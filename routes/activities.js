const express = require('express');
const router = express.Router();
const activities = require('../controllers/activities');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateActivities } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Activities = require('../models/activitie');

router.route('/')
    .get(catchAsync(activities.index), catchAsync(activities.showActivities))
    .post(isLoggedIn, upload.array('image'), validateActivities, catchAsync(activities.createActivities))


router.get('/new', isLoggedIn, catchAsync(activities.renderNewForm))

router.route('/:id')
    .get(catchAsync(activities.showActivities))
    .put(isLoggedIn, isAuthor, upload.array('image'),validateActivities, catchAsync(activities.updateActivities))
    .delete(isLoggedIn, isAuthor, catchAsync(activities.deleteActivities));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(activities.renderEditForm))



module.exports = router;