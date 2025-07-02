import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import {
  Container,
  Grid,
  Typography,
  Paper,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import Carousel from '../components/Carousel';
import { AccountTree, SupervisorAccount, GroupWork, EmojiPeople, SentimentDissatisfied, AdminPanelSettings, People, ChildCare, PersonOff, Star, Diversity3, PersonAddAlt1, CoPresent } from '@mui/icons-material';
import Loading from '../components/Loading';
import { apiService } from '../services/apiService';

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
  const [churches, setChurches] = useState([]);
  const [selectedChurch, setSelectedChurch] = useState('');

  useEffect(() => {
    const fetchChurches = async () => {
      try {
        const res = await apiService.churches.getAll();
        setChurches(res.data?.data || res.data || []);
      } catch (err) {
        setChurches([]);
      }
    };
    if (user?.role === 'admin' || user?.role === 'super-admin') {
      fetchChurches();
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let res;
        if (user?.role === 'admin' || user?.role === 'super-admin') {
          res = await apiService.stats.getOverview(selectedChurch ? { churchId: selectedChurch } : {});
        } else if (user?.eglise_locale) {
          res = await apiService.stats.getOverview({ churchId: user.eglise_locale });
        } else {
          res = await apiService.stats.getOverview();
        }
        setStats(res.data?.data || res.data || {});
      } catch (err) {
        console.error('Erreur lors de la récupération des stats', err);
      }
    };
    fetchStats();
  }, [user, selectedChurch]);

  if (!stats) return <Loading titre="Chargement des statistiques" />;

  const statsConfig = [
    { label: 'Gouvernance', value: stats.total_gouvernance, icon: AdminPanelSettings },
    { label: 'Total Réseaux', value: stats.total_reseaux, icon: AccountTree },
    { label: 'Responsables Réseaux', value: stats.total_resp_reseaux, icon: SupervisorAccount },
    { label: 'Total GR', value: stats.total_gr, icon: GroupWork },
    { label: 'Responsables GR', value: stats.total_resp_gr, icon: EmojiPeople },
    { label: 'Leaders', value: stats.total_leaders, icon: Star },
    { label: 'Leaders (Tous)', value: stats.total_leaders_all, icon: Star },
    { label: 'Membres Réguliers', value: stats.total_reguliers, icon: Diversity3 },
    { label: 'Membres en intégration', value: stats.total_integration, icon: PersonAddAlt1 },
    { label: 'Membres Irréguliers', value: stats.total_irreguliers, icon: SentimentDissatisfied },
    { label: 'Ecodim', value: stats.total_ecodim, icon: ChildCare },
    { label: 'Responsables Ecodim', value: stats.total_resp_ecodim, icon: CoPresent },
  ];

  return (
    <Box>
      <Navbar />

      <Carousel />

      <Box width="100%" textAlign="center">
        <Typography variant="h3" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold', color: 'primary.main' }}>
          Statistiques Générales
        </Typography>

        {(user?.role === 'admin' || user?.role === 'super-admin') && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel id="church-select-label">Filtrer par église</InputLabel>
              <Select
                labelId="church-select-label"
                value={selectedChurch}
                label="Filtrer par église"
                onChange={(e) => setSelectedChurch(e.target.value)}
              >
                <MenuItem value=""><em>Toutes les églises</em></MenuItem>
                {churches.map((church) => (
                  <MenuItem key={church._id} value={church._id}>{church.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        <Grid container width="92%" mx="auto">
          {statsConfig.map((stat, index) => (
            <Grid
              data-aos="fade-up"
              item
              key={index}
              sx={{
                width: '100%',
                padding: '10px 10px 10px 10px',
                '@media (min-width:460px) and (max-width:699px)': { width: '50%', height: '270px' },
                '@media (min-width:700px) and (max-width:1099px)': { width: '33.33%', height: '270px' },
                '@media (min-width:1100px) and (max-width:1199px)': { width: '25%', height: '270px' },
                '@media (min-width:1200px) and (max-width:1599px)': { width: '20%', height: '270px' },
                '@media (min-width:1600px)': { width: '20%' },
                flexBasis: 'unset',
                maxWidth: 'unset',
                flexGrow: 0,
                flexShrink: 0,
                height: '100%'
              }}
            >
              <StatCard sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
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
          <Grid
            data-aos="fade-up"
            item
            sx={{
              width: '100%',
              padding: '10px 10px 10px 10px',
              '@media (min-width:460px) and (max-width:699px)': { width: '50%', height: '270px' },
              '@media (min-width:700px) and (max-width:1099px)': { width: '33.33%', height: '270px' },
              '@media (min-width:1100px) and (max-width:1199px)': { width: '25%', height: '270px' },
              '@media (min-width:1200px) and (max-width:1599px)': { width: '20%', height: '270px' },
              '@media (min-width:1600px)': { width: '20%' },
              flexBasis: 'unset',
              maxWidth: 'unset',
              flexGrow: 0,
              flexShrink: 0,
              height: '100%'
            }}
          >
            <StatCard isTotal sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
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
      </Box>
    </Box>
  );
};

export default Home;
