import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Box, Paper, CircularProgress } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { apiService } from '../../../services/apiService';

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

const StatsCultes = () => {
  const [serviceAttendance, setServiceAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAttendance = useMemo(() => async () => {
    setLoading(true);
    setError(null);
    try {
      // Récupère les 3 derniers mois
      const now = new Date();
      const startMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const start = startMonth.toISOString().slice(0, 10);
      const end = endMonth.toISOString().slice(0, 10);
      
      const res = await apiService.services.getAll({ start, end });
      const data = res.data?.data || res.data || [];
      setServiceAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erreur lors du chargement des fréquentations cultes');
      setServiceAttendance([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Préparation des données pour LineChart (8 derniers dimanches)
  const chartData = React.useMemo(() => {
    if (!serviceAttendance || serviceAttendance.length === 0) return [];
    // Obtenir les 8 derniers dimanches distincts présents dans serviceAttendance
    const allDays = serviceAttendance.map(s => new Date(s.date).toISOString().slice(0, 10));
    const uniqueDays = [...new Set(allDays)];
    const sundaysStr = uniqueDays.sort().slice(-8);
    // Pour chaque date, agréger les présences selon le champ 'culte' (Culte 1, 2, 3)
    return sundaysStr.map(dateStr => {
      const entry = { date: new Date(dateStr).toLocaleDateString('fr-FR') };
      ['Culte 1', 'Culte 2', 'Culte 3'].forEach((culteLabel, idx) => {
        const culte = serviceAttendance.find(s =>
          new Date(s.date).toISOString().slice(0, 10) === dateStr &&
          s.culte === culteLabel
        );
        entry[`culte${idx + 1}`] = culte ?
          (culte.total_adultes || 0)
          + (culte.total_enfants || 0)
          + (culte.total_chantres || 0)
          + (culte.total_protocoles || 0)
          + (culte.total_multimedia || 0)
          + (culte.total_respo_ecodim || 0)
          + (culte.total_animateurs_ecodim || 0)
          + (culte.total_enfants_ecodim || 0)
          : 0;
      });
      return entry;
    });
  }, [serviceAttendance]);

  // === NOUVEAU : données pour chaque culte (audience sans/avec serviteurs) ===
  const serviteursKeys = [
    'total_chantres',
    'total_protocoles',
    'total_multimedia',
    'total_respo_ecodim',
    'total_animateurs_ecodim',
  ];
  const makeAudienceData = (culteLabel) => {
    if (!serviceAttendance || serviceAttendance.length === 0) return [];
    const allDays = serviceAttendance.map(s => new Date(s.date).toISOString().slice(0, 10));
    const uniqueDays = [...new Set(allDays)];
    const sundaysStr = uniqueDays.sort().slice(-8);
    return sundaysStr.map(dateStr => {
      const entry = { date: new Date(dateStr).toLocaleDateString('fr-FR') };
      const culte = serviceAttendance.find(s =>
        new Date(s.date).toISOString().slice(0, 10) === dateStr &&
        s.culte === culteLabel
      );
      // Effectif total (avec serviteurs)
      const audienceAvecServiteurs = culte
        ? (culte.total_adultes || 0)
          + (culte.total_enfants || 0)
          + (culte.total_chantres || 0)
          + (culte.total_protocoles || 0)
          + (culte.total_multimedia || 0)
          + (culte.total_respo_ecodim || 0)
          + (culte.total_animateurs_ecodim || 0)
          + (culte.total_enfants_ecodim || 0)
        : 0;
      // Effectif sans les serviteurs
      const totalServiteurs = culte
        ? serviteursKeys.reduce((sum, key) => sum + (culte[key] || 0), 0)
        : 0;
      const audienceSansServiteurs = audienceAvecServiteurs - totalServiteurs;
      entry.audienceSansServiteurs = audienceSansServiteurs;
      entry.audienceAvecServiteurs = audienceAvecServiteurs;
      return entry;
    });
  };
  const chartDataCulte1 = React.useMemo(() => makeAudienceData('Culte 1'), [serviceAttendance, makeAudienceData]);
  const chartDataCulte2 = React.useMemo(() => makeAudienceData('Culte 2'), [serviceAttendance, makeAudienceData]);
  const chartDataCulte3 = React.useMemo(() => makeAudienceData('Culte 3'), [serviceAttendance, makeAudienceData]);


  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>Statistiques Cultes</Typography>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Paper data-aos="fade-up" sx={{ p: 3, height: 520, minWidth: 0, overflowX: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>
            Fréquentation des cultes par culte (8 derniers dimanches)
          </Typography>
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={440}>
              <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="culte1" stroke={COLORS[0]} strokeWidth={2} dot={true} name="Culte 1" />
                <Line type="monotone" dataKey="culte2" stroke={COLORS[1]} strokeWidth={2} dot={true} name="Culte 2" />
                <Line type="monotone" dataKey="culte3" stroke={COLORS[2]} strokeWidth={2} dot={true} name="Culte 3" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}
      {/* Diagramme Culte 1 */}
      <Paper sx={{ p: 3, mt: 4, backgroundColor: '#f9f9f9' }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>Audience - Culte 1</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartDataCulte1}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="audienceSansServiteurs" stroke="#1976d2" strokeWidth={2} dot={true} name="Audience, à l'exception des serviteurs" />
            <Line type="monotone" dataKey="audienceAvecServiteurs" stroke="#43a047" strokeWidth={2} dot={true} name="Audience, avec les serviteurs" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
      {/* Diagramme Culte 2 */}
      <Paper sx={{ p: 3, mt: 4, backgroundColor: '#f9f9f9' }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>Audience - Culte 2</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartDataCulte2}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="audienceSansServiteurs" stroke="#1976d2" strokeWidth={2} dot={true} name="Audience, à l'exception des serviteurs" />
            <Line type="monotone" dataKey="audienceAvecServiteurs" stroke="#43a047" strokeWidth={2} dot={true} name="Audience, avec les serviteurs" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
      {/* Diagramme Culte 3 */}
      <Paper sx={{ p: 3, mt: 4, backgroundColor: '#f9f9f9' }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>Audience - Culte 3</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartDataCulte3}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="audienceSansServiteurs" stroke="#1976d2" strokeWidth={2} dot={true} name="Audience, à l'exception des serviteurs" />
            <Line type="monotone" dataKey="audienceAvecServiteurs" stroke="#43a047" strokeWidth={2} dot={true} name="Audience, avec les serviteurs" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default StatsCultes;
