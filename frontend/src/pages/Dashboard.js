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
  
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Menu as MenuIcon,
  People as PeopleIcon,
  AccountTree as NetworkIcon,
  Church as ChurchIcon,
  BarChart as StatsIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  GroupWork as GroupWorkIcon,
  Event as EventIcon,
  AccountTree as AccountTreeIcon,
  PeopleAlt as PeopleAltIcon,
  BusinessCenter as BusinessCenterIcon,
  Collections as CollectionsIcon,
  InsertChart as InsertChartIcon,
  ReplyAllOutlined as ReplyAllOutlinedIcon,
  LanOutlined as LanOutlinedIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import Stats from '../components/dashboard/sections/Stats';
import StatsReseaux from '../components/dashboard/sections/StatsReseaux';
import StatsCultes from '../components/dashboard/sections/StatsCultes';
import Networks from '../components/dashboard/sections/Networks';
import NetworksRecap from '../components/dashboard/sections/NetworksRecap';
import Carousel from '../components/dashboard/sections/Carousel';
import Membres from '../components/dashboard/sections/Membres';
import UsersRetired from '../components/dashboard/sections/UsersRetired';
import Churches from '../components/dashboard/sections/Churches';
import Departments from '../components/dashboard/sections/Departments';
import StatsMembres from '../components/dashboard/sections/StatsMembres';
import MissionImplantation from '../components/dashboard/sections/MissionImplantation';




// Constants
const drawerWidth = 275;




// Styled Components
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  overflowX: 'hidden',
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    overflowX: 'hidden',
  },
}));

const StyledListItem = styled(({ active, ...rest }) => <ListItem {...rest} />)(
  ({ theme, active }) => ({
    margin: '8px 16px',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: active ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    cursor: 'pointer',
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

  // Rendu conditionnel de la section active avec composants montés
  const renderSection = () => {
    return (
      <Box>
        <Box sx={{ display: activeSection === 'stats' ? 'block' : 'none' }}>
          <Stats />
        </Box>
        <Box sx={{ display: activeSection === 'statsReseaux' ? 'block' : 'none' }}>
          <StatsReseaux />
        </Box>
        <Box sx={{ display: activeSection === 'statsCultes' ? 'block' : 'none' }}>
          <StatsCultes />
        </Box>
        <Box sx={{ display: activeSection === 'statsMembres' ? 'block' : 'none' }}>
          <StatsMembres />
        </Box>
        <Box sx={{ display: activeSection === 'networks' ? 'block' : 'none' }}>
          <Networks />
        </Box>
        <Box sx={{ display: activeSection === 'networksRecap' ? 'block' : 'none' }}>
          <NetworksRecap />
        </Box>
        <Box sx={{ display: activeSection === 'carousel' ? 'block' : 'none' }}>
          <Carousel />
        </Box>
        <Box sx={{ display: activeSection === 'users' ? 'block' : 'none' }}>
          <Membres />
        </Box>
        <Box sx={{ display: activeSection === 'usersRetired' ? 'block' : 'none' }}>
          <UsersRetired />
        </Box>
        <Box sx={{ display: activeSection === 'churches' ? 'block' : 'none' }}>
          <Churches />
        </Box>
        <Box sx={{ display: activeSection === 'departments' ? 'block' : 'none' }}>
          <Departments />
        </Box>
        <Box sx={{ display: activeSection === 'missionImplantation' ? 'block' : 'none' }}>
          <MissionImplantation active={activeSection === 'missionImplantation'} />
        </Box>
      </Box>
    );
  };


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
    {
      text: 'Statistiques',
      icon: <InsertChartIcon />,
      children: [
        { id: 'stats', text: "Vue d'ensemble", icon: <BarChartIcon /> },
        { id: 'statsReseaux', text: "Réseaux", icon: <GroupWorkIcon /> },
        { id: 'statsCultes', text: "Cultes", icon: <EventIcon /> },
        { id: 'statsMembres', text: "Membres", icon: <PeopleIcon /> },
      ]
    },
    {
      text: 'Réseaux',
      icon: <AccountTreeIcon />,
      children: [
        { id: 'networks', text: 'Gestion des réseaux', icon: <AccountTreeIcon /> },
        { id: 'networksRecap', text: 'Récapitulatif des effectifs', icon: <PeopleAltIcon /> },
      ]
    },
    {
      text: 'Membres',
      icon: <PeopleIcon />,
      children: [
        { id: 'users', text: 'Gestion des membres', icon: <PeopleIcon /> },
        { id: 'usersRetired', text: 'Membres retirés', icon: <PeopleAltIcon /> },
      ]
    },
    {
      text: 'Mission et Implantation',
      icon: <MapIcon />,
      children: [
        { id: 'missionImplantation', text: 'Carte interactive', icon: <MapIcon /> },
      ]
    },
    {
      text: 'Configuration',
      icon: <SettingsIcon />,
      children: [
        { id: 'churches', text: 'Églises', icon: <ChurchIcon /> },
        { id: 'departments', text: 'Départements', icon: <BusinessCenterIcon /> },
        { id: 'carousel', text: 'Carousel', icon: <CollectionsIcon /> }
      ]
    }
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

  const [openMenu, setOpenMenu] = useState(null);

  const handleMenuClick = (item) => {
    if (item.children) {
      setOpenMenu((prev) => (prev === item.text ? null : item.text));
    } else {
      window.location.hash = item.id;
    }
  };
  const handleSubMenuClick = (subItem) => {
    window.location.hash = subItem.id;
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography
          variant="h4"
          noWrap
          sx={{ color: 'white', fontWeight: 'bold', letterSpacing: 2, py: 2, cursor: 'pointer' }}
          onClick={() => window.location.reload()}
        >
          Administration
        </Typography>
      </Toolbar>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.text || item.id}>
            <StyledListItem
              button
              active={activeSection === item.id ? 1 : 0}
              onClick={() => handleMenuClick(item)}
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
              {item.children && (
                <ExpandMoreIcon
                  sx={{
                    color: 'white',
                    marginLeft: 'auto',
                    marginRight: '9px',
                    transition: 'transform 0.2s',
                    transform: openMenu === item.text ? 'rotate(0deg)' : 'rotate(-90deg)'
                  }}
                />
              )}
            </StyledListItem>
            {item.children && (
              <Collapse in={openMenu === item.text} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((sub) => (
                    <StyledListItem
                      key={sub.id}
                      button
                      sx={{ pl: 4, background: activeSection === sub.id ? 'rgba(255,255,255,0.15)' : 'transparent' }}
                      active={activeSection === sub.id ? 1 : 0}
                      onClick={() => handleSubMenuClick(sub)}
                    >
                      <ListItemIcon>{sub.icon}</ListItemIcon>
                      <ListItemText
                        primary={sub.text}
                        sx={{ '& .MuiListItemText-primary': { color: 'white' } }}
                      />
                    </StyledListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
        <StyledListItem button onClick={() => navigate('/')}>
          <ListItemIcon>
            <ReplyAllOutlinedIcon />
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

  const dispatch = useDispatch();
  // navigate déjà déclaré plus haut

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

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
          <Typography sx={{ color: 'white', flexGrow: 1 }} variant="h6" noWrap>
            Tableau de bord
          </Typography>
          <IconButton
            color="inherit"
            edge="end"
            onClick={handleLogout}
            sx={{ ml: 2 }}
            title="Déconnexion"
          >
            <LogoutIcon />
          </IconButton>
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
        {renderSection()}
      </MainContent>
    </Box>
  );
};

export default Dashboard;
