import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { Cookies } from 'react-cookie'
import { signOut } from '../contexts/AuthContext'

interface ResponseProps extends AxiosError {
  code: string
}

export const cookie = new Cookies()

// eslint-disable-next-line prefer-const
let token = cookie.get('igniteTimer.token')
// eslint-disable-next-line prefer-const
let isRefreshing = false
// eslint-disable-next-line prefer-const
let failedRequestsQueue: any = []

export const api = axios.create({
  baseURL: 'https://projeto-base-authorization.herokuapp.com',
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    console.log(error.response?.status)
    if (error.response?.status === 401) {
      const code = error.response.data as ResponseProps
      if (code.code === 'token.expired') {
        // eslint-disable-next-line camelcase
        const refresh = cookie.get('igniteTimer.refresh_token')

        const originalConfig = error.config as AxiosRequestConfig<any>

        if (!isRefreshing) {
          isRefreshing = true
          api
            // eslint-disable-next-line camelcase
            .post('/refresh-token', { refresh })
            .then((response) => {
              const { token } = response.data
              console.log('Novo Token ', token)
              cookie.set('igniteTimer.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 dias
                path: '/',
              })

              cookie.set(
                'igniteTimer.refresh_token',
                response.data.refresh_token,
                {
                  maxAge: 60 * 60 * 24 * 30, // 30dias
                  path: '/',
                },
              )

              // eslint-disable-next-line dot-notation
              api.defaults.headers.common['Authorization'] = `Bearer ${token}`

              failedRequestsQueue.forEach((request: any) => {
                request.onSuccess(token)
              })
              failedRequestsQueue = []
            })
            .catch((err) => {
              failedRequestsQueue.forEach((request: any) => {
                request.onFailure(err)
              })
              failedRequestsQueue = []
            })
            .finally(() => {
              isRefreshing = false
            })
        }
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => {
              // eslint-disable-next-line dot-notation
              if (originalConfig.headers !== undefined) {
                // eslint-disable-next-line dot-notation
                originalConfig.headers['Authorization'] = `Bearer ${token}`
              }
              resolve(api(originalConfig))
            },
            onFailure: (err: AxiosError) => {
              reject(err)
            },
          })
        })
      } else {
        signOut()
      }
    }

    return Promise.reject(error)
  },
)
