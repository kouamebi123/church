import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Divider } from '@mui/material';
import axios from 'axios';

// Autres imports existants
import { keyframes } from '@mui/system';

const API_URL = process.env.REACT_APP_API_URL;

const CarouselContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '550px',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5))',
    pointerEvents: 'none'
  }
}));

const CarouselSlide = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  opacity: 0,
  transition: 'opacity 0.9s ease-in-out',
  '&.active': {
    opacity: 1
  }
}));

const zoomIn = keyframes`
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.12);
  }
`;

const CarouselImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  animation: `${zoomIn} 15s linear infinite`
});

const CarouselCaption = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center',
  color: 'white',
  zIndex: 2,
  width: '90%',
  maxWidth: '800px',
  padding: theme.spacing(3),
  animation: '$fadeIn 1s ease-out',
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
      transform: 'translate(-50%, -40%)'
    },
    to: {
      opacity: 1,
      transform: 'translate(-50%, -50%)'
    }
  }
}));

const CarouselControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 2),
  transform: 'translateY(-50%)',
  zIndex: 2
}));

const CarouselIndicators = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: theme.spacing(1),
  zIndex: 2
}));

const CarouselIndicator = styled(Box)(({ theme }) => ({
  width: 40,
  height: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.5)',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  '&.active': {
    backgroundColor: theme.palette.primary.main,
    width: 50
  },
  '&:hover': {
    backgroundColor: theme.palette.primary.light
  }
}));

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/carousel`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (response.status === 200 && response.data.success) {
          const data = response.data.data;
        
          setImages(data);
          setError(null);
        } else {
          throw new Error(response.data.message || 'Erreur lors du chargement des images..');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des images:', err);
        setError('Erreur lors du chargement des images.');
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchImages();
    
  }, []);
  

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  }, [images]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  }, [images]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [nextSlide, images]);

  return (
    <CarouselContainer>
      {/* Bloc des textes fixes superposés */}
      <Box>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.4)'
          }}
        />
        <CarouselCaption>
          <Typography 
            variant="h2" 
            sx={{ 
              mb: 3, 
              color: 'white',
              fontWeight: 900,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              fontSize: { xs: '2rem', sm: '3rem', md: '4rem' }
            }}
          >
            Bienvenue sur ACER Hub
          </Typography>
          <Divider
            sx={{
              my: 2,
              borderColor: 'primary.main',
              borderWidth: 2,
              width: 250,
              mx: 'auto',
              borderRadius: 2,
              opacity: 1
            }}
          />
          <Typography 
            variant="h4"
            sx={{ 
              fontWeight: 500,
              color: 'white',
              textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
              fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' }
            }}
          >
            La plateforme de gestion des cultes et réseaux
          </Typography>
        </CarouselCaption>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography>Chargement...</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : images.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography>Aucune image dans le carousel</Typography>
        </Box>
      ) : images.map((image, index) => (
        <CarouselSlide key={image._id} className={index === currentSlide ? 'active' : ''}>
          {console.log(image)}
          <CarouselImage src={`${API_URL}${image.chemin_image}`} alt={`Slide ${index + 1}`} />
          
        </CarouselSlide>
      ))}
      <CarouselControls>
        <IconButton
          onClick={prevSlide}
          sx={{
            color: 'rgba(255, 255, 255, 0.56)',
            backgroundColor: 'rgba(76, 0, 130, 0.4)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            width: { xs: 30, sm: 40, md: 48 },
            height: { xs: 30, sm: 40, md: 48 },
            '& svg': { fontSize: { xs: 24, sm: 28, md: 32 } },
            '&:hover': {
              backgroundColor: 'rgba(76, 0, 130, 0.73)',
              transform: 'scale(1.15)',
              color: 'rgba(255, 255, 255, 0.86)',
              border: '2px solid rgba(255, 255, 255, 0.57)',
            },
            border: '2px solid rgba(255, 255, 255, 0.29)',
            transition: 'all 0.3s',
          }}
        >
          <ChevronLeft />
        </IconButton>
        <IconButton
          onClick={nextSlide}
          sx={{
            color: 'rgba(255, 255, 255, 0.56)',
            backgroundColor: 'rgba(75, 0, 130, 0.42)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            width: { xs: 30, sm: 40, md: 48 },
            height: { xs: 30, sm: 40, md: 48 },
            '& svg': { fontSize: { xs: 24, sm: 28, md: 32 } },
            '&:hover': {
              backgroundColor: 'rgba(75, 0, 130, 1)',
              transform: 'scale(1.15)',
              color: 'rgba(255, 255, 255, 0.86)',
              border: '2px solid rgba(255, 255, 255, 0.71)',
            },
            border: '2px solid rgba(255, 255, 255, 0.29)',
            transition: 'all 0.3s',
          }}
        >
          <ChevronRight />
        </IconButton>
      </CarouselControls>
      <CarouselIndicators>
        {images.map((_, index) => (
          <CarouselIndicator
            key={index}
            className={index === currentSlide ? 'active' : ''}
            onClick={() => goToSlide(index)}
          />
        ))}
      </CarouselIndicators>
    </CarouselContainer>
  );
};

export default Carousel;
