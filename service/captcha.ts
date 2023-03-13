import axios from 'axios'

export const verify = (token: string) => {
  return axios.post('/api/captcha', { token })
}
