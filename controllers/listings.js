const Booking = require('../models/booking.js');
const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const { sendEmail } = require('../utils/email');

// --- INDEX ROUTE ---
module.exports.indexroute = async (req, res) => {
    const { category, sortBy, price_min, price_max, q } = req.query;
    let filter = {};
    let sortOptions = {};

    if (category && category !== 'Trending') { filter.category = category; }
    if (price_min || price_max) {
        filter.price = {};
        if (price_min) { filter.price.$gte = Number(price_min); }
        if (price_max) { filter.price.$lte = Number(price_max); }
    }
    if (q) {
        const regex = new RegExp(escapeRegex(q), 'i');
        filter.$or = [
            { title: regex }, { location: regex }, { country: regex }, { category: regex }
        ];
    }
    switch (sortBy) {
        case 'price_asc': sortOptions = { price: 1 }; break;
        case 'price_desc': sortOptions = { price: -1 }; break;
        case 'location_asc': sortOptions = { location: 1 }; break;
    }

    const allListings = await Listing.find(filter)
        .populate({ path: 'bookings', match: { endDate: { $gte: new Date() } } })
        .sort(sortOptions);

    allListings.forEach(listing => {
        if (listing.bookings && listing.bookings.length > 0) {
            const latestCheckoutDate = listing.bookings.reduce((latest, booking) => {
                return booking.endDate > latest ? booking.endDate : latest;
            }, new Date(0));

            if (latestCheckoutDate.getTime() > 0) {
                const nextAvailable = new Date(latestCheckoutDate);
                nextAvailable.setDate(nextAvailable.getDate() + 1);
                listing.nextAvailableDate = nextAvailable.toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short'
                });
            }
        }
    });

    res.render("./listings/index.ejs", { allListings, query: req.query });
};

module.exports.newroute = async (req, res) => {
    res.render("./listings/new.ejs");
};

module.exports.showroute = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!listing) {
        req.flash("error", "The listing you are looking for does not exist");
        return res.redirect("/listings");
    }

    let hasReviewed = false;
    if (req.user) {
        hasReviewed = listing.reviews.some(
            (review) => review.author && review.author.equals(req.user._id)
        );
    }

    res.render("./listings/show.ejs", { listing, hasReviewed });
};

// CREATE LISTING
module.exports.createroute = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location, limit: 1
    }).send();

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    if (req.files) {
        newListing.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    }

    newListing.geometry = response.body.features[0].geometry;
    await newListing.save();
    req.flash("success", "New Listing Created Successfully");
    res.redirect("/listings");
};

// EDIT LISTING
module.exports.editroute = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "The listing you are looking for does not exist");
        return res.redirect("/listings");
    }
    res.render("./listings/edit.ejs", { listing });
};

// UPDATE LISTING
module.exports.updateroute = async (req, res) => {
    const { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (req.files && req.files.length > 0) {
        const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
        listing.images.push(...newImages);
        await listing.save();
    }

    req.flash("success", "Your Listing Was Updated Successfully");
    res.redirect(`/listings/${id}`);
};

// DELETE LISTING
module.exports.destroyroute = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted Successfully");
    res.redirect("/listings");
};

module.exports.searchroute = async (req, res) => {
    res.redirect(`/listings?q=${req.query.q}`);
};

function escapeRegex(text) {
    if (!text) return '';
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// --- CONTACT OWNER ---
module.exports.contactOwner = async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    const listing = await Listing.findById(id).populate('owner');

    if (!listing) {
        req.flash('error', 'Listing not found.');
        return res.redirect('/listings');
    }

    try {
        await sendEmail({
            to: listing.owner.email,
            subject: `Message about your listing: ${listing.title}`,
            text: `You have a new message from ${req.user.email}:\n\n"${message}"`
        });
        req.flash('success', 'Your message has been sent to the owner!');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong, your message was not sent.');
    }

    res.redirect(`/listings/${id}`);
};

// --- CREATE BOOKING ---
module.exports.createBooking = async (req, res) => {
    const { id } = req.params;
    const { startDate, endDate } = req.body;

    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);

    const conflict = await Booking.findOne({
        listing: id,
        status: 'confirmed',
        $or: [
            { startDate: { $lte: newEndDate }, endDate: { $gte: newStartDate } }
        ]
    });

    if (conflict) {
        req.flash('error', `Sorry! This property is already booked from ${conflict.startDate.toLocaleDateString()} until ${conflict.endDate.toLocaleDateString()}.`);
        return res.redirect(`/listings/${id}`);
    }

    const newBooking = new Booking({
        listing: id,
        user: req.user._id,
        startDate: newStartDate,
        endDate: newEndDate
    });
    await newBooking.save();
    await Listing.findByIdAndUpdate(id, { $push: { bookings: newBooking._id } });

    req.flash('success', 'Booking successful! Enjoy your stay.');
    res.redirect(`/listings/${id}`);
};
