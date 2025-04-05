import { FC } from 'react';
import { Card, CardContent, CardMedia, Typography, Box, CardActionArea } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Music } from '../../types';

interface MusicCardProps {
  music: Music;
  position: number;
  highlighted?: boolean;
}

const MusicCard: FC<MusicCardProps> = ({ music, position, highlighted = false }) => {
  const videoUrl = `https://www.youtube.com/watch?v=${music.youtube_id}`;
  
  const handleOpenVideo = () => {
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.07)',
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        },
        position: 'relative',
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
      }}
    >
      <CardActionArea 
        onClick={handleOpenVideo}
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          alignItems: 'flex-start',
          p: 0
        }}
      >
        {highlighted && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              bgcolor: 'primary.main', 
              color: 'primary.contrastText', 
              width: 28, 
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              zIndex: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {position}
          </Box>
        )}
        
        <Box sx={{ position: 'relative', paddingTop: '100%', width: '100%' }}>
          <CardMedia
            component="img"
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px 8px 0 0',
            }}
            image={music.thumbnail}
            alt={music.title}
          />
          <Box 
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '30%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
              zIndex: 1
            }}
          />
        </Box>
        
        <CardContent sx={{ 
          flexGrow: 1, 
          width: '100%',
          p: 1.5,
          '&:last-child': { pb: 1.5 },
          display: 'flex',
          flexDirection: 'column',
          height: '100px'
        }}>
          <Typography 
            variant="subtitle1" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              mb: 0.5,
              fontSize: '0.9rem',
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              width: '100%',
              textAlign: 'left'
            }}
          >
            {music.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 'auto', justifyContent: 'flex-start' }}>
            <VisibilityIcon fontSize="small" sx={{ color: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }} />
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                fontWeight: 500
              }}
            >
              {music.views_formatted}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default MusicCard; 