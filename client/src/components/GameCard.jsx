import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

export default function GameCard({ game }) {
  if (!game) return null
  const hasImage = Boolean(game.thumbnail)
  return (
    <Card variant="outlined" sx={{ display: 'grid', gridTemplateColumns: { xs: '100px 1fr', sm: '120px 1fr' }, gap: 2 }}>
      {hasImage ? (
        <CardMedia component="img" image={game.thumbnail} alt={game.name} sx={{ width: { xs: 100, sm: 120 }, height: { xs: 100, sm: 120 }, objectFit: 'cover' }} />
      ) : (
        <Box sx={{ width: { xs: 100, sm: 120 }, height: { xs: 100, sm: 120 }, bgcolor: 'action.hover' }} />
      )}
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {game.name} {game.yearpublished ? `(${game.yearpublished})` : ''}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Players: {game.minplayers ?? '?'} - {game.maxplayers ?? '?'} | Age {game.minage ?? '?'}+
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Rating: {game.rating ?? 'N/A'} | Rank: {game.rank ?? 'N/A'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
          {game.categories?.slice(0, 3).join(', ')}
        </Typography>
      </CardContent>
    </Card>
  )
}



