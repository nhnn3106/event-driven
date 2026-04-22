const USER_SERVICE_URL = (
  // import.meta.env.VITE_USER_SERVICE_URL || 
  'http://localhost:8081/api')
export const MOVIE_SERVICE_URL = (
  // import.meta.env.VITE_MOVIE_SERVICE_URL || 
  'http://localhost:8082/api')
export const BOOKING_SERVICE_URL = (
  // import.meta.env.VITE_BOOKING_SERVICE_URL || 
  'http://localhost:8083/api')

export const apiClient = {
  user: {
    post: (path: string, body: any) =>
      fetch(`${USER_SERVICE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).then(res => res.json()),
  },
  movie: {
    get: (path: string) =>
      fetch(`${MOVIE_SERVICE_URL}${path}`).then(res => res.json()),
    post: (path: string, body: any, token?: string) =>
      fetch(`${MOVIE_SERVICE_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(body)
      }).then(res => res.json()),
    patch: (id: string, body: any, token?: string) =>
      fetch(`${MOVIE_SERVICE_URL}/movies/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(body)
      }).then(res => res.json()),
    delete: (id: string, token?: string) =>
      fetch(`${MOVIE_SERVICE_URL}/movies/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      }).then(res => res.ok ? true : res.json()),
  },
  booking: {
    get: (path: string) =>
      fetch(`${BOOKING_SERVICE_URL}${path}`).then(res => res.json()),
    post: (path: string, body: any, token?: string) =>
      fetch(`${BOOKING_SERVICE_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(body)
      }).then(res => res.json()),
    patch: (path: string, body: any, token?: string) =>
      fetch(`${BOOKING_SERVICE_URL}${path}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(body)
      }).then(res => res.json()),
    getOccupiedSeats: (movieId: string) =>
      fetch(`${BOOKING_SERVICE_URL}/bookings/occupied-seats/${movieId}`).then(res => res.json()),
  }
};
