import './i18n'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AlertProvider } from './contexts/AlertContext'
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage'
import LoginPage from './features/auth/pages/LoginPage'
import RegistrationPage from './features/auth/pages/RegistrationPage'
import HomePage from './features/home/pages/HomePage'
import ModelDetail from './features/home/pages/ModelDetail'
import ProfilePage from './features/profile/pages/ProfilePage'
import UploadModelPage from './features/home/pages/UploadModelPage'
import NotFoundPage from './features/errors/pages/NotFoundPage'
import ComingSoonPage from './features/errors/pages/ComingSoonPage'

function App() {
  return (
    <AlertProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/detalle-modelo/:postId" element={<ModelDetail/>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/subir-modelo" element={<UploadModelPage />} />
          <Route path="/inbox" element={<ComingSoonPage />} />

          <Route path="/auth">
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegistrationPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AlertProvider>
  )
}

export default App
