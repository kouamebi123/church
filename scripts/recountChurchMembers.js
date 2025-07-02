const mongoose = require('mongoose');
const User = require('../models/User');
const Church = require('../models/Church');
const dbConfig = require('../config/db');

(async () => {
  try {
    await dbConfig();
    const churches = await Church.find();
    for (const church of churches) {
      const count = await User.countDocuments({ eglise_locale: church._id });
      await Church.findByIdAndUpdate(church._id, { nombre_membres: count });
      console.log(`Église: ${church.nom} => ${count} membres`);
    }
    console.log('Recalcul terminé.');
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors du recalcul:', err);
    process.exit(1);
  }
})(); 