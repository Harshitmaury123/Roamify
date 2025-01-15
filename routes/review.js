const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const listing = require("../models/listing.js");
const Review = require("../models/reviews.js");
const { isLoggedin, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => {
      return el.message.join(",");
      throw new ExpressError(400, errMsg);
    });
  } else {
    next();
  }
};

///review route
router.post(
  "/",
  isLoggedin,
  validateReview,
  wrapAsync(reviewController.createReview)
);

//delete review route
router.delete(
  "/:reviewId",
  isLoggedin,
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;
