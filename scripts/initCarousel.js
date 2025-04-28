const mongoose = require('mongoose');
const CarouselImage = require('../models/CarouselImage');
require('dotenv').config();

const initDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Créer une image test
        const testImage = new CarouselImage({
            chemin_image: '/uploads/carousel/test-image.jpg',
            date_creation: new Date()
        });

        await testImage.save();
        console.log('Image test créée avec succès');

        // Vérifier la structure
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections dans la base de données:', collections.map(c => c.name));

        const images = await CarouselImage.find();
        console.log('Images dans la collection:', images);

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await mongoose.connection.close();
    }
};

initDB();
