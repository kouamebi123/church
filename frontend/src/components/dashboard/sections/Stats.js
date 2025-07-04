import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid, CircularProgress, Paper } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line } from 'recharts';
import ErrorMessage from '../../../components/ErrorMessage';
import { apiService } from '../../../services/apiService';

const COLORS = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
    '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
    '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
    '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080',
    '#ffffff', '#000000', '#a28ef5', '#ffb6b9', '#00c49f',
    '#0088fe', '#ffc658', '#ff8042', '#7b68ee', '#f0e130'
];

const Stats = () => {
    const [stats, setStats] = useState({});
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState(null);
    
    // États pour les stats graphiques
    const [networkStats, setNetworkStats] = useState([]); // Pour PieChart
    const [networkEvolution, setNetworkEvolution] = useState([]); // Pour LineChart
    const [serviceAttendance, setServiceAttendance] = useState([]); // Pour BarChart
    const [networkYearCompare, setNetworkYearCompare] = useState([]); // Pour BarChart comparaison annuelle

    // Charger les statistiques globales
    useEffect(() => {
        const fetchGlobalStats = async () => {
            try {
                const res = await apiService.stats.getOverview();
                setStats(res.data?.data || res.data || {});
            } catch (err) {
                // Optionnel : afficher une erreur si besoin
            } finally {
                setStatsLoading(false);
            }
        };
        fetchGlobalStats();
    }, []);

    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    // Fonction pour charger les statistiques
    const loadStats = async () => {
        try {
            setStatsLoading(true);
            setStatsError(null);

            // 1. Stats réseaux (PieChart)
            const resNetwork = await apiService.stats.getNetworks();
            const dataNetwork = resNetwork.data?.data || resNetwork.data || [];
            setNetworkStats(
                dataNetwork.map(n => ({ name: n.nom, value: n.memberCount || 0 }))
            );

            // 2. Evolution membres réseaux (LineChart)
            const resEvolution = await apiService.stats.getNetworksEvolution();
            const dataEvolution = resEvolution.data?.data || resEvolution.data || [];
            setNetworkEvolution(dataEvolution);

            // 3. Fréquentation cultes (LineChart, 8 derniers dimanches)
            const now = new Date();
            const startMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const start = startMonth.toISOString().slice(0, 10);
            const end = endMonth.toISOString().slice(0, 10);
            
            const resAttendance = await apiService.services.getAll({ start, end });
            const dataAttendance = resAttendance.data?.data || resAttendance.data || [];
            setServiceAttendance(dataAttendance);

            // 4. Comparaison annuelle réseaux
            try {
                const resCompare = await apiService.stats.getNetworksComparison(`${lastYear},${currentYear}`);
                const dataCompare = resCompare.data?.data || resCompare.data || [];
                setNetworkYearCompare(dataCompare);
            } catch (err) {
                setNetworkYearCompare([]);
            }

            setStatsLoading(false);
        } catch (err) {
            setStatsError('Erreur lors du chargement des statistiques');
            setStatsLoading(false);
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
                    Vue d'ensemble
                </Typography>
                <Grid data-aos="fade-up" container spacing={2} sx={{ mb: 3 }}>
                    {[
                        { value: stats.total_all, label: 'Membres' },
                        { value: stats.total_reseaux, label: 'Réseaux' },
                        { value: stats.total_gr, label: 'GR' },
                        { value: stats.total_resp_reseaux, label: 'Responsables Réseau' },
                        { value: stats.total_resp_gr, label: 'Responsables GR' },
                        { value: stats.total_leaders, label: 'Leaders' },
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
                    <ErrorMessage error={statsError} />
                ) : (
                    <Grid data-aos="fade-up" container spacing={1} sx={{ display: 'block' }} >
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
                                </Box>
                            </Paper>
                        </Grid>

                        {/* LineChart - Evolution membres réseaux */}
                        <Grid data-aos="fade-up" item xs={12} md={8} sx={{ minWidth: 400, mt: 3 }} >
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
                        {/* BarChart - Comparaison réseaux sur les 3 derniers mois */}
                        <Grid data-aos="fade-up" item xs={12} md={8} sx={{ minWidth: 400, mt: 3 }}>
                            <Paper sx={{ p: 3, minHeight: 320, backgroundColor: '#f9f9f9' }}>
                                <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>
                                    Comparaison de l'évolution des réseaux (3 derniers mois)
                                </Typography>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={(() => {
                                        // networkEvolution = [{ month: '2025-02', R1: 10, R2: 15, ... }, ...]
                                        if (!networkEvolution || networkEvolution.length === 0) return [];
                                        // Prendre les 3 derniers mois
                                        const last3 = networkEvolution.slice(-3);
                                        // Obtenir la liste des réseaux (en-têtes, hors "month")
                                        const networks = Object.keys(last3[0] || {}).filter(k => k !== 'month');
                                        // Pour chaque réseau, construire un objet { network: 'Réseau', mois1: x, mois2: y, mois3: z }
                                        return networks.map(network => {
                                            const obj = { network };
                                            last3.forEach((row, idx) => {
                                                // Format mois court FR
                                                const mois = new Date(row.month + '-01').toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
                                                obj[mois] = row[network] || 0;
                                            });
                                            return obj;
                                        });
                                    })()}>
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
                        {/* BarChart - Fréquentation cultes */}
                        <Grid data-aos="fade-up" item xs={12} md={12} sx={{ minWidth: 400, mt: 3 }}>
                            <Paper sx={{ p: 3, height: 520, minWidth: 0, overflowX: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
                                <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>
                                    Fréquentation des cultes par culte (8 derniers dimanches)
                                </Typography>
                                <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ResponsiveContainer width="100%" height={440}>
                                        <LineChart data={(() => {
                                            // Préparer les 8 derniers dimanches distincts présents dans serviceAttendance (sur le jour uniquement)
                                            const allDays = serviceAttendance.map(s => new Date(s.date).toISOString().slice(0, 10));
                                            //console.log('allDays:', allDays);
                                            const uniqueDays = [...new Set(allDays)];
                                            const sundaysStr = uniqueDays.sort().slice(-8);
                                            const grouped = sundaysStr.map(dateStr => {
                                                const entry = { date: new Date(dateStr).toLocaleDateString('fr-FR') };
                                                ['Culte 1', 'Culte 2', 'Culte 3'].forEach((culteLabel, idx) => {
                                                    const culte = serviceAttendance.find(s =>
                                                        new Date(s.date).toISOString().slice(0, 10) === dateStr &&
                                                        s.culte === culteLabel
                                                    );
                                                    entry[`culte${idx + 1}`] = culte ?
                                                        (culte.total_adultes || 0) +
                                                        (culte.total_enfants || 0) +
                                                        (culte.total_chantres || 0) +
                                                        (culte.total_protocoles || 0) +
                                                        (culte.total_multimedia || 0) +
                                                        (culte.total_respo_ecodim || 0) +
                                                        (culte.total_animateurs_ecodim || 0) +
                                                        (culte.total_enfants_ecodim || 0)
                                                        : 0;
                                                });
                                                return entry;
                                            });
                                            return grouped;
                                        })()} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis allowDecimals={false} interval={0} tickCount={10} />
                                            <RechartsTooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="culte1" stroke="#1976d2" name="Culte 1" strokeWidth={2} dot={true} />
                                            <Line type="monotone" dataKey="culte2" stroke="#FFBB28" name="Culte 2" strokeWidth={2} dot={true} />
                                            <Line type="monotone" dataKey="culte3" stroke="#43a047" name="Culte 3" strokeWidth={2} dot={true} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </Box>
    );
};


export default Stats;