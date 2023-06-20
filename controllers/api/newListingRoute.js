const router = require("express").Router();
const { userInfo } = require("os");
const { Property, ListingPhotos } = require("../../models");
const withAuth = require("../../utils/auth"); // users can post/delete so long as they are logged in

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/", (req, res) => {
  Property.findAll()
    .then((dbPropertyData) => res.json(dbPropertyData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post("/", upload.single("photo"), async (req, res) => {
  try {
    let listingInfo = Object.assign(req.body, { ownerID: req.session.user_id });

    console.log(listingInfo);

    const newListing = await Property.create({
      ...listingInfo,
    });

    const photo = req.file;

    const listingID = newListing.id;

    console.log(photo);

    const newPhoto = await ListingPhotos.create({
      filename: req.file.filename,
      listingID: listingID,
    });

    console.log(newListing, newPhoto);
    res.status(200).json({ newListing, newPhoto });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
