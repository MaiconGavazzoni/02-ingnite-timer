import { createContext, ReactNode, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useNavigate } from 'react-router-dom'
import { api, cookie } from '../services/api'

type User = {
  username: string
  email: string
  permissions: string[]
  roles: string[]
}

type AuthProviderProps = {
  children: ReactNode
}

type SingInCredential = {
  email: string
  password: string
}

// type CookiesProps = {
//   igniteTimer.token?: string | null
//   refresh_token?: string | null
// }

type AuthContextData = {
  signIn: (credentials: SingInCredential) => Promise<void>
  signOut: () => void
  user: User
  isAuthenticated: boolean
  cookies: any
}

export const AuthContext = createContext({} as AuthContextData)

export function signOut() {
  cookie.remove('igniteTimer.token')
  cookie.remove('igniteTimer.refresh_token')
  // browserHistory.push('/')
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate()
  const [user, setUser] = useState<User>({} as User)
  const [cookies, setCookie] = useCookies([
    'igniteTimer.token',
    'igniteTimer.refresh_token',
  ])
  const isAuthenticated = !!user.email

  useEffect(() => {
    const token = cookies['igniteTimer.token']
    if (token) {
      api
        .post('/users/me')
        .then((response) => {
          const { user } = response.data as any
          setUser({
            username: user.username,
            email: user.username,
            permissions: user.permissions,
            roles: user.roles,
          })

          if (user.email) {
            navigate('/home')
          }
        })

        .catch(() => {
          signOut()
          navigate('/')
        })
    }
  }, [])

  async function signIn({ email, password }: SingInCredential) {
    const data = {
      username: email,
      password,
    }
    try {
      const response = await api.post('/sessions/', data)

      // eslint-disable-next-line camelcase
      const { user, token, refresh_token } = response.data

      setUser({
        username: user.username,
        email: user.email,
        permissions: user.permissions,
        roles: user.roles,
      })

      setCookie('igniteTimer.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: '/',
      })

      setCookie('igniteTimer.refresh_token', refresh_token, {
        maxAge: 60 * 60 * 24 * 30, // 30dias
        path: '/',
      })

      // eslint-disable-next-line dot-notation
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      navigate('/Home')
    } catch (err) {
      console.log(err)
    }
  }

  function signOut() {
    cookie.remove('igniteTimer.token')
    cookie.remove('igniteTimer.refresh_token')
    // browserHistory.push('/')
    setUser({} as User)
    navigate('/')
  }

  return (
    <AuthContext.Provider
      value={{ signIn, isAuthenticated, user, cookies, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}
