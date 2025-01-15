const listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  const allListing = await listing.find({});
  res.render("listings/index.ejs", { allListing });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListings = async (req, res) => {
  let { id } = req.params;
  let showData = await listing
    .findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!showData) {
    req.flash("error", "Listing you requested fro does not exist");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { showData });
};

module.exports.delete = async (req, res) => {
  let { id } = req.params;
  let deletedListng = await listing.findByIdAndDelete(id);
  console.log(deletedListng);
  req.flash("success", "listing deleted");
  res.redirect("/listings");
};

module.exports.createListing = async (req, res, next) => {
  

  let url = req.file.path;
  let filename = req.file.filename;
  // console.log(url, " ", filename);
  const listing1 = new listing(req.body.listing);
  listing1.owner = req.user._id;
  listing1.image = { url, filename };
  listing1.category = req.body.category;
  let savedListing = await listing1.save();
  console.log(savedListing);
  req.flash("success", "new listing created");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const elisting = await listing.findById(id);
  if (!elisting) {
    req.flash("error", "listing you requested for does not exist");
    res.redirect("/listings");
  }

  let originalImageUrl = elisting.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");

  let originalCategory = elisting.category;

  res.render("listings/edit.ejs", {
    elisting,
    originalImageUrl,
    originalCategory,
  });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  const { title, description, price, country, location } = req.body.listing;

  //extracting category
  let category = req.body.category;

  // Extract `image` and handle it separately
  let image = req.body.listing.image; // Expecting a URL or empty string

  // Construct the `image` object if a new image is provided
  const updatedData = {
    title,
    description,
    price,
    country,
    location,
  };

  if (image) {
    updatedData.image = {
      url: image,
      filename: "updated-image", // Update or generate filename as needed
    };
  }
  if (category) {
    updatedData.category = category;
  }

  try {
    let list = await listing.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true } // Ensure validation and get updated doc
    );

    if (typeof req.file !== "undefined") {
      let url = req.file.path;
      let filename = req.file.filename;

      list.image = { url, filename };
      await list.save();
    }
    // res.flash("success" , "Listing Updated")
    req.flash("success", "listing updated");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error("Error updating listing:", err);
    res.status(500).send("Failed to update listing");
  }
};
