const mongoose = require('mongoose');

const carouselImageSchema = new mongoose.Schema({
  chemin_image: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CarouselImage', carouselImageSchema);
