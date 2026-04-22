import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchBookings, updateBookingStatus, bookingAdded, bookingUpdated } from '../features/bookingsSlice';
import { BOOKING_SERVICE_URL } from '../api/client';
import { BookingStatus } from '../../api';

export const AdminDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const bookingsState = useSelector((state: RootState) => state.bookings);
  const moviesState = useSelector((state: RootState) => state.movies);

  useEffect(() => {
    dispatch(fetchBookings(undefined));

    const eventSource = new EventSource(`${BOOKING_SERVICE_URL}/bookings/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'BOOKING_CREATED') {
          dispatch(bookingAdded(message.data));
        } else if (message.type === 'BOOKING_UPDATED') {
          dispatch(bookingUpdated(message.data));
        }
      } catch (e) {
        console.error('SSE parsing error', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [dispatch]);

  const handleStatusUpdate = (id: string, status: BookingStatus) => {
    dispatch(updateBookingStatus({ id, status }));
  };

  const getMovieTitle = (id: string) => {
    const movie = moviesState.items.find(m => m.id === id);
    return movie ? movie.title : id;
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="muted">Quan ly trang thai dat ve</p>
        </div>
      </div>
      
      {bookingsState.status === 'loading' && <p>Loading...</p>}
      
      <div className="booking-list">
        {Array.isArray(bookingsState.items) && bookingsState.items.map((booking) => (
          <article className="booking-item" key={booking.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>{getMovieTitle(booking.movieId)}</h3>
              <p className="muted">ID: {booking.id}</p>
              <p className="muted">Ghe: {booking.seatNumber} | User: {booking.userId} | PT: {booking.paymentMethod}</p>
              <span className={`status ${booking.status.toLowerCase()}`}>{booking.status}</span>
            </div>
            
            {booking.status === BookingStatus.PENDING && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn primary" 
                  style={{ backgroundColor: '#2ecc71' }}
                  onClick={() => handleStatusUpdate(booking.id, BookingStatus.CONFIRMED)}
                >
                  Confirm
                </button>
                <button 
                  className="btn primary" 
                  style={{ backgroundColor: '#e74c3c' }}
                  onClick={() => handleStatusUpdate(booking.id, BookingStatus.CANCELLED)}
                >
                  Cancel
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};
