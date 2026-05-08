import './i18n'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage'
import LoginPage from './features/auth/pages/LoginPage'
import RegistrationPage from './features/auth/pages/RegistrationPage'
import HomePage from './features/home/pages/HomePage'
import ModelDetail from './features/home/pages/ModelDetail'
import ProfilePage from './features/profile/pages/ProfilePage'
import UploadModelPage from './features/home/pages/UploadModelPage'
import NotFoundPage from './features/errors/pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/detalle-modelo/:postId" element={<ModelDetail/>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/subir-modelo" element={<UploadModelPage />} />

        <Route path="/auth">
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegistrationPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
