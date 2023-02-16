import axios from 'axios'

export const useHttp = () => {
  const get = (url: string, params?: any) => {
    return axios.get(url, { params })
  }

  const post = (url, body) => {
    return axios({
      url,
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      data: body
    })
  }

  return { get, post }
}
