// Script pour ajouter le champ church à toutes les entrées des collections
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/church';
const CHURCH_ID = '6806a0653e9da494ba67cf1c';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connecté à MongoDB');

  // 1. Networks
  const Network = mongoose.connection.collection('networks');
  const res1 = await Network.updateMany(
    { church: { $exists: false } },
    { $set: { church: new mongoose.Types.ObjectId(CHURCH_ID) } }
  );
  console.log(`Networks modifiés : ${res1.modifiedCount}`);

  // 2. Groups
  const Group = mongoose.connection.collection('groups');
  const res2 = await Group.updateMany(
    { church: { $exists: false } },
    { $set: { church: new mongoose.Types.ObjectId(CHURCH_ID) } }
  );
  console.log(`Groups modifiés : ${res2.modifiedCount}`);

  // 3. Users (eglise_locale)
  const User = mongoose.connection.collection('users');
  const res3 = await User.updateMany(
    { eglise_locale: { $exists: false } },
    { $set: { eglise_locale: new mongoose.Types.ObjectId(CHURCH_ID) } }
  );
  console.log(`Users modifiés : ${res3.modifiedCount}`);

  // 4. Services
  const Service = mongoose.connection.collection('services');
  const res4 = await Service.updateMany(
    { church: { $exists: false } },
    { $set: { church: new mongoose.Types.ObjectId(CHURCH_ID) } }
  );
  console.log(`Services modifiés : ${res4.modifiedCount}`);

  await mongoose.disconnect();
  console.log('Terminé.');
}

main().catch(err => {
  console.error('Erreur :', err);
  mongoose.disconnect();
}); 