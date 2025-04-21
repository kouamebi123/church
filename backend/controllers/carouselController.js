const CarouselImage = require('../models/CarouselImage');
const fs = require('fs');
const path = require('path');

// GET : toutes les images
exports.getAllImages = async (req, res) => {
  try {
    const images = await CarouselImage.find().sort({ createdAt: -1 });
    res.json({ success: true, data: images });
  } catch (error) {
    console.error('Erreur getAllImages:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des images" });
  }
};

// POST : ajouter une image
exports.addImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Aucune image n'a été téléchargée"
      });
    }

    const image = new CarouselImage({
      chemin_image: `/uploads/carousel/${req.file.filename}`
    });

    const savedImage = await image.save();

    res.status(201).json({
      success: true,
      data: savedImage
    });
  } catch (error) {
    console.error('Erreur addImage:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'ajout de l'image"
    });
  }
};

// DELETE : supprimer une image
exports.deleteImage = async (req, res) => {
  try {
    const image = await CarouselImage.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ message: "Image non trouvée" });
    }

    const filePath = path.join(__dirname, '..', image.chemin_image); // corrigé ici
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await image.deleteOne();

    res.json({ success: true, message: "Image supprimée avec succès" });
  } catch (error) {
    console.error('Erreur deleteImage:', error);
    res.status(500).json({ message: "Erreur lors de la suppression de l'image" });
  }
};
