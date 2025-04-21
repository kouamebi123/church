const User = require('../models/User');
const Group = require('../models/Group');
const Network = require('../models/Network');

// @desc    Obtenir les statistiques globales
// @route   GET /api/stats
// @access  Private
exports.getGlobalStats = async (req, res) => {
  try {
    const total_reseaux = await Network.countDocuments();
    const total_resp_reseaux = await User.countDocuments({ qualification: 'Responsable réseau' });
    const total_gr = await Group.countDocuments();
    const allGroups = await Group.find({}, ['responsable1', 'responsable2']);
    let total_resp_gr = 0;
    allGroups.forEach(gr => {
      if (gr.responsable1) total_resp_gr += 1;
      if (gr.responsable2) total_resp_gr += 1;
    });
    const total_leaders_all = await User.countDocuments({ qualification: { $in: ['Leader', 'Responsable réseau', '12', '144', '1728'] } });
    const total_reguliers = await User.countDocuments({ qualification: 'Régulier' });
    const total_integration = await User.countDocuments({ qualification: 'En intégration' });
    const total_irreguliers = await User.countDocuments({ qualification: 'Irrégulier' });
    const total_gouvernance = await User.countDocuments({ qualification: 'Gouvernance' });
    const total_ecodim = await User.countDocuments({ qualification: 'Ecodim' });
    const total_resp_ecodim = await User.countDocuments({ qualification: 'Responsable ecodim' });
    const total_all = await User.countDocuments();

    // Calcul des personnes isolées
    const usersInGroups = await Group.distinct('members');
    const total_personnes_isolees = await User.countDocuments({
      _id: { $nin: usersInGroups },
      qualification: { $nin: ['Responsable réseau', 'Gouvernance', 'Ecodim', 'Responsable ecodim'] }
    });

    res.json({
      total_gouvernance,
      total_reseaux,
      total_resp_reseaux,
      total_gr,
      total_resp_gr,
      total_leaders_all,
      total_reguliers,
      total_integration,
      total_irreguliers,
      total_ecodim,
      total_resp_ecodim,
      total_personnes_isolees,
      total_all
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Evolution mensuelle des membres par réseau (12 derniers mois)
// @route   GET /api/networks/evolution
// @access  Private
exports.getNetworksEvolution = async (req, res) => {
  try {
    const Network = require('../models/Network');
    const Group = require('../models/Group');

    // Récupère tous les réseaux
    const networks = await Network.find();
    const networkNames = networks.map(n => n.nom);

    // Prépare exactement les 12 derniers mois (YYYY-MM), y compris le mois en cours
    const now = new Date();
    const months = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 10 + i, 1);
      const month = d.toISOString().slice(0, 7);
      months.push(month);
    }

    console.log(months)
    // La boucle ci-dessus garantit déjà 12 mois glissants, du mois il y a 11 mois jusqu'au mois en cours.


    // Prépare l'évolution
    const evolution = [];
    for (const month of months) {
      // Date de fin du mois (inclus)
      const [year, m] = month.split('-');
      const endOfMonth = new Date(Number(year), Number(m), 0, 23, 59, 59, 999);

      // Pour chaque réseau, compte les membres présents dans les groupes à cette date
      const row = { month };
      for (const network of networks) {
        // Récupère tous les groupes du réseau créés avant fin du mois
        const groups = await Group.find({
          network: network._id,
        }).select('members membersHistory createdAt');

        // Récupère tous les membres uniques ajoutés avant la date (via membersHistory)
        const memberIds = new Set();
        groups.forEach(g => {
          if (Array.isArray(g.membersHistory)) {
            g.membersHistory.forEach(m => {
              if (m.joinedAt <= endOfMonth && (!m.leftAt || m.leftAt > endOfMonth)) {
                memberIds.add(m.user.toString());
              }
            });
          }
        });

        row[network.nom] = memberIds.size;
      }
      evolution.push(row);
    }

    res.status(200).json({
      success: true,
      data: evolution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Comparaison annuelle réseaux (année précédente vs année en cours)
// @route   GET /api/networks/evolution/compare
// @access  Private
exports.compareNetworksByYear = async (req, res) => {
  try {
    const { years } = req.query;
    if (!years || !years.includes(',')) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir deux années séparées par une virgule'
      });
    }
    const [year1, year2] = years.split(',').map(y => Number(y));
    const dates = [
      new Date(year1, 11, 31, 23, 59, 59, 999),
      new Date(year2, 11, 31, 23, 59, 59, 999)
    ];

    const networks = await Network.find();
    const result = [];

    for (const network of networks) {
      const row = { network: network.nom };

      for (let i = 0; i < 2; i++) {
        const endOfYear = dates[i];
        const groups = await Group.find({
          network: network._id,
            
        }).select('membersHistory');
        const memberIds = new Set();
        groups.forEach(g => {
          if (Array.isArray(g.membersHistory)) {
            g.membersHistory.forEach(m => {
  const joinedAt = new Date(m.joinedAt);
  const leftAt = m.leftAt ? new Date(m.leftAt) : null;
  // DEBUG LOG
  console.log(`network: ${network.nom}, year: ${years.split(',')[i]}, endOfYear: ${endOfYear.toISOString()}, joinedAt: ${joinedAt.toISOString()}, leftAt: ${leftAt ? leftAt.toISOString() : 'null'}`);
  console.log('Condition:', joinedAt <= endOfYear && (!leftAt || leftAt > endOfYear));
  if (joinedAt <= endOfYear && (!leftAt || leftAt > endOfYear)) {
                memberIds.add(m.user.toString());
              }
            });
          }
        });
        row[years.split(',')[i]] = memberIds.size;
      }

      result.push(row);
    }

    res.status(200).json({
      success: true,
      data: result
    });
    console.log(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};