import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import {
  Container,
  Grid,
  Typography,
  Paper,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import Carousel from '../components/Carousel';
import { AccountTree, SupervisorAccount, GroupWork, EmojiPeople, SentimentDissatisfied, AdminPanelSettings, People, ChildCare, PersonOff, Star, Diversity3, PersonAddAlt1, CoPresent } from '@mui/icons-material';
import axios from 'axios';
import Loading from '../components/Loading';

const API_URL = process.env.REACT_APP_API_URL + '/api';

const StatCard = styled(Paper)(({ theme, isTotal }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  backgroundColor: isTotal ? theme.palette.primary.main : 'white',
  color: isTotal ? 'white' : theme.palette.text.primary,
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
  }
}));

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2)
  },
  minHeight: 'calc(100vh - 64px - 100px)' // Hauteur de la navbar et du footer
}));

const IconWrapper = styled(Box)(({ theme, isTotal }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: isTotal ? 'white' : theme.palette.primary.main,
  color: isTotal ? theme.palette.primary.main : 'white',
  marginBottom: theme.spacing(2)
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  fontWeight: 'bold',
  color: theme.palette.text.primary
}));

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);

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

  if (!stats) return <Loading titre="Chargement des statistiques" />;

  const statsConfig = [
    { label: 'Gouvernance', value: stats.total_gouvernance, icon: AdminPanelSettings },
    { label: 'Total Réseaux', value: stats.total_reseaux, icon: AccountTree },
    { label: 'Responsables Réseaux', value: stats.total_resp_reseaux, icon: SupervisorAccount },
    { label: 'Total GR', value: stats.total_gr, icon: GroupWork },
    { label: 'Responsables GR', value: stats.total_resp_gr, icon: EmojiPeople },
    { label: 'Leaders', value: stats.total_leaders, icon: Star },
    { label: 'Membres Réguliers', value: stats.total_reguliers, icon: Diversity3 },
    { label: 'Membres en intégration', value: stats.total_integration, icon: PersonAddAlt1 },
    { label: 'Membres Irréguliers', value: stats.total_irreguliers, icon: SentimentDissatisfied },
    { label: 'Ecodim', value: stats.total_ecodim, icon: ChildCare },
    { label: 'Responsables Ecodim', value: stats.total_resp_ecodim, icon: CoPresent },
    { label: 'Personnes isolées', value: stats.total_personnes_isolees, icon: PersonOff }
  ];

  return (
    <Box>
      <Navbar />

      <Carousel />

      <StyledContainer maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold', color: 'primary.main' }}>
          Statistiques Générales
        </Typography>

        <Grid container spacing={3}>
          {statsConfig.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard sx={{ height: '100%',width:210 }}>
                <IconWrapper>
                  <stat.icon sx={{ fontSize: 30 }} />
                </IconWrapper>
                <StyledTypography variant="h6">
                  {stat.label}
                </StyledTypography>
                <StyledTypography variant="h4" color="primary">
                  {stat.value}
                </StyledTypography>
              </StatCard>
            </Grid>
          ))}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard isTotal sx={{ height: '100%',width:445 }}>
              <IconWrapper isTotal>
                <People sx={{ fontSize: 30, color: 'primary.main' }} />
              </IconWrapper>
              <StyledTypography variant="h6" sx={{ color: 'white' }}>
                Effectif Total
              </StyledTypography>
              <StyledTypography variant="h3" sx={{ color: 'white' }}>
                {stats.total_all}
              </StyledTypography>
            </StatCard>
          </Grid>
        </Grid>
      </StyledContainer>
    </Box>
  );
};

export default Home;
