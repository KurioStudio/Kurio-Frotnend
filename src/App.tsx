import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage'
import LoginPage from './features/auth/pages/LoginPage'
import RegistrationPage from './features/auth/pages/RegistrationPage'
import HomePage from './features/home/pages/HomePage'
import UploadModelPage from './features/home/pages/UploadModelPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/subir-modelo" element={<UploadModelPage />} />

        <Route path="/auth">
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegistrationPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
