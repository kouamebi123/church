const mongoose = require('mongoose');
const Church = require('../models/Church');
require('dotenv').config();

// Coordonnées d'exemple pour quelques villes françaises
const sampleChurches = [
    {
        nom: "Église de Paris",
        adresse: "123 Rue de la Paix",
        ville: "Paris",
        latitude: 48.8566,
        longitude: 2.3522,
        population: 2161000,
        nombre_membres: 150,
        description: "Église principale de Paris"
    },
    {
        nom: "Église de Lyon",
        adresse: "456 Avenue de la République",
        ville: "Lyon",
        latitude: 45.7578,
        longitude: 4.8320,
        population: 513275,
        nombre_membres: 120,
        description: "Église de Lyon"
    },
    {
        nom: "Église de Marseille",
        adresse: "789 Boulevard Michelet",
        ville: "Marseille",
        latitude: 43.2965,
        longitude: 5.3698,
        population: 861635,
        nombre_membres: 95,
        description: "Église de Marseille"
    },
    {
        nom: "Église de Toulouse",
        adresse: "321 Place du Capitole",
        ville: "Toulouse",
        latitude: 43.6047,
        longitude: 1.4442,
        population: 479553,
        nombre_membres: 80,
        description: "Église de Toulouse"
    },
    {
        nom: "Église de Nice",
        adresse: "654 Promenade des Anglais",
        ville: "Nice",
        latitude: 43.7102,
        longitude: 7.2620,
        population: 342522,
        nombre_membres: 65,
        description: "Église de Nice"
    },
    {
        nom: "Église de Nantes",
        adresse: "987 Quai de la Fosse",
        ville: "Nantes",
        latitude: 47.2184,
        longitude: -1.5536,
        population: 309346,
        nombre_membres: 75,
        description: "Église de Nantes"
    },
    {
        nom: "Église de Strasbourg",
        adresse: "147 Place Kléber",
        ville: "Strasbourg",
        latitude: 48.5734,
        longitude: 7.7521,
        population: 280966,
        nombre_membres: 90,
        description: "Église de Strasbourg"
    },
    {
        nom: "Église de Montpellier",
        adresse: "258 Place de la Comédie",
        ville: "Montpellier",
        latitude: 43.6108,
        longitude: 3.8767,
        population: 285121,
        nombre_membres: 70,
        description: "Église de Montpellier"
    },
    {
        nom: "Église de Bordeaux",
        adresse: "369 Place de la Bourse",
        ville: "Bordeaux",
        latitude: 44.8378,
        longitude: -0.5792,
        population: 254436,
        nombre_membres: 85,
        description: "Église de Bordeaux"
    },
    {
        nom: "Église de Lille",
        adresse: "741 Place du Général de Gaulle",
        ville: "Lille",
        latitude: 50.6292,
        longitude: 3.0573,
        population: 232787,
        nombre_membres: 60,
        description: "Église de Lille"
    }
];

async function addChurchCoordinates() {
    try {
        // Connexion à MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connecté à MongoDB');

        // Supprimer les églises existantes pour éviter les doublons
        await Church.deleteMany({});
        console.log('Églises existantes supprimées');

        // Ajouter les nouvelles églises avec coordonnées
        const churches = await Church.insertMany(sampleChurches);
        console.log(`${churches.length} églises ajoutées avec succès`);

        // Afficher les églises créées
        console.log('\nÉglises créées:');
        churches.forEach(church => {
            console.log(`- ${church.nom} (${church.ville}): ${church.latitude}, ${church.longitude}`);
        });

        console.log('\nMigration terminée avec succès!');
    } catch (error) {
        console.error('Erreur lors de la migration:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Déconnecté de MongoDB');
    }
}

// Exécuter le script
addChurchCoordinates(); 