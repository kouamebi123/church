
import { Box, Typography, Grid, Card } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import NetworkIcon from '@mui/icons-material/NetworkCheck';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Overview = () => {

    const [stats, setStats] = useState({});

    const API_URL = process.env.REACT_APP_API_URL + '/api';

    useEffect(() => {
        const fetchStats = async () => {
          try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/stats`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
          } catch (err) {
            console.error('Erreur lors de la récupération des stats', err);
          }
        };
        fetchStats();
      }, []);

    return (

        <Box>
            <Typography variant="h4" gutterBottom>Vue d'ensemble</Typography>
            <Grid container spacing={3}>
                {[
                    { value: stats.total_all, label: 'Membres', icon: <PeopleIcon /> },
                    { value: stats.total_reseaux, label: 'Réseaux', icon: <NetworkIcon /> },
                    { value: stats.total_gr, label: 'GR', icon: <PeopleIcon /> },
                    { value: stats.total_resp_reseaux, label: 'Responsables Réseau', icon: <PeopleIcon /> },
                    { value: stats.total_resp_gr, label: 'Responsables GR', icon: <PeopleIcon /> },
                    { value: stats.total_leaders_all, label: 'Leaders (tous)', icon: <PeopleIcon /> },
                ].map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card sx={{ p: 2, textAlign: 'center' }}>
                            {item.icon}
                            <Typography variant="h4">{item.value}</Typography>
                            <Typography color="text.secondary">{item.label}</Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Statistiques détaillées
                </Typography>
                <Grid data-aos="fade-up" container spacing={3}>
                    {[
                        { label: 'Réguliers', value: stats.total_reguliers },
                        { label: 'En intégration', value: stats.total_integration },
                        { label: 'Irréguliers', value: stats.total_irreguliers },
                        { label: 'Leaders (tous)', value: stats.total_leaders_all },
                        { label: 'Responsables Réseau', value: stats.total_resp_reseaux },
                        { label: 'Responsables GR', value: stats.total_resp_gr },
                        { label: 'Membres (total)', value: stats.total_all },
                        { label: 'Réseaux', value: stats.total_reseaux },
                        { label: 'GR', value: stats.total_gr },
                    ].map((item, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Card sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h4">{item.value}</Typography>
                                <Typography color="text.secondary">{item.label}</Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default Overview;
