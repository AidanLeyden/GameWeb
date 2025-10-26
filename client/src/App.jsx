import { useEffect, useMemo, useState } from 'react'
import './App.css'
import Filters from './components/Filters.jsx'
import GameCard from './components/GameCard.jsx'
import { fetchRecommendations } from './api.js'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'

function App() {
  const [filters, setFilters] = useState({})
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const stableFilters = useMemo(() => filters, [filters])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    const t = setTimeout(() => {
      fetchRecommendations(stableFilters)
        .then((res) => { if (!cancelled) setItems(res) })
        .catch((err) => { if (!cancelled) setError(err?.message || 'Failed to load') })
        .finally(() => { if (!cancelled) setLoading(false) })
    }, 400)
    return () => { cancelled = true; clearTimeout(t) }
  }, [stableFilters])

  const theme = createTheme({
    palette: { mode: 'dark' },
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>Board Game Recommendations</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Adjust filters to refine suggestions.
        </Typography>
        <Filters onChange={setFilters} />

        {loading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        )}

        {!loading && !error && (
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {items.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No results. Try broadening your filters.</Typography>
            ) : (
              items.map((g) => (
                <GameCard key={g.id} game={g} />
              ))
            )}
          </Stack>
        )}
      </Container>
    </ThemeProvider>
  )
}

export default App
