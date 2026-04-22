import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchBookings, createBooking, fetchOccupiedSeats } from "../features/bookingsSlice";
import { fetchMovies } from "../features/moviesSlice";
import { BookingStatus } from "../../api";

const BOOKINGS_PAGE_SIZE = 5;

export const BookingsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const bookingsState = useSelector((state: RootState) => state.bookings);
  const moviesState = useSelector((state: RootState) => state.movies);
  const authState = useSelector((state: RootState) => state.auth);

  const [bookingForm, setBookingForm] = useState({ movieId: "", seatNumber: "", totalPrice: 0, paymentMethod: "COD" });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const userId = authState.current?.user.role !== 'ADMIN' ? authState.current?.user.id : undefined;
    dispatch(fetchBookings(userId));
    dispatch(fetchMovies());
  }, [dispatch, authState.current]);

  useEffect(() => {
    if (bookingForm.movieId) {
      dispatch(fetchOccupiedSeats(bookingForm.movieId));
    }
  }, [bookingForm.movieId, dispatch]);

  const filteredBookings = useMemo(() => {
    let items = bookingsState.items;
    
    // Safety check: if items is not an array (e.g. error response), return empty array
    if (!Array.isArray(items)) return [];

    // Users only see their own bookings unless they are ADMIN
    if (authState.current?.user.role !== 'ADMIN') {
        items = items.filter(b => b.userId === authState.current?.user.id);
    }
    
    if (statusFilter !== "ALL") {
      items = items.filter(b => b.status === statusFilter);
    }
    return items;
  }, [bookingsState.items, statusFilter, authState.current]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / BOOKINGS_PAGE_SIZE));
  const pageItems = filteredBookings.slice((page - 1) * BOOKINGS_PAGE_SIZE, page * BOOKINGS_PAGE_SIZE);

  const handleCreateBooking = (event: FormEvent) => {
    event.preventDefault();
    if (!authState.current) return;
    dispatch(createBooking({
      ...bookingForm,
      userId: authState.current.user.id
    }));
    setBookingForm({ movieId: "", seatNumber: "", totalPrice: 0, paymentMethod: "COD" });
  };

  const getMovieTitle = (id: string) => moviesState.items.find(m => m.id === id)?.title || id;

  const rows = ['A', 'B', 'C', 'D', 'E'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleSeatClick = (seat: string) => {
    if (bookingsState.occupiedSeats.includes(seat)) return;
    setBookingForm(p => ({ ...p, seatNumber: seat }));
  };

  return (
    <section className="grid two">
      <div className="card">
        <div className="card-header">
          <h2>Tao don dat ve</h2>
        </div>
        {!authState.current ? <p>Vui long dang nhap de dat ve.</p> : (
          <form className="form" onSubmit={handleCreateBooking}>
            <div className="field">
              <label>Chon phim</label>
              <select value={bookingForm.movieId} onChange={e => setBookingForm(p => ({ ...p, movieId: e.target.value }))} required>
                <option value="">-- Chon phim --</option>
                {moviesState.items.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Chon ghe ({bookingForm.seatNumber || 'Chua chon'})</label>
              <div className="seat-grid">
                {rows.map(r => (
                  <div key={r} className="seat-row">
                    {cols.map(c => {
                      const seatId = `${r}${c}`;
                      const isOccupied = bookingsState.occupiedSeats.includes(seatId);
                      const isSelected = bookingForm.seatNumber === seatId;
                      return (
                        <div 
                          key={seatId} 
                          className={`seat ${isOccupied ? 'occupied' : isSelected ? 'selected' : 'available'}`}
                          onClick={() => handleSeatClick(seatId)}
                          title={isOccupied ? 'Ghe da co nguoi dat' : seatId}
                        >
                          {seatId}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="field">
                <label>Gia (VND)</label>
                <input type="number" value={bookingForm.totalPrice} onChange={e => setBookingForm(p => ({ ...p, totalPrice: Number(e.target.value) }))} required />
            </div>
            <div className="field">
              <label>Phuong thuc thanh toan</label>
              <select value={bookingForm.paymentMethod} onChange={e => setBookingForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                <option value="COD">Thanh toan khi nhan (COD)</option>
                <option value="BANKING">Chuyen khoan (BANKING)</option>
              </select>
            </div>
            <button className="btn primary" type="submit">Tao don</button>
          </form>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Danh sach dat ve</h2>
        </div>
        <div className="filter-bar">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">Tat ca</option>
            <option value={BookingStatus.PENDING}>PENDING</option>
            <option value={BookingStatus.CONFIRMED}>CONFIRMED</option>
            <option value={BookingStatus.CANCELLED}>CANCELLED</option>
          </select>
        </div>
        <div className="booking-list">
          {pageItems.map(booking => (
            <article className="booking-item" key={booking.id}>
              <div>
                <h3>{getMovieTitle(booking.movieId)}</h3>
                <p className="muted">Ghe: {booking.seatNumber} | PT: {booking.paymentMethod}</p>
                <span className={`status ${booking.status.toLowerCase()}`}>{booking.status}</span>
              </div>
              <div className="booking-meta">
                <span>{booking.totalPrice.toLocaleString()} VND</span>
              </div>
            </article>
          ))}
        </div>
        <Pagination current={page} total={totalPages} onChange={setPage} />
      </div>
    </section>
  );
};

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  return (
    <div className="pagination">
      <button className="btn ghost" onClick={() => onChange(Math.max(1, current - 1))} disabled={current === 1}>Truoc</button>
      <span>Trang {current} / {total}</span>
      <button className="btn ghost" onClick={() => onChange(Math.min(total, current + 1))} disabled={current === total}>Sau</button>
    </div>
  );
}
