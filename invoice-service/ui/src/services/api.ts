import axios from 'axios'

export const api = axios.create({
  baseURL: '/', // proxied by Vite to Spring Boot
  headers: { 'Content-Type': 'application/json' }
})
