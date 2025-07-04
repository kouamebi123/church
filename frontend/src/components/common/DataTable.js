import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  error = null,
  searchable = true,
  pagination = true,
  actions = [],
  onSearch,
  onPageChange,
  onRowsPerPageChange,
  page = 0,
  rowsPerPage = 10,
  totalRows = 0,
  searchTerm = '',
  onSearchChange,
  emptyMessage = 'Aucune donnée disponible',
  ...props
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Filtrage local des données
  const filteredData = useMemo(() => {
    if (!searchable || !localSearchTerm) return data;
    
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(localSearchTerm.toLowerCase())
      )
    );
  }, [data, localSearchTerm, searchable]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setLocalSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handlePageChange = (event, newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const handleRowsPerPageChange = (event) => {
    if (onRowsPerPageChange) {
      onRowsPerPageChange(parseInt(event.target.value, 10));
    }
  };

  const renderCellValue = (value, column) => {
    if (column.render) {
      return column.render(value);
    }

    if (column.type === 'chip') {
      return (
        <Chip
          label={value}
          color={column.chipColor || 'default'}
          size="small"
          variant="outlined"
        />
      );
    }

    if (column.type === 'date') {
      return new Date(value).toLocaleDateString('fr-FR');
    }

    return value;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={2} {...props}>
      {searchable && (
        <Box p={2} borderBottom={1} borderColor="divider">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher..."
            value={localSearchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon color="action" />,
            }}
            size="small"
          />
        </Box>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || 'left'}
                  style={{ fontWeight: 'bold' }}
                >
                  {column.headerName}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell align="center" style={{ fontWeight: 'bold' }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} align="center">
                  <Typography variant="body2" color="textSecondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row, index) => (
                <TableRow key={row.id || row._id || index} hover>
                  {columns.map((column) => (
                    <TableCell key={column.field} align={column.align || 'left'}>
                      {renderCellValue(row[column.field], column)}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        {actions.map((action, actionIndex) => (
                          <Tooltip key={actionIndex} title={action.tooltip}>
                            <IconButton
                              size="small"
                              color={action.color || 'primary'}
                              onClick={() => action.onClick(row)}
                              disabled={action.disabled?.(row)}
                            >
                              {action.icon}
                            </IconButton>
                          </Tooltip>
                        ))}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          component="div"
          count={totalRows || filteredData.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
          }
        />
      )}
    </Paper>
  );
};

// Actions prédéfinies
export const tableActions = {
  view: (onClick) => ({
    icon: <ViewIcon />,
    tooltip: 'Voir',
    color: 'info',
    onClick
  }),
  edit: (onClick) => ({
    icon: <EditIcon />,
    tooltip: 'Modifier',
    color: 'primary',
    onClick
  }),
  delete: (onClick) => ({
    icon: <DeleteIcon />,
    tooltip: 'Supprimer',
    color: 'error',
    onClick
  })
};

export default DataTable; 