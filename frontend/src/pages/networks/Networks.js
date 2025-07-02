import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Grid,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { apiService } from '../../services/apiService';
import { useSelector } from 'react-redux';

const NetworkCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4]
  }
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none'
  }
}));

const Networks = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    const fetchNetworks = async () => {
      try {
        let response;
        if (user?.role === 'admin' || user?.role === 'super-admin') {
          response = await apiService.networks.getAll(selectedChurch ? { churchId: selectedChurch } : {});
        } else if (user?.eglise_locale) {
          response = await apiService.networks.getAll({ churchId: user.eglise_locale });
        } else {
          response = await apiService.networks.getAll();
        }
        const networksData = response.data?.data || response.data || [];

        // Pour chaque réseau, récupérer ses stats via le bon endpoint
        const statsPromises = networksData.map(async (network) => {
          try {
            const statsRes = await apiService.networks.getStats(network._id);
            return { ...network, stats: statsRes.data };
          } catch (err) {
            // Si erreur, on garde le réseau sans stats
            return { ...network, stats: null };
          }
        });

        const networksWithStats = await Promise.all(statsPromises);

        // Transformer les données pour correspondre au format attendu
        console.log(networksWithStats);
        const transformedNetworks = networksWithStats.map(network => {
          const d = network.stats?.data ?? {};
          return {
            id: network._id,
            nom: network.nom,
            responsables: network.responsable2?.username
              ? `${network.responsable1?.username?.split(' ')[0]} & ${network.responsable2?.username?.split(' ')[0]}`
              : network.responsable1?.username?.split(' ')[0],
            nb_gr: d.totalGroups ?? 0,
            nb_12: d[12] ?? 0,
            nb_144: d[144] ?? 0,
            nb_1728: d[1728] ?? 0,
            nb_respo_gr: d["Responsables de GR"] ?? 0,
            nb_leader: d["Leader"] ?? 0,
            nb_membre: d["Membre simple"] ?? 0
          };
        });

        setNetworks(transformedNetworks);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNetworks();
  }, [user, selectedChurch]);

  const calculateTotal = (network) => {
    return (
      (network.nb_12 || 0) +
      (network.nb_144 || 0) +
      (network.nb_1728 || 0) +
      (network.nb_leader || 0) +
      (network.nb_membre || 0) +
      (network.responsables ? network.responsables.split('&').length : 0)
    );
  };

  if (loading) return <Loading titre="Chargement des données des réseaux" />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ mt: 0, mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, color: 'primary.main', fontWeight: 'bold' }}>
          Gestion des Réseaux
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
        <Grid container>
          {networks.map((network) => (
            <Grid data-aos="fade-up" sx={{
              width: '100%',
              padding: '10px 10px 10px 10px',
              '@media (min-width:700px) and (max-width:1099px)': { width: '50%', },
              '@media (min-width:1100px) and (max-width:1599px)': { width: '33.33%', },
              '@media (min-width:1600px)': { width: '25%' },
              flexBasis: 'unset',
              maxWidth: 'unset',
              flexGrow: 0,
              flexShrink: 0,
              height: '100%'
            }} key={network.id}>
              <NetworkCard elevation={2} >
                <Typography variant="h5" gutterBottom>
                  {network.nom}
                </Typography>

                <InfoRow>
                  <Typography variant="subtitle2">Responsable(s) :</Typography>
                  <Typography>{network.responsables || '-'}</Typography>
                </InfoRow>

                <InfoRow>
                  <Typography variant="subtitle2">GR :</Typography>
                  <Typography>{network.nb_gr}</Typography>
                </InfoRow>

                <InfoRow>
                  <Typography variant="subtitle2">12 :</Typography>
                  <Typography>{network.nb_12}</Typography>
                </InfoRow>

                <InfoRow>
                  <Typography variant="subtitle2">144 :</Typography>
                  <Typography>{network.nb_144}</Typography>
                </InfoRow>

                <InfoRow>
                  <Typography variant="subtitle2">1728 :</Typography>
                  <Typography>{network.nb_1728}</Typography>
                </InfoRow>

                <InfoRow>
                  <Typography variant="subtitle2">Responsable de GR :</Typography>
                  <Typography>{network.nb_respo_gr}</Typography>
                </InfoRow>

                <InfoRow>
                  <Typography variant="subtitle2">Leader :</Typography>
                  <Typography>{network.nb_leader}</Typography>
                </InfoRow>

                <InfoRow>
                  <Typography variant="subtitle2">Membre :</Typography>
                  <Typography>{network.nb_membre}</Typography>
                </InfoRow>

                <InfoRow>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'primary.main' }}>
                    Total : 
                  </Typography>
                  <Typography sx={{ fontWeight:'bold', fontSize: '1.1rem', color: 'primary.main' }}>{calculateTotal(network)}</Typography>
                </InfoRow>

                <Box sx={{ mt: 'auto', pt: 2 }}>
                  
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={() => navigate(`/networks/${network.id}`)}
                  >
                    Voir les détails
                  </Button>
                </Box>
              </NetworkCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Networks;
