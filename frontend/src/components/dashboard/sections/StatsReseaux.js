import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Box, Grid, Paper, CircularProgress } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { transformStackedBarData, computeGrowthData } from './StatsReseauxHelpers';
import { apiService } from '../../../services/apiService';

const COLORS = [
  '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
  '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
  '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
  '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080',
  '#ffffff', '#000000', '#a28ef5', '#ffb6b9', '#00c49f',
  '#0088fe', '#ffc658', '#ff8042', '#7b68ee', '#f0e130'
];

const StatsReseaux = () => {
  const [networkStats, setNetworkStats] = useState([]); // PieChart
  const [networkEvolution, setNetworkEvolution] = useState([]); // LineChart
  const [networkYearCompare, setNetworkYearCompare] = useState([]); // BarChart
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stackedData, setStackedData] = useState([]); // Pour le stacked bar chart

  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('StatsReseaux: Début du chargement des données');
      
      // 1. Effectif par réseau
      console.log('StatsReseaux: Chargement des stats réseaux...');
      const resNetwork = await apiService.stats.getNetworks();
      const dataNetwork = resNetwork.data?.data || resNetwork.data || [];
      setNetworkStats(
        dataNetwork.map(n => ({ name: n.nom, value: n.memberCount || 0 }))
      );
      console.log('StatsReseaux: Stats réseaux chargées', dataNetwork);
      
      // 2. Evolution membres réseaux
      console.log('StatsReseaux: Chargement de l\'évolution...');
      const resEvolution = await apiService.stats.getNetworksEvolution();
      const dataEvolution = resEvolution.data?.data || resEvolution.data || [];
      setNetworkEvolution(Array.isArray(dataEvolution) ? dataEvolution : []);
      console.log('StatsReseaux: Évolution chargée', dataEvolution);
      
      // 3. Comparaison annuelle réseaux
      console.log('StatsReseaux: Chargement de la comparaison annuelle...');
      const resCompare = await apiService.stats.getNetworksComparison(`${lastYear},${currentYear}`);
      const dataCompare = resCompare.data?.data || resCompare.data || [];
      setNetworkYearCompare(Array.isArray(dataCompare) ? dataCompare : []);
      console.log('StatsReseaux: Comparaison annuelle chargée', dataCompare);
      
      // 4. Graphe supplémentaire : Répartition par genre dans chaque réseau (si dispo)
      // 4a. Composition membres par catégorie (pour stacked bar)
      try {
        console.log('StatsReseaux: Chargement des stats qualification...');
        const resCategories = await apiService.networks.getQualificationStats();
        const dataCategories = resCategories.data?.data || resCategories.data || [];
        setStackedData(Array.isArray(dataCategories) ? dataCategories : []);
        console.log('StatsReseaux: Stats qualification chargées', dataCategories);
      } catch (err) {
        console.log('StatsReseaux: Erreur stats qualification (non critique)', err);
        setStackedData([]);
      }
      
      console.log('StatsReseaux: Toutes les données chargées avec succès');
    } catch (err) {
      console.error('StatsReseaux: Erreur lors du chargement', err);
      setError('Erreur lors du chargement des statistiques réseaux');
      setNetworkStats([]);
      setNetworkEvolution([]);
      setNetworkYearCompare([]);
      setStackedData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>Statistiques Réseaux</Typography>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid >
          {/* PieChart - Effectif par réseau */}
          <Grid data-aos="fade-up" item xs={12} sx={{ mt: 0 }}>
            <Paper sx={{ p: 3, backgroundColor: '#f9f9f9', overflowX: 'auto' }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>Effectif par réseau</Typography>
              <ResponsiveContainer width="100%" height={600}>
                <PieChart>
                  <Pie
                    data={networkStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={250}
                    label={({ name, value }) => {
                      const total = networkStats.reduce((sum, n) => sum + n.value, 0);
                      const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                      return `${name}: ${value} (${percent}%)`;
                    }}
                  >
                    {networkStats.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ bgcolor: '#f9f9f9', borderRadius: 2, border: '1px solid #e0e0e0', p: 4 }}>
                {(() => {
                  const date = new Date();
                  const mois = date.toLocaleString('fr-FR', { month: 'long' });
                  const annee = date.getFullYear();
                  const jour = date.getDate();
                  const total = networkStats.reduce((sum, n) => sum + (n.value || 0), 0);
                  const sorted = [...networkStats].sort((a, b) => (b.value || 0) - (a.value || 0));
                  const plusGrand = sorted[0];
                  const second = sorted[1];
                  const debutMois = new Date(date.getFullYear(), date.getMonth(), 1);
                  const reseauxNouveaux = networkStats.filter(n => {
                    if (!n.createdAt) return false;
                    const d = new Date(n.createdAt);
                    return d >= debutMois;
                  });
                  return (
                    <Typography sx={{ fontSize: 18, color: '#444', fontStyle: 'italic', textAlign: 'center' }}>
                      {"À la date du "}
                      <Box component="span" fontWeight="bold" color="primary.main">{`${jour} ${mois} ${annee}`}</Box>
                      {", l'effectif total des membres des différents réseaux est de "}
                      <Box component="span" fontWeight="bold" color="primary.main">{total}</Box>
                      <Box component="span" fontWeight="bold" color="primary.main">{" personnes."}</Box>
                      {plusGrand && (
                        <>
                          {" Le plus grand réseau est "}
                          <Box component="span" fontWeight="bold" color="primary.main">{` « ${plusGrand.name} »`}</Box>
                          {" avec "}
                          <Box component="span" fontWeight="bold" color="primary.main">{plusGrand.value}</Box>
                          <Box component="span" fontWeight="bold" color="primary.main">{" membres"}</Box>
                          {second && (
                            <>
                              {", suivi du réseau "}
                              <Box component="span" fontWeight="bold" color="primary.main">{` « ${second.name} »`}</Box>
                              {" ("}
                              <Box component="span" fontWeight="bold" color="primary.main">{second.value}</Box>
                              <Box component="span" fontWeight="bold" color="primary.main">{" membres"}</Box>
                              {")"}
                            </>
                          )}
                          {"."}
                        </>
                      )}
                      {reseauxNouveaux.length > 0 && (
                        <>
                          {" "}
                          {reseauxNouveaux.length === 1 ? (
                            <>
                              {"En "}
                              <Box component="span" fontWeight="bold" color="primary.main">{`${mois} ${annee}`}</Box>
                              {", le réseau "}
                              <Box component="span" fontWeight="bold" color="primary.main">{` « ${reseauxNouveaux[0].name} »`}</Box>
                              {" a vu le jour."}
                            </>
                          ) : (
                            <>
                              {"En "}
                              <Box component="span" fontWeight="bold" color="primary.main">{`${mois} ${annee}`}</Box>
                              {", les réseaux "}
                              <Box component="span" fontWeight="bold" color="primary.main">{reseauxNouveaux.map(r => `« ${r.name} »`).join(', ')}</Box>
                              {" ont vu le jour."}
                            </>
                          )}
                        </>
                      )}
                    </Typography>
                  );
                })()}
              </Box>
            </Paper>
          </Grid>
          {/* LineChart - Evolution membres réseaux */}
          <Grid data-aos="fade-up" item xs={12} sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, height: 520, minWidth: 0, overflowX: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>Évolution mensuelle des membres par réseau</Typography>
              <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={440}>
                  <LineChart data={networkEvolution} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip />
                    <Legend />
                    {networkEvolution.length > 0 && Object.keys(networkEvolution[0]).filter(k => k !== 'month').map((key, idx) => (
                      <Line key={key} type="monotone" dataKey={key} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          {/* BarChart - Comparaison de l'évolution des réseaux (3 derniers mois) */}
          <Grid data-aos="fade-up" item xs={12} sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, minHeight: 320, backgroundColor: '#f9f9f9', overflowX: 'auto' }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>
                Comparaison de l'évolution des réseaux (3 derniers mois)
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={(() => {
                  if (!networkEvolution || networkEvolution.length === 0) return [];
                  const last3 = networkEvolution.slice(-3);
                  const networks = Object.keys(last3[0] || {}).filter(k => k !== 'month');
                  return networks.map(network => {
                    const obj = { network };
                    last3.forEach((row, idx) => {
                      const mois = new Date(row.month + '-01').toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
                      obj[mois] = row[network] || 0;
                    });
                    return obj;
                  });
                })()} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <RechartsTooltip />
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="network" />
                  <YAxis allowDecimals={false} />
                  <Legend />
                  {/* Générer dynamiquement les Bar pour chaque mois */}
                  {(() => {
                    if (!networkEvolution || networkEvolution.length === 0) return null;
                    const last3 = networkEvolution.slice(-3);
                    return last3.map((row, idx) => {
                      const mois = new Date(row.month + '-01').toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
                      const colors = ["#8884d8", "#82ca9d", "#ffc658"];
                      return (
                        <Bar
                          key={mois}
                          dataKey={mois}
                          fill={colors[idx % colors.length]}
                          name={mois.charAt(0).toUpperCase() + mois.slice(1)}
                          activeBar={false}
                        />
                      );
                    });
                  })()}
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Stacked Bar Chart - Composition interne des réseaux */}
          {stackedData && stackedData.length > 0 && (
            <Grid data-aos="fade-up" item xs={12} sx={{ mt: 4 }}>
              <Paper sx={{ p: 3, minHeight: 320, backgroundColor: '#f9f9f9', overflowX: 'auto' }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>
                  Composition interne des réseaux (par qualification de membres)
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stackedData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip />
                    <Legend />
                    {/* Générer dynamiquement les Bar pour chaque catégorie */}
                    {(() => {
                      // Récupère toutes les catégories présentes dans tous les réseaux
                      const allCategories = Array.from(
                        new Set(stackedData.flatMap(obj => Object.keys(obj).filter(k => k !== 'name')))
                      );
                      return allCategories.map((cat, idx) => (
                        <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[idx % COLORS.length]} name={cat} />
                      ));
                    })()}

                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          )}
          {/* Bar/Line Chart - Taux de croissance (%) */}
          {console.log("networkEvolution", networkEvolution)}
          {networkEvolution && networkEvolution.length > 1 && (
            <Grid data-aos="fade-up" item xs={12} sx={{ mt: 4 }}>
              <Paper sx={{ p: 3, minHeight: 320, backgroundColor: '#f9f9f9', overflowX: 'auto' }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>
                  Taux de croissance (%) par réseau (mois courant vs précédent)
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={computeGrowthData(networkEvolution)} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} tickFormatter={v => v + '%'} />
                    <RechartsTooltip formatter={(value) => value !== null ? value + '%' : 'N/A'} />
                    <Legend />
                    <Bar dataKey="croissance" fill="#82ca9d" name="Croissance (%)" />
                  </BarChart>
                </ResponsiveContainer>
                {/* Interpretation Box for Growth Rate */}
                <Box sx={{ bgcolor: '#f9f9f9', borderRadius: 2, border: '1px solid #e0e0e0', p: 4, mt: 3 }}>
                  {(() => {
                    const growthData = computeGrowthData(networkEvolution);
                    if (!growthData.length) return null;
                    const growing = growthData.filter(n => typeof n.croissance === 'number' && n.croissance > 0);
                    const declining = growthData.filter(n => typeof n.croissance === 'number' && n.croissance < 0);
                    const stagnant = growthData.filter(n => n.croissance === 0);
                    const newOnes = growthData.filter(n => n.croissance === 'Nouveau');
                    return (
                      <Typography sx={{ fontSize: 18, color: '#444', fontStyle: 'italic', textAlign: 'center' }}>
                        {growing.length > 0 && (
                          <>
                            <Box component="span" fontWeight="bold" color="success.main">
                              Réseaux en croissance : {growing.map(n => `« ${n.name} » (+${n.croissance}%)`).join(', ')}
                            </Box>.<br />
                          </>
                        )}
                        {declining.length > 0 && (
                          <>
                            <Box component="span" fontWeight="bold" color="error.main">
                              Réseaux en baisse : {declining.map(n => `« ${n.name} » (${n.croissance}%)`).join(', ')}
                            </Box>.<br />
                          </>
                        )}
                        {stagnant.length > 0 && (
                          <>
                            <Box component="span" fontWeight="bold" color="warning.main">
                              Réseaux stables : {stagnant.map(n => `« ${n.name} »`).join(', ')}
                            </Box>.<br />
                          </>
                        )}
                        {newOnes.length > 0 && (
                          <>
                            <Box component="span" fontWeight="bold" color="info.main">
                              Nouveaux réseaux : {newOnes.map(n => `« ${n.name} »`).join(', ')}
                            </Box>.<br />
                          </>
                        )}
                        {(growing.length === 0 && declining.length === 0 && stagnant.length === 0 && newOnes.length === 0) && (
                          <>Pas de changement significatif ce mois-ci.</>
                        )}
                      </Typography>
                    );
                  })()}
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default StatsReseaux;
