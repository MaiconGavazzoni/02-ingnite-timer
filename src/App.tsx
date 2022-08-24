import { ThemeProvider } from 'styled-components'
import { Router } from './Router'
import { BrowserRouter } from 'react-router-dom'
import { GlobalStyle } from './styles/global'
import { defaultTheme } from './styles/themes/default'
import { CyclesContextProvider } from './contexts/CyclesContext'
import { AuthProvider } from './contexts/AuthContext'
import { CookiesProvider } from 'react-cookie'

export function App() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <BrowserRouter>
        <CookiesProvider>
          <AuthProvider>
            <CyclesContextProvider>
              <Router />
            </CyclesContextProvider>
          </AuthProvider>
        </CookiesProvider>
      </BrowserRouter>
      <GlobalStyle />
    </ThemeProvider>
  )
}
