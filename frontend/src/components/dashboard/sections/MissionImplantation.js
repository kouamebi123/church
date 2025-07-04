import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Chip, Button, Divider } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { apiService } from '../../../services/apiService';
import Loading from '../../Loading';
import ErrorMessage from '../../ErrorMessage';
import { departementToRegion } from '../../../constants/departementToRegion';

// Correction pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icône personnalisée pour les églises (plus foncé)
const churchIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icône personnalisée pour les missions (vert standard)
const missionIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Composant pour centrer la carte sur la France
function CenterOnFrance() {
  const map = useMap();
  
  useEffect(() => {
    // Centrer sur la France avec un zoom approprié
    map.setView([46.603354, 1.888334], 6);
  }, [map]);
  
  return null;
}

// Fonction utilitaire pour colorer les zones
function getZoneColor(zoneName) {
  switch (zoneName) {
    case 'Zone Nord-Ouest': return '#4791db'; 
    case 'Zone Nord-Est': return '#e57373';
    case 'Zone Sud-Ouest': return '#ffeb3b'; 
    case 'Zone Sud-Est': return '#66bb6a';   
    case 'Zone Centre': return '#9e9e9e';     
    default: return '#e0e0e0';                
  }
}

// Fonction utilitaire pour foncer une couleur hex
function darkenColor(hex, percent) {
  let num = parseInt(hex.replace('#',''),16);
  let r = Math.floor((num >> 16) * percent);
  let g = Math.floor(((num >> 8) & 0x00FF) * percent);
  let b = Math.floor((num & 0x0000FF) * percent);
  return '#' + (r<<16 | g<<8 | b).toString(16).padStart(6, '0');
}

// Fonction utilitaire pour normaliser les chaînes (enlever accents, apostrophes, minuscules)
function normalize(str) {
  return str
    ? str.normalize('NFD').replace(/[ -\u036f]/g, '').replace(/’/g, "'").toLowerCase().trim()
    : '';
}

// Mapping département -> région (extrait de data officielle)


// Composant pour écouter le zoom et mettre à jour le state
function ZoomListener({ setZoom }) {
  useMapEvents({
    zoomend: (e) => {
      setZoom(e.target.getZoom());
    },
  });
  return null;
}

const MissionImplantation = ({ active }) => {
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const [zones, setZones] = useState([]);
  const [regionsGeoJson, setRegionsGeoJson] = useState(null);
  const [departementsGeoJson, setDepartementsGeoJson] = useState(null);
  const [zoom, setZoom] = useState(8); // Nouveau state pour le zoom
  const [hovered, setHovered] = useState(null);
  const [mapInstance, setMapInstance] = useState(null); // Pour stocker l'instance de la carte
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);


  // Coordonnées du centre de la France
  const center = [46.603354, 1.888334];

  // Coordonnées du centre de la zone Nord-Ouest
  const zoneNordOuestCenter = [48.5, -1.7]; // Exemple : centre Bretagne/Normandie, à ajuster si besoin
  const zoneNordOuestZoom = 7; // Zoom adapté à la zone

  useEffect(() => {
    if (!active) return;
    const fetchChurches = async () => {
      try {
        setLoading(true);
        const response = await apiService.churches.getAll();
        const churchesData = response.data?.data || response.data || [];
        const churchesWithCoords = churchesData.filter(church => 
          church.latitude && church.longitude
        );
        setChurches(churchesWithCoords);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des églises:', err);
        setError('Erreur lors du chargement des églises');
        setChurches([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChurches();
  }, [active]);

  useEffect(() => {
    fetch('/zones.json').then(res => res.json()).then(setZones);
    fetch('/regions.geojson').then(res => res.json()).then(setRegionsGeoJson);
    fetch('/departements.geojson').then(res => res.json()).then(setDepartementsGeoJson);
  }, []);

  // Initialiser le zoom après la création de la carte
  useEffect(() => {
    if (mapInstance) {
      setZoom(mapInstance.getZoom());
    }
  }, [mapInstance]);

  // Forcer un resize du navigateur après le montage pour déclencher le recalcul de la carte
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  // ResizeObserver pour recalculer la taille de la carte à chaque resize du conteneur
  useEffect(() => {
    if (!containerRef.current || !mapInstance) return;
    // Appel initial après un petit délai pour laisser le layout se stabiliser
    const t1 = setTimeout(() => mapInstance.invalidateSize(), 100);
    const t2 = setTimeout(() => mapInstance.invalidateSize(), 500);
    // Observer le resize du conteneur
    const observer = new window.ResizeObserver(() => {
      mapInstance.invalidateSize();
    });
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [mapInstance]);

  useEffect(() => {
    // On attend que le layout soit prêt avant de monter la carte
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleCenterOnFrance = () => {
    if (mapRef.current) {
      mapRef.current.setView([46.603354, 1.888334], 6);
    }
  };

  if (loading) {
    return <Loading titre="Chargement de la carte..." />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
          Mission et Implantation
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleCenterOnFrance}
            sx={{ minWidth: 120 }}
          >
            Centrer sur la France
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView(zoneNordOuestCenter, zoneNordOuestZoom);
              }
            }}
            sx={{ minWidth: 180 }}
          >
            Centrer sur Zone Nord-Ouest
          </Button>
        </Box>
      </Box>
      
      <Box
        ref={containerRef}
        sx={{
          height: '600px',
          width: '100%',
          minWidth: '300px',
          minHeight: '300px',
          mb: 3,
          border: '2px solid #ccc',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative',
          boxSizing: 'border-box'
        }}
      >
        {ready && (
          <MapContainer
            center={center}
            zoom={8}
            minZoom={5}
            maxZoom={12}
            style={{ height: '600px', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
            whenCreated={map => {
              mapRef.current = map;
              setMapInstance(map);
            }}
            ref={mapRef}
          >
            <ZoomListener setZoom={setZoom} />
            <CenterOnFrance />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {/* Affichage des régions si zoom <= 6 */}
            {zoom <= 6 && regionsGeoJson && zones.length > 0 && (
              <GeoJSON
                data={regionsGeoJson}
                style={feature => {
                  const zone = zones.find(z => z.regions.includes(feature.properties.nom));
                  const color = zone ? getZoneColor(zone.nom) : '#EEE';
                  return {
                    fillColor: hovered === feature.properties.nom ? darkenColor(color, 0.6) : color,
                    weight: 2,
                    color: '#333',
                    fillOpacity: 0.5,
                    cursor: 'pointer'
                  };
                }}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    mouseover: () => setHovered(feature.properties.nom),
                    mouseout: () => setHovered(null)
                  });
                  const zone = zones.find(z => z.regions.includes(feature.properties.nom));
                  layer.bindTooltip(`${feature.properties.nom} (${zone ? zone.nom : ''})`, {sticky: true});
                }}
              />
            )}
            {/* Affichage des contours des régions sous les départements */}
            {regionsGeoJson && (
              <GeoJSON
                data={regionsGeoJson}
                style={() => ({
                  fillOpacity: 0,
                  weight: 5,
                  color: '#000',
                  dashArray: '6,4',
                  pointerEvents: 'none',
                  zIndex: 1200
                })}
              />
            )}
            {/* Affichage des départements si zoom >= 7 */}
            {zoom >= 7 && departementsGeoJson && zones.length > 0 && (
              <>
                <GeoJSON
                  data={departementsGeoJson}
                  style={feature => {
                    // Trouver la région du département
                    const region = departementToRegion[feature.properties.nom];
                    const zone = zones.find(z => z.regions.includes(region));
                    const color = zone ? getZoneColor(zone.nom) : '#EEE';
                    return {
                      fillColor: hovered === feature.properties.nom ? darkenColor(color, 0.6) : color,
                      weight: 1,
                      color: '#333',
                      fillOpacity: 0.5,
                      cursor: 'pointer',
                    };
                  }}
                  onEachFeature={(feature, layer) => {
                    layer.on({
                      mouseover: () => setHovered(feature.properties.nom),
                      mouseout: () => setHovered(null)
                    });
                    // Afficher le nom du département et sa région
                    const region = departementToRegion[feature.properties.nom];
                    layer.bindTooltip(`${feature.properties.nom} (${region})`, {sticky: true});
                  }}
                />
                {/* Message si aucun polygone n'est visible */}
                {departementsGeoJson.features.length === 0 && (
                  <Typography color="error">Aucun polygone de département n'est visible (features vides)</Typography>
                )}
              </>
            )}
            {/* Marqueurs de toutes les églises, affichés à tous les niveaux */}
            {churches.length > 0 && churches.map((church) => (
              <Marker
                key={church._id}
                position={[parseFloat(church.latitude), parseFloat(church.longitude)]}
                icon={church.type === 'mission' ? missionIcon : churchIcon}
              >
                <Popup maxWidth={300}>
                  <Box sx={{ minWidth: 250, maxWidth: 300 }}>
                    {/* Image en haut de la popup */}
                    <Box sx={{ width: '100%', mb: 1, display: 'flex', justifyContent: 'center' }}>
                      <img
                        src={
                          process.env.REACT_APP_API_URL
                            ? `${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/${church.image}`.replace(/\\/g, '/')
                            : `/${church.image}`.replace(/\\/g, '/')
                        }
                        alt={church.nom}
                        style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'cover', border: '1px solid #ccc' }}
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = church.type === 'mission'
                            ? '/uploads/churches/default_mission.jpg'
                            : '/uploads/churches/default_eglise.jpg';
                        }}
                      />
                    </Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {church.nom}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
              
                      <Chip 
                        label={`Ville: ${church.ville || 'Non spécifiée'}`} 
                        color="primary" 
                        size="small"
                        sx={{ fontSize: '0.72rem' }}
                      />
                      <Chip 
                        label={`Population: ${church.population?.toLocaleString() || 'Non spécifiée'}`} 
                        color="secondary" 
                        size="small"
                        sx={{ fontSize: '0.72rem' }}
                      />
                    </Box>
                    <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                      <strong>Adresse : </strong>
                      {church.adresse || 'Non spécifiée'}
                    </Typography>
                    {church.responsable && (
                      <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                        <strong>Responsable : </strong>
                        {church.responsable.username}
                      </Typography>
                    )}
                    <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                      <strong>Nombre de membres : </strong>
                      {church.nombre_membres || 'Non spécifié'}
                    </Typography>
                    {church.description && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Description : </strong>
                        {church.description}
                      </Typography>
                    )}
                  </Box>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
        {/* Légende des zones */}
        <Box sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 2,
          boxShadow: 3,
          p: 2,
          minWidth: 180,
          zIndex: 1200
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Légende des zones</Typography>
          {[
            { nom: 'Zone Nord-Ouest', color: getZoneColor('Zone Nord-Ouest') },
            { nom: 'Zone Nord-Est', color: getZoneColor('Zone Nord-Est') },
            { nom: 'Zone Sud-Ouest', color: getZoneColor('Zone Sud-Ouest') },
            { nom: 'Zone Sud-Est', color: getZoneColor('Zone Sud-Est') },
            { nom: 'Zone Centre', color: getZoneColor('Zone Centre') }
          ].map(zone => (
            <Box key={zone.nom} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ width: 20, height: 20, background: zone.color, borderRadius: '4px', border: '1px solid #888', mr: 1 }} />
              <Typography variant="body2">{zone.nom}</Typography>
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Marqueurs</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <img
              src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png"
              alt="Église"
              style={{ width: 20, height: 32, marginRight: 8 }}
            />
            <Typography variant="body2">Église</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <img
              src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
              alt="Mission"
              style={{ width: 20, height: 32, marginRight: 8 }}
            />
            <Typography variant="body2">Mission</Typography>
          </Box>
        </Box>
      </Box>

      {churches.length === 0 && !loading && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Aucune église avec coordonnées géographiques trouvée
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ajoutez des coordonnées (latitude/longitude) aux églises pour les afficher sur la carte
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default MissionImplantation; 