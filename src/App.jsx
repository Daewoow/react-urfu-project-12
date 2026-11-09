import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

const App = () => (
  <Routes>
    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<HomePage />} />
    </Route>
    <Route path="/login" element={<LoginPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
)

export default App
