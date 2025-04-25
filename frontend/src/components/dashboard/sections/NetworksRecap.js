import React, { useEffect, useState } from 'react';
import { Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL + '/api';

const NetworksRecap = () => {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNetworks = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/networks/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setNetworks(data.data);
        } else {
          setError(data.message || "Erreur lors du chargement des réseaux");
        }
      } catch (err) {
        setError("Erreur lors du chargement des réseaux");
      } finally {
        setLoading(false);
      }
    };
    fetchNetworks();
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>Récapitulatif des Réseaux</Typography>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer data-aos="fade-up" component={Paper} sx={{ mt: 2, boxShadow: 3, borderRadius: 2 }}>
          <Table sx={{ minWidth: 650 }} stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Nom du réseau</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Effectif total</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Nombre de 12</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Nombre de 144</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Nombre de GR</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Nombre de Resp. de GR</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {networks.map((n, idx) => (
                <TableRow
                  key={n.id || n.nom}
                  sx={{
                    backgroundColor: idx % 2 === 0 ? '#fafafa' : '#fff',
                    '&:hover': { backgroundColor: '#e3f2fd' },
                    borderBottom: '1px solid #e0e0e0',
                  }}
                >
                  <TableCell sx={{ py: 1, px: 2 }}>{n.nom}</TableCell>
                  <TableCell align="right" sx={{ py: 1, px: 2 }}>{n.memberCount}</TableCell>
                  <TableCell align="right" sx={{ py: 1, px: 2 }}>{n.qualifications?.filter(q => q === '12').length || 0}</TableCell>
                  <TableCell align="right" sx={{ py: 1, px: 2 }}>{n.qualifications?.filter(q => q === '144').length || 0}</TableCell>
                  <TableCell align="right" sx={{ py: 1, px: 2 }}>{n.groupCount}</TableCell>
                  <TableCell align="right" sx={{ py: 1, px: 2 }}>{n.groupResponsablesCount}</TableCell>
                </TableRow>
              ))}
              {/* Ligne Totaux */}
              {networks.length > 0 && (() => {
                const totals = networks.reduce((acc, n) => {
                  acc.memberCount += n.memberCount || 0;
                  acc.nb12 += n.qualifications?.filter(q => q === '12').length || 0;
                  acc.nb144 += n.qualifications?.filter(q => q === '144').length || 0;
                  acc.groupCount += n.groupCount || 0;
                  acc.groupResponsablesCount += n.groupResponsablesCount || 0;
                  return acc;
                }, { memberCount: 0, nb12: 0, nb144: 0, groupCount: 0, groupResponsablesCount: 0 });
                return (
                  <TableRow sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>
                    <TableCell sx={{ py: 1, px: 2, fontWeight: 'bold' }}>Totaux</TableCell>
                    <TableCell align="right" sx={{ py: 1, px: 2, fontWeight: 'bold' }}>{totals.memberCount}</TableCell>
                    <TableCell align="right" sx={{ py: 1, px: 2, fontWeight: 'bold' }}>{totals.nb12}</TableCell>
                    <TableCell align="right" sx={{ py: 1, px: 2, fontWeight: 'bold' }}>{totals.nb144}</TableCell>
                    <TableCell align="right" sx={{ py: 1, px: 2, fontWeight: 'bold' }}>{totals.groupCount}</TableCell>
                    <TableCell align="right" sx={{ py: 1, px: 2, fontWeight: 'bold' }}>{totals.groupResponsablesCount}</TableCell>
                  </TableRow>
                );
              })()}

            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default NetworksRecap;
