import { FC, memo } from 'react';
import { Card, CardContent, CardMedia, Typography, Box, CardActionArea, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Music } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface MusicCardProps {
  music: Music;
  position: number;
  highlighted?: boolean;
  onEdit?: (music: Music) => void;
  onDelete?: (music: Music) => void;
}

const MusicCard: FC<MusicCardProps> = ({ 
  music, 
  position, 
  highlighted = false,
  onEdit,
  onDelete
}) => {
  const { user } = useAuth();
  const videoUrl = `https://www.youtube.com/watch?v=${music.youtube_id}`;
  
  const handleOpenVideo = () => {
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(music);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(music);
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
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        },
        position: 'relative',
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderRadius: '12px',
        overflow: 'visible',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        m: 0.5,
        mb: 1.5
      }}
    >
      {user?.is_admin && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 8, 
            left: 8, 
            zIndex: 3,
            display: 'flex',
            gap: 0.5
          }}
        >
          <IconButton 
            size="small" 
            onClick={handleEdit}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.9)', 
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
              width: 28,
              height: 28,
              borderRadius: '8px'
            }}
          >
            <EditIcon fontSize="small" sx={{ color: 'primary.main' }} />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={handleDelete}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.9)', 
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
              width: 28,
              height: 28,
              borderRadius: '8px'
            }}
          >
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </IconButton>
        </Box>
      )}

      <CardActionArea 
        onClick={handleOpenVideo}
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          alignItems: 'flex-start',
          p: 0,
          borderRadius: '12px'
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
              borderRadius: '12px 12px 0 0',
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
          height: 'auto',
          minHeight: '90px',
          justifyContent: 'space-between',
          borderRadius: '0 0 12px 12px'
        }}>
          <Typography 
            variant="subtitle1" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              mb: 1,
              fontSize: '0.82rem',
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              width: '100%',
              textAlign: 'left',
              lineHeight: 1.2,
              minHeight: '40px'
            }}
          >
            {music.title}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            width: '100%', 
            mt: 'auto',
            pt: 0.5
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: '70px' }}>
              <VisibilityIcon fontSize="small" sx={{ 
                color: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                fontSize: '0.9rem'
              }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {music.views_formatted || (music.views ? `${music.views}` : '0')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: '50px', justifyContent: 'flex-end' }}>
              <ThumbUpIcon fontSize="small" sx={{ 
                color: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                fontSize: '0.9rem'
              }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {music.likes_formatted || (music.likes ? `${music.likes}` : '0')}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default memo(MusicCard); 