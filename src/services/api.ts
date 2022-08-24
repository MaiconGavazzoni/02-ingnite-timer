import axios, { AxiosError } from 'axios'
import { Cookies } from 'react-cookie'
import { signOut } from '../contexts/AuthContext'

export const cookie = new Cookies()

// eslint-disable-next-line prefer-const
let token = cookie.get('igniteTimer.token')
// eslint-disable-next-line prefer-const
let isRefreshing = false
// eslint-disable-next-line prefer-const
let failedRequestsQueue: any = []

console.log('Api axios', token)

export const api = axios.create({
  baseURL: 'https://delivey.herokuapp.com',
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
      if (error.response.data?.code === 'token.expired') {
        const refresh_token = cookie.get('igniteTimer.refresh_token')
        const originalConfig = error.config

        if (!isRefreshing) {
          isRefreshing = true
          api
            .post('/refresh', { refresh_token })
            .then((response) => {
              const { token } = response.data

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

              failedRequestsQueue.forEach((request) => {
                request.onSuccess(token)
              })
              failedRequestsQueue = []
            })
            .catch((err) => {
              failedRequestsQueue.forEach((request) => {
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
              originalConfig.headers.common['Authorization'] = `Bearer ${token}`
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
