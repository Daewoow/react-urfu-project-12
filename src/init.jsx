import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

const init = async (socket) => (
  <BrowserRouter>
    <MantineProvider>
      <App socket={socket} />
    </MantineProvider>
  </BrowserRouter>
)

export default init
