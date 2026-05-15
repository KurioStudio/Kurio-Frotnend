import { Box, Button, Typography } from '@mui/material'
import { IoArrowBackOutline, IoHomeOutline } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../../../components/home/Header'
import SidebarMenu from '../../../components/navigation/SidebarMenu'

function NotFoundPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 88% 8%, rgba(215, 164, 73, 0.14), transparent 34%), radial-gradient(circle at 12% 92%, rgba(32, 58, 97, 0.48), transparent 38%), var(--kurio-bg)',
        marginLeft: 'var(--kurio-sidebar-width)',
        padding: 'calc(var(--kurio-header-height) + 30px) 16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SidebarMenu />
      <Header />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          maxWidth: 600,
          gap: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: '6rem', sm: '8rem', md: '10rem' },
            fontWeight: 900,
            lineHeight: 1,
            background: 'linear-gradient(135deg, rgba(215, 164, 73, 0.8), rgba(160, 119, 45, 0.8))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'var(--kurio-accent)',
            letterSpacing: '-2px',
          }}
        >
          404
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: '1.75rem', sm: '2.25rem' },
            fontWeight: 700,
            color: 'var(--kurio-text)',
          }}
        >
          {t('errors.notFound')}
        </Typography>

        <Typography
          sx={{
            fontSize: '1rem',
            color: 'var(--kurio-text-soft)',
            lineHeight: 1.6,
            maxWidth: 400,
          }}
        >
          {t('errors.notFound.description')}
        </Typography>

        <Box
          sx={{
            width: 60,
            height: 2,
            background: 'var(--kurio-accent)',
            borderRadius: '999px',
          }}
        />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, width: '100%', maxWidth: 400 }}>
          <Button
            onClick={() => navigate(-1)}
            sx={{
              flex: 1,
              height: 44,
              borderRadius: '8px',
              border: '1px solid var(--kurio-accent)',
              color: 'var(--kurio-accent)',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              background: 'rgba(215, 164, 73, 0.08)',
              transition: 'all 120ms ease',
              '&:hover': {
                background: 'var(--kurio-accent)',
                color: '#fff',
              },
            }}
            startIcon={<IoArrowBackOutline />}
          >
            {t('errors.notFound.back')}
          </Button>

          <Button
            onClick={() => navigate('/')}
            sx={{
              flex: 1,
              height: 44,
              borderRadius: '8px',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              background: 'var(--kurio-accent)',
              transition: 'all 120ms ease',
              '&:hover': {
                background: 'var(--kurio-accent-hover)',
              },
            }}
            startIcon={<IoHomeOutline />}
          >
            {t('errors.notFound.home')}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default NotFoundPage
