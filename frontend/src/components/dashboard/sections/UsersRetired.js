import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';

const UsersRetired = () => {
  const [retired, setRetired] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRetired = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/retired`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRetired(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRetired();
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>Membres Retirés</Typography>
      </Box>
      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : retired.length === 0 ? (
        <Typography>Aucun membre retiré trouvé.</Typography>
      ) : (
        <TableContainer  data-aos="fade-up" component={Paper} sx={{ mt: 2, boxShadow: 3, borderRadius: 2 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Pseudo</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Qualification</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Groupe quitté</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Réseau</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Date de sortie</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {retired.map((item, idx) => (
                <TableRow key={item.user._id} sx={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : '#fff', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <TableCell>{item.user.username}</TableCell>
                  <TableCell>{item.user.pseudo}</TableCell>
                  <TableCell>{item.user.qualification}</TableCell>
                  <TableCell>{item.group?.nom || '-'}</TableCell>
                  <TableCell>{item.network?.nom || '-'}</TableCell>
                  <TableCell>{item.leftAt ? new Date(item.leftAt).toLocaleDateString() : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default UsersRetired;
