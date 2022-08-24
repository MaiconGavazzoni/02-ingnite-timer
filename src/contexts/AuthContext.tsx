import { createContext, ReactNode, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useNavigate, browserHistory } from 'react-router-dom'
import { api, cookie } from '../services/api'

type User = {
  email: string
  permissions: string[]
  roles: string[]
  client: {
    username: string
  }
  token: string
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
  // signOut: () => void
  user: User
  isAuthenticated: boolean
  cookies: any
}

export const AuthContext = createContext({} as AuthContextData)

export function signOut() {
  cookie.remove('igniteTimer.token')
  cookie.remove('igniteTimer.refresh_token')
  browserHistory.push('/')
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate()
  const [user, setUser] = useState<User>({} as User)
  const [cookies, setCookie] = useCookies([
    'igniteTimer.token',
    'igniteTimer.refresh_token',
  ])
  const isAuthenticated = !!user
  console.log(user)

  useEffect(() => {
    const token = cookies['igniteTimer.token']
    console.log('Token', token)
    if (token) {
      api
        .post('/client/authenticate/me')
        .then((response) => {
          const { client, token } = response.data
          setUser({
            email: client.username,
            permissions: [],
            roles: [],
            client: {
              username: client.username,
            },
            token,
          })
        })
        .catch(() => {
          signOut()
          // navigate('/')
        })
    }
  }, [])

  async function signIn({ email, password }: SingInCredential) {
    const data = {
      username: email,
      password,
    }
    try {
      const response = await api.post('/client/authenticate/', data)

      const { client, token } = response.data

      setUser({
        email: client.username,
        permissions: [],
        roles: [],
        client: {
          username: client.username,
        },
        token,
      })

      setCookie('igniteTimer.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: '/',
      })

      setCookie('igniteTimer.refresh_token', token, {
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

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user, cookies }}>
      {children}
    </AuthContext.Provider>
  )
}
