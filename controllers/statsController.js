const User = require('../models/User');
const Group = require('../models/Group');
const Network = require('../models/Network');

// @desc    Obtenir les statistiques globales
// @route   GET /api/stats
// @access  Private
exports.getGlobalStats = async (req, res) => {
  try {
    const churchFilter = req.query.churchId ? { eglise_locale: req.query.churchId } : {};
    
    // Statistiques des réseaux
    const total_reseaux = req.query.churchId
      ? await Network.countDocuments({ church: req.query.churchId })
      : await Network.countDocuments();
    
    const total_resp_reseaux = await User.countDocuments({ qualification: 'Responsable réseau', ...churchFilter });
    
    // Statistiques des groupes et responsables de GR
    let total_gr = 0;
    let total_resp_gr = 0;
    
    if (req.query.churchId) {
      // Si on filtre par église, on doit d'abord récupérer les réseaux de cette église
      const networksInChurch = await Network.find({ church: req.query.churchId }).select('_id');
      const networkIds = networksInChurch.map(n => n._id);
      
      // Compter les groupes dans ces réseaux
      total_gr = await Group.countDocuments({ network: { $in: networkIds } });
      
      // Compter les responsables de GR dans ces réseaux
      const groupsInChurch = await Group.find({ network: { $in: networkIds } }).select('responsable1 responsable2');
      const responsableIds = new Set();
      groupsInChurch.forEach(gr => {
        if (gr.responsable1) responsableIds.add(gr.responsable1.toString());
        if (gr.responsable2) responsableIds.add(gr.responsable2.toString());
      });
      total_resp_gr = responsableIds.size;
    } else {
      // Toutes les églises
      total_gr = await Group.countDocuments();
      const allGroups = await Group.find({}, ['responsable1', 'responsable2']);
      const responsableIds = new Set();
    allGroups.forEach(gr => {
        if (gr.responsable1) responsableIds.add(gr.responsable1.toString());
        if (gr.responsable2) responsableIds.add(gr.responsable2.toString());
      });
      total_resp_gr = responsableIds.size;
    }
    
    // Autres statistiques
    const total_leaders = await User.countDocuments({ qualification: 'Leader', ...churchFilter });
    const total_leaders_all = await User.countDocuments({ qualification: { $in: ['Leader', 'Responsable réseau', '12', '144', '1728'] }, ...churchFilter });
    const total_reguliers = await User.countDocuments({ qualification: 'Régulier', ...churchFilter });
    const total_integration = await User.countDocuments({ qualification: 'En intégration', ...churchFilter });
    const total_irreguliers = await User.countDocuments({ qualification: 'Irrégulier', ...churchFilter });
    const total_gouvernance = await User.countDocuments({ qualification: 'Gouvernance', ...churchFilter });
    const total_ecodim = await User.countDocuments({ qualification: 'Ecodim', ...churchFilter });
    const total_resp_ecodim = await User.countDocuments({ qualification: 'Responsable ecodim', ...churchFilter });
    
    // Calcul des personnes isolées
    let usersInGroups = [];
    if (req.query.churchId) {
      // Si on filtre par église, on doit d'abord récupérer les réseaux de cette église
      const networksInChurch = await Network.find({ church: req.query.churchId }).select('_id');
      const networkIds = networksInChurch.map(n => n._id);
      usersInGroups = await Group.distinct('members', { network: { $in: networkIds } });
    } else {
      usersInGroups = await Group.distinct('members');
    }
    
    const total_personnes_isolees = await User.countDocuments({
      _id: { $nin: usersInGroups },
      qualification: { $nin: ['Responsable réseau', 'Gouvernance', 'Ecodim', 'Responsable ecodim'] },
      ...churchFilter
    });
    
    // Total général : tous les utilisateurs de l'église (ou toutes les églises)
    const total_all = await User.countDocuments(churchFilter);

    res.json({
      total_gouvernance,
      total_reseaux,
      total_resp_reseaux,
      total_gr,
      total_resp_gr,
      total_leaders,
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
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};