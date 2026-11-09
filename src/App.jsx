import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import SignupPage from './pages/SignupPage.jsx'

const App = ({ socket }) => (
  <Routes>
    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<HomePage socket={socket} />} />
    </Route>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
)

export default App
