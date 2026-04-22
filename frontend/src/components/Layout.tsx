import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { logout } from '../features/authSlice';
import { bookingAdded, bookingUpdated, seatOccupied, seatReleased } from '../features/bookingsSlice';
import { movieAdded, movieUpdated, movieDeleted } from '../features/moviesSlice';
import { BOOKING_SERVICE_URL, MOVIE_SERVICE_URL } from '../api/client';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const [toasts, setToasts] = useState<{id: string, message: string}[]>([]);

  useEffect(() => {
    if (!auth.current) return;
    const eventSource = new EventSource(`${BOOKING_SERVICE_URL}/bookings/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('[Layout] SSE received:', message.type, message.data);
        
        if (message.type === 'BOOKING_CREATED') {
          if (message.data.userId === auth.current?.user.id) {
            dispatch(bookingAdded(message.data));
          }
          // Real-time seat occupancy update
          dispatch(seatOccupied({ movieId: message.data.movieId, seatNumber: message.data.seatNumber }));
        } else if (message.type === 'BOOKING_UPDATED') {
          if (message.data.userId === auth.current?.user.id) {
            const booking = message.data;
            dispatch(bookingUpdated(booking));
            
            let toastMsg = '';
            if (booking.status === 'CONFIRMED') {
              toastMsg = 'Vé của bạn đã được xác nhận thành công!';
            } else if (booking.status === 'CANCELLED') {
              const refundMsg = booking.paymentMethod === 'BANKING' ? ' Tiền sẽ được hoàn trả lại tài khoản của bạn.' : '';
              toastMsg = `Vé của bạn đã bị hủy.${refundMsg}`;
            }
            if (toastMsg) {
              const id = Date.now().toString() + Math.random().toString();
              setToasts(prev => [...prev, {id, message: toastMsg}]);
              setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
              }, 3000);
            }
          }

          // Update seat occupancy status
          if (message.data.status === 'CANCELLED') {
            dispatch(seatReleased({ movieId: message.data.movieId, seatNumber: message.data.seatNumber }));
          } else {
            dispatch(seatOccupied({ movieId: message.data.movieId, seatNumber: message.data.seatNumber }));
          }
        }
      } catch (e) {
        console.error('SSE parsing error', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [auth.current]);

  useEffect(() => {
    const movieEventSource = new EventSource(`${MOVIE_SERVICE_URL}/movies/stream`);
    
    movieEventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('[Layout] Movie SSE received:', message.type, message.data);
        if (message.type === 'MOVIE_CREATED') {
          dispatch(movieAdded(message.data));
        } else if (message.type === 'MOVIE_UPDATED') {
          dispatch(movieUpdated(message.data));
        } else if (message.type === 'MOVIE_DELETED') {
          dispatch(movieDeleted(message.data));
        }
      } catch (e) {
        console.error('Movie SSE parsing error', e);
      }
    };

    return () => {
      movieEventSource.close();
    };
  }, [dispatch]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Event-driven Cinema</p>
          <h1>Movie Booking Console</h1>
        </div>
        <div className="user-card">
          {auth.current ? (
            <>
              <div>
                <p className="label">Dang nhap</p>
                <p className="value">{auth.current.user.fullName}</p>
                <p className="muted">{auth.current.user.role} | {auth.current.user.email}</p>
              </div>
              <button className="btn ghost" onClick={handleLogout}>
                Dang xuat
              </button>
            </>
          ) : (
            <div>
              <p className="label">Trang thai</p>
              <p className="value">Chua dang nhap</p>
              <Link to="/login" className="btn ghost">Dang nhap</Link>
            </div>
          )}
        </div>
      </header>

      <nav className="tab-bar">
        <Link to="/" className="tab">Phim</Link>
        <Link to="/bookings" className="tab">Dat ve</Link>
        {auth.current?.user.role === 'ADMIN' && (
          <>
            <Link to="/admin" className="tab">Admin Bookings</Link>
            <Link to="/admin/movies" className="tab">Quan ly phim</Link>
          </>
        )}
      </nav>

      <main className="app-content">
        {children}
      </main>

      {toasts.length > 0 && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 9999 }}>
          {toasts.map(t => (
            <div key={t.id} style={{ background: '#333', color: '#fff', padding: '12px 24px', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              {t.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
