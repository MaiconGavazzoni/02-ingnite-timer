import { Cookies as ReactCookies } from 'react-cookie'

const warning = () => {
  return false
}

class Cookies {
  _cookies: string | object | null = null
  constructor() {
    if (typeof window !== 'undefined') this._cookies = new ReactCookies()
    else
      this._cookies = {
        get: warning,
        set: warning,
        remove: warning,
      }
  }

  setCookies(opts: any) {
    this._cookies = new ReactCookies(Object.assign({}, opts))
  }

  get cookies() {
    return this._cookies
  }
}

export const cookies = new Cookies()
export const getUniversalCookies = () => cookies.cookies
