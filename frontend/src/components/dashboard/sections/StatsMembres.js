import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Grid, CircularProgress, Box, Paper } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { format, subMonths } from 'date-fns';

import { TRANCHE_AGE_OPTIONS } from '../../../constants/enums';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#B455C6', '#FF6666', '#82ca9d', '#8884d8', '#ffc658', '#a4de6c', '#d0ed57'];

const StatsMembres = () => {
  const [users, setUsers] = useState([]);
  const [qualifStats, setQualifStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_API_URL + '/api';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Utilise la nouvelle route pour n'avoir que les membres non isolés
        const usersRes = await axios.get(`${API_URL}/users/non-isoles`, { headers: { 'Authorization': `Bearer ${token}` } });
        // Pour les stats par qualification, on peut recalculer côté front ou adapter le backend si besoin
        setUsers(usersRes.data.data || []);
        // Si tu veux calculer les stats qualification à partir des users non isolés :
        const qualifMap = {};
        (usersRes.data.data || []).forEach(u => {
          const q = u.qualification || 'Inconnu';
          qualifMap[q] = (qualifMap[q] || 0) + 1;
        });
        setQualifStats(Object.entries(qualifMap).map(([qualification, count]) => ({ qualification, count })));
      } catch (err) {
        setUsers([]);
        setQualifStats([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Pyramide des âges (par valeur exacte de tranche_age)
  const ageStats = TRANCHE_AGE_OPTIONS.map(opt => ({
    range: opt.label,
    count: users.filter(u => u.tranche_age === opt.value).length
  }));

  // 3. Pie chart genre
  const genreStats = ['Homme', 'Femme'].map(g => ({
    genre: g,
    value: users.filter(u => (u.genre || '').toLowerCase() === g.toLowerCase()).length
  }));

  // 4. Bar chart qualification (trié par ordre décroissant)
  const qualifBarStats = qualifStats
    .map(q => ({ qualification: q.qualification, count: q.count }))
    .sort((a, b) => b.count - a.count);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>Statistiques Membres</Typography>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid>
          {/* Répartition par qualification */}
          <Grid data-aos="fade-up" item xs={12} md={6} sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, backgroundColor: '#f9f9f9', overflowX: 'auto' }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>Répartition par qualification</Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={qualifBarStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="qualification" angle={-30} textAnchor="end" interval={0} height={80} />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          {/* Répartition par genre */}
          <Grid data-aos="fade-up" item xs={12} md={6} sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, backgroundColor: '#f9f9f9', overflowX: 'auto' }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>Répartition par genre</Typography>
              <ResponsiveContainer width="100%" height={500}>
                <PieChart>
                  <Pie
                    data={genreStats}
                    dataKey="value"
                    nameKey="genre"
                    cx="50%"
                    cy="50%"
                    outerRadius={200}
                    label={({ genre, value }) => {
                      const total = genreStats.reduce((sum, g) => sum + g.value, 0);
                      const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                      return `${genre}: ${value} (${percent}%)`;
                    }}
                  >
                    {genreStats.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Répartition par âge */}
          <Grid data-aos="fade-up" item xs={12} md={6} sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, backgroundColor: '#f9f9f9', overflowX: 'auto' }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>Répartition par âge</Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={ageStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          
        </Grid>
      )}
    </Box>
  );
};

export default StatsMembres;
