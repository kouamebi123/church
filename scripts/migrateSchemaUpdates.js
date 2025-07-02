// Script de migration pour ajouter les nouveaux champs aux documents existants
const mongoose = require('mongoose');
const Church = require('../models/Church');
const Network = require('../models/Network');
const Service = require('../models/Service');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/church';

async function migrate() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connecté à MongoDB');

  // 1. Church : ajouter adresse et responsable si absents
  const churches = await Church.find();
  for (const church of churches) {
    let updated = false;
    if (church.adresse === undefined) {
      church.adresse = '';
      updated = true;
    }
    if (church.responsable === undefined) {
      church.responsable = null;
      updated = true;
    }
    if (updated) await church.save();
  }
  console.log('Mise à jour des églises terminée.');

  // 2. Network : ajouter church si absent
  const networks = await Network.find();
  for (const network of networks) {
    if (network.church === undefined) {
      network.church = null;
      await network.save();
    }
  }
  console.log('Mise à jour des réseaux terminée.');

  // 3. Service : ajouter les nouveaux champs d'invitation si absents
  const services = await Service.find();
  for (const service of services) {
    let updated = false;
    if (service.invitationYoutube === undefined) {
      service.invitationYoutube = 0;
      updated = true;
    }
    if (service.invitationTiktok === undefined) {
      service.invitationTiktok = 0;
      updated = true;
    }
    if (service.invitationInstagram === undefined) {
      service.invitationInstagram = 0;
      updated = true;
    }
    if (service.invitationPhysique === undefined) {
      service.invitationPhysique = 0;
      updated = true;
    }
    if (updated) await service.save();
  }
  console.log('Mise à jour des services terminée.');

  await mongoose.disconnect();
  console.log('Migration terminée.');
}

migrate().catch(err => {
  console.error('Erreur lors de la migration :', err);
  mongoose.disconnect();
}); 