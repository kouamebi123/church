import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  AccountTree as NetworkIcon,
  Church as ChurchIcon,
  Business as DepartmentIcon,
  BarChart as StatsIcon,
  Image as ImageIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Overview from '../components/dashboard/sections/Overview';
import Stats from '../components/dashboard/sections/Stats';
import Networks from '../components/dashboard/sections/Networks';
import Carousel from '../components/dashboard/sections/Carousel';
import Membres from '../components/dashboard/sections/Membres';
import Churches from '../components/dashboard/sections/Churches';
import Departments from '../components/dashboard/sections/Departments';



// Constants
const drawerWidth = 240;




// Styled Components
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

const StyledListItem = styled(({ active, ...rest }) => <ListItem {...rest} />)(
  ({ theme, active }) => ({
    margin: '8px 16px',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: active ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.contrastText,
    },
  })
);


const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: 64,
  backgroundColor: '#f5f5f5',
  minHeight: '100vh',
}));

const Section = styled(Box)(({ theme }) => ({
  display: 'none',
  '&.active': {
    display: 'block',
  },
}));

const Dashboard = () => {
  // ...états existants


 

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('stats');


 
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_users: 0,
    total_reseaux: 0,
    total_gr: 0,
    total_responsables: 0,
    total_12: 0,
    total_144: 0,
    total_1728: 0,
    total_reguliers: 0,
    total_irreguliers: 0,
    total_en_integration: 0
  });

  // (déjà déclaré plus haut)



  const menuItems = [
    { id: 'stats', text: 'Statistiques', icon: <StatsIcon /> },
    { id: 'networks', text: 'Réseaux', icon: <NetworkIcon /> },
    { id: 'users', text: 'Membres', icon: <PeopleIcon /> },
    { id: 'churches', text: 'Églises', icon: <ChurchIcon /> },
    { id: 'departments', text: 'Départements', icon: <DepartmentIcon /> },
    { id: 'carousel', text: 'Carousel', icon: <ImageIcon /> },
  ];

  useEffect(() => {
    const loadAllData = async () => {
      
      try {
        await Promise.all([
          
        ]);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
      } finally {
        
      }
    };

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'stats';
      setActiveSection(hash);
    };

    loadAllData();
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ color: 'white' }}>
          Administration
        </Typography>
      </Toolbar>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
      <List>
        {menuItems.map((item) => (
          <StyledListItem 
            button 
            key={item.id} 
            active={activeSection === item.id ? 1 : 0}
            onClick={() => window.location.hash = item.id}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{
                '& .MuiListItemText-primary': {
                  color: 'white'
                }
              }}
            />
          </StyledListItem>
        ))}
        <StyledListItem button onClick={() => navigate('/')}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Retour au site"
            sx={{
              '& .MuiListItemText-primary': {
                color: 'white'
              }
            }}
          />
        </StyledListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography sx={{ color: 'white' }} variant="h6" noWrap>
            Tableau de bord
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <StyledDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' } }}
        >
          {drawer}
        </StyledDrawer>
        <StyledDrawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' } }}
          open
        >
          {drawer}
        </StyledDrawer>
      </Box>

      <MainContent>
        {/* Vue d'ensemble 
        <Section className={activeSection === 'overview' ? 'active' : ''}>
        <Stats />
        </Section>*/}

        {/* Statistiques */}
        <Section className={activeSection === 'stats' ? 'active' : ''}>
          <Stats />
        </Section>
        

        {/* Réseaux */}
        <Section className={activeSection === 'networks' ? 'active' : ''}>
          <Networks />
        </Section>

        {/* Carousel */}
        <Section className={activeSection === 'carousel' ? 'active' : ''}>
          <Carousel />
        </Section>

        {/* Membres */}
        <Section className={activeSection === 'users' ? 'active' : ''}>
          <Membres   />
        </Section>

        {/* Églises */}
        <Section className={activeSection === 'churches' ? 'active' : ''}>
          <Churches />
        </Section>

        {/* Départements */}
        <Section className={activeSection === 'departments' ? 'active' : ''}>
          <Departments />
        </Section>

        

      </MainContent>
      
    </Box>
  );
};

export default Dashboard;
