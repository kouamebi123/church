import { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress, Paper } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line } from 'recharts';

const Stats = () => {

    // Palette étendue pour des couleurs bien distinctes
    const COLORS = [
        '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
  '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
  '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
  '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080',
  '#ffffff', '#000000', '#a28ef5', '#ffb6b9', '#00c49f',
  '#0088fe', '#ffc658', '#ff8042', '#7b68ee', '#f0e130'
    ];

    const [stats, setStats] = useState({});
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState(null);
    const API_URL = process.env.REACT_APP_API_URL + '/api';
    // États pour les stats graphiques
    const [networkStats, setNetworkStats] = useState([]); // Pour PieChart
    const [networkEvolution, setNetworkEvolution] = useState([]); // Pour LineChart
    const [serviceAttendance, setServiceAttendance] = useState([]); // Pour BarChart
    const [networkYearCompare, setNetworkYearCompare] = useState([]); // Pour BarChart comparaison annuelle

    // Charger les statistiques globales
    useEffect(() => {
        const fetchGlobalStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setStats(data);
            } catch (err) {
                // Optionnel : afficher une erreur si besoin
            }
        };
        fetchGlobalStats();
    }, [API_URL]);

    
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    // Fonction pour charger les statistiques
    const loadStats = async () => {
        // ...
        // Comparaison annuelle réseaux (année précédente vs année en cours)
        try {
            const token = localStorage.getItem('token');
            
            const resCompare = await fetch(`${API_URL}/stats/networks/evolution/compare?years=${lastYear},${currentYear}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dataCompare = await resCompare.json();
            console.log('Réponse brute comparaison annuelle:', dataCompare); // DEBUG
            if (!dataCompare || !dataCompare.data) {
                setStatsError('Erreur: Données de comparaison annuelle absentes ou invalides.');
                setNetworkYearCompare([]);
                return;
            }
            if (resCompare.ok && dataCompare.success) {
                setNetworkYearCompare(dataCompare.data);
            } else {
                setStatsError('Erreur lors de la récupération des données de comparaison annuelle.');
                setNetworkYearCompare([]);
            }
        } catch (err) {
            // Optionnel : afficher une erreur
        }

        try {
            setStatsLoading(true);
            setStatsError(null);
            const token = localStorage.getItem('token');
            // 1. Stats réseaux (PieChart)
            const resNetwork = await fetch(`${API_URL}/networks/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dataNetwork = await resNetwork.json();
            if (resNetwork.ok && dataNetwork.success) {
                setNetworkStats(
                    dataNetwork.data.map(n => ({ name: n.nom, value: n.memberCount || 0 }))
                );
            } else {
                throw new Error(dataNetwork.message || 'Erreur stats réseaux');
            }
            // 2. Evolution membres réseaux (LineChart)
            const resEvolution = await fetch(`${API_URL}/stats/networks/evolution`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dataEvolution = await resEvolution.json();
            if (resEvolution.ok && dataEvolution.success) {
                setNetworkEvolution(dataEvolution.data); // [{ month: '2025-01', Réseau1: 10, Réseau2: 20, ... }, ...]
            }
            // 3. Fréquentation cultes (BarChart)
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
            const start = firstDay.toISOString().slice(0, 10);
            const end = lastDay.toISOString().slice(0, 10);
            const resAttendance = await fetch(`${API_URL}/services/period?start=${start}&end=${end}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dataAttendance = await resAttendance.json();
            if (resAttendance.ok && dataAttendance.success) {
                setServiceAttendance(dataAttendance.data); // [{ date: '2025-03-02', adultes: 100, enfants: 30 }, ...]
            }
            setStatsLoading(false);
        } catch (err) {
            setStatsError('Erreur lors du chargement des statistiques');
            setStatsLoading(false);
            console.error(err);
        }
    };

    // Charger les données au démarrage
    useEffect(() => {
        loadStats();
    }, []);

    return (
        <Box>
            {/* Bloc stats globales */}
            <Box sx={{ mb: 6 }}>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                    Statistiques
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {[
                        { value: stats.total_all, label: 'Membres' },
                        { value: stats.total_reseaux, label: 'Réseaux' },
                        { value: stats.total_gr, label: 'GR' },
                        { value: stats.total_resp_reseaux, label: 'Responsables Réseau' },
                        { value: stats.total_resp_gr, label: 'Responsables GR' },
                        { value: stats.total_leaders_all, label: 'Leaders (tous)' },
                        { value: stats.total_reguliers, label: 'Réguliers' },
                        { value: stats.total_integration, label: 'En intégration' },
                        { value: stats.total_irreguliers, label: 'Irréguliers' },
                        { value: stats.total_gouvernance, label: 'Gouvernance' },
                        { value: stats.total_ecodim, label: 'Ecodim' },
                        { value: stats.total_resp_ecodim, label: 'Responsables Ecodim' },
                        { value: stats.total_personnes_isolees, label: 'Personnes isolées' }
                    ].map((item, idx) => (
                        <Grid item xs={6} sm={4} md={3} lg={2} key={idx}>
                            <Paper sx={{ p: 2, textAlign: 'center', minHeight: 80 }}>
                                <Typography color="text.secondary">{item.label}</Typography>
                                <Typography variant="h5">{item.value}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                
                {statsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
                ) : statsError ? (
                    <Typography color="error">{statsError}</Typography>
                ) : (
                    <Grid container spacing={1} sx={{ display: 'block' }} >
                        {/* PieChart - Répartition membres par réseau + Interprétation à droite */}
                        <Grid item xs={12} md={6} >
                            <Paper sx={{ p: 3, width: '100%', backgroundColor: '#f9f9f9', overflowX: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>Effectif par réseau</Typography>
                                <Box >
                                    <Box sx={{ flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center' }}>
                                        <ResponsiveContainer width="100%" height={600}>
                                            <PieChart>
                                                <Pie
                                                    data={networkStats}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={250}
                                                    label={(
                                                        ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                                            const RADIAN = Math.PI / 180;
                                                            const radius = innerRadius + (outerRadius - innerRadius) * 1.15;
                                                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                                            const value = networkStats[index]?.value || 0;
                                                            const total = networkStats.reduce((sum, n) => sum + (n.value || 0), 0);
                                                            const percentValue = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                                            return (
                                                                <text
                                                                    x={x}
                                                                    y={y}
                                                                    fill={COLORS[index % COLORS.length]}
                                                                    textAnchor={x > cx ? 'start' : 'end'}
                                                                    dominantBaseline="central"
                                                                    fontSize={16}
                                                                    fontWeight={600}
                                                                >
                                                                    {`${networkStats[index]?.name}: ${value} (${percentValue}%)`}
                                                                </text>
                                                            );
                                                        }
                                                    )}
                                                >
                                                    {networkStats.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Box>
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
        {", l’effectif total des membres des différents réseaux est de "}
        <Box component="span" fontWeight="bold" color="primary.main">{total}</Box>
        <Box component="span" fontWeight="bold" color="primary.main">{" personnes."}</Box>
        {plusGrand && (
          <>
            {" Le plus grand réseau est "}
            <Box component="span" fontWeight="bold" color="primary.main">{` « ${plusGrand.name} »`}</Box>
            {" avec "}
            <Box component="span" fontWeight="bold" color="primary.main">{plusGrand.value}</Box>
            <Box component="span" fontWeight="bold" color="primary.main">{" membres"}</Box>
            {second && (
              <>
                {", suivi du réseau "}
                <Box component="span" fontWeight="bold" color="primary.main">{` « ${second.name} »`}</Box>
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
                <Box component="span" fontWeight="bold" color="primary.main">{` « ${reseauxNouveaux[0].name} »`}</Box>
                {" a vu le jour."}
              </>
            ) : (
              <>
                {"En "}
                <Box component="span" fontWeight="bold" color="primary.main">{`${mois} ${annee}`}</Box>
                {", les réseaux "}
                <Box component="span" fontWeight="bold" color="primary.main">{reseauxNouveaux.map(r => `« ${r.name} »`).join(', ')}</Box>
                {" ont vu le jour."}
              </>
            )}
          </>
        )}
      </Typography>
    );
  })()}
</Box>
                                </Box>
                            </Paper>
                        </Grid>
                        
                        {/* LineChart - Evolution membres réseaux */}
                        <Grid item xs={12} md={8} sx={{ minWidth: 400, mt: 3}} >
                            <Paper sx={{ p: 3, height: 520, minWidth: 0, overflowX: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
                                <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>Évolution mensuelle des membres par réseau</Typography>
                                <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {(Array.isArray(networkEvolution) && networkEvolution.length > 0 && Object.keys(networkEvolution[0]).length > 1) ? (
                                        <ResponsiveContainer width="100%" height={440}>
                                            <LineChart data={networkEvolution} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis allowDecimals={false} />
                                                <RechartsTooltip />
                                                <Legend />
                                                {Object.keys(networkEvolution[0]).filter(k => k !== 'month').map((key, idx) => (
                                                    <Line key={key} type="monotone" dataKey={key} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} dot={false} />
                                                ))}
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <Typography sx={{ color: '#888', fontSize: 20, textAlign: 'center', width: '100%' }}>
                                            Aucune donnée disponible pour l'évolution mensuelle des membres.
                                        </Typography>
                                    )}
                                </Box>
                            </Paper>

                        </Grid>
                        {/* BarChart - Comparaison annuelle réseaux */}
                        <Grid item xs={12} md={8} sx={{ minWidth: 400, mt: 3 }}>
                            <Paper sx={{ p: 3, minHeight: 320, backgroundColor: '#f9f9f9' }}>
                                <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>
                                    Comparaison de l’évolution des réseaux ({lastYear} vs {currentYear})
                                </Typography>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={networkYearCompare}>
                                        <RechartsTooltip />
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="network" />
                                        <YAxis allowDecimals={false} />
                                        <Legend />
                                        <Bar dataKey={lastYear} fill="#8884d8" name={lastYear} activeBar={false} />
                                        <Bar dataKey={currentYear} fill="#82ca9d" name={currentYear} activeBar={false} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                        {/* BarChart - Fréquentation cultes 
                        <Grid item xs={12} md={12} sx={{ minWidth: 400, mt: 3 }}>
                            <Paper sx={{ p: 3, height: 520, minWidth: 0, overflowX: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
                                <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>Fréquentation des cultes (dimanches du mois précédent)</Typography>
                                <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ResponsiveContainer width="100%" height={440}>
                                        <BarChart data={serviceAttendance} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis allowDecimals={false} />
                                            <RechartsTooltip />
                                            <Legend />
                                            <Bar dataKey="adultes" fill="#1976d2" name="Adultes" />
                                            <Bar dataKey="enfants" fill="#FFBB28" name="Enfants" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Paper>
                        </Grid>*/}
                    </Grid>
                )}
            </Box>
        </Box>
    );
};


export default Stats;