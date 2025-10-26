import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'

export default function Filters({ onChange }) {
  const [query, setQuery] = useState('the')
  const [minPlayers, setMinPlayers] = useState('')
  const [maxPlayers, setMaxPlayers] = useState('')
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [minAge, setMinAge] = useState('')
  const [categories, setCategories] = useState('')
  const [mechanics, setMechanics] = useState('')
  const [ratingOn, setRatingOn] = useState(true)
  const [minRating, setMinRating] = useState('4')

  useEffect(() => {
    onChange?.({
      query,
      minPlayers: num(minPlayers),
      maxPlayers: num(maxPlayers),
      yearFrom: num(yearFrom),
      yearTo: num(yearTo),
      minAge: num(minAge),
      categories: csv(categories),
      mechanics: csv(mechanics),
      minRating: ratingOn ? num(minRating) ?? 4 : undefined,
    })
  }, [query, minPlayers, maxPlayers, yearFrom, yearTo, minAge, categories, mechanics, ratingOn, minRating, onChange])

  return (
    <Box sx={{ py: 1 }}>
      <Grid container spacing={2} alignItems="flex-start">
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField label="Search term" value={query} onChange={e => setQuery(e.target.value)} fullWidth size="small" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          <TextField label="Min players" type="number" value={minPlayers} onChange={e => setMinPlayers(e.target.value)} fullWidth size="small" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          <TextField label="Max players" type="number" value={maxPlayers} onChange={e => setMaxPlayers(e.target.value)} fullWidth size="small" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          <TextField label="Year from" type="number" value={yearFrom} onChange={e => setYearFrom(e.target.value)} fullWidth size="small" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          <TextField label="Year to" type="number" value={yearTo} onChange={e => setYearTo(e.target.value)} fullWidth size="small" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          <TextField label="Min age" type="number" value={minAge} onChange={e => setMinAge(e.target.value)} fullWidth size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField label="Categories (comma separated)" value={categories} onChange={e => setCategories(e.target.value)} fullWidth size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField label="Mechanics (comma separated)" value={mechanics} onChange={e => setMechanics(e.target.value)} fullWidth size="small" />
        </Grid>
        <Grid size={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel control={<Checkbox checked={ratingOn} onChange={e => setRatingOn(e.target.checked)} />} label="Enforce min rating" />
            <TextField label="Min rating" type="number" value={minRating} onChange={e => setMinRating(e.target.value)} size="small" sx={{ width: 120 }} disabled={!ratingOn} />
            <Box component="span" sx={{ color: 'text.secondary', fontSize: 12 }}>(default 4)</Box>
            <Button variant="outlined" size="small" onClick={() => { /* no-op for UX */ }}>Apply Filters</Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

function csv(v) {
  const parts = String(v || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  return parts.length ? parts : undefined
}

function num(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}


