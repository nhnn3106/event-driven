import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchMovies, createMovie } from "../features/moviesSlice";

const MOVIES_PAGE_SIZE = 4;

export const MoviesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const moviesState = useSelector((state: RootState) => state.movies);
  const authState = useSelector((state: RootState) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [minDuration, setMinDuration] = useState("");
  const [maxDuration, setMaxDuration] = useState("");
  const [moviesPage, setMoviesPage] = useState(1);

  const [movieForm, setMovieForm] = useState({
    title: "",
    description: "",
    durationMinutes: 90,
    posterUrl: "",
  });

  useEffect(() => {
    dispatch(fetchMovies());
  }, [dispatch]);

  const filteredMovies = useMemo(() => {
    const items = moviesState.items;
    if (!Array.isArray(items)) return [];

    const query = searchTerm.trim().toLowerCase();
    const min = minDuration ? Number(minDuration) : null;
    const max = maxDuration ? Number(maxDuration) : null;
    return items.filter((movie) => {
      const matchesQuery = !query || movie.title.toLowerCase().includes(query) || movie.description.toLowerCase().includes(query);
      const matchesMin = min === null || movie.durationMinutes >= min;
      const matchesMax = max === null || movie.durationMinutes <= max;
      return matchesQuery && matchesMin && matchesMax;
    });
  }, [moviesState.items, searchTerm, minDuration, maxDuration]);

  const moviesTotalPages = Math.max(1, Math.ceil(filteredMovies.length / MOVIES_PAGE_SIZE));
  const moviesPageItems = filteredMovies.slice((moviesPage - 1) * MOVIES_PAGE_SIZE, moviesPage * MOVIES_PAGE_SIZE);

  const handleCreateMovie = (event: FormEvent) => {
    event.preventDefault();
    dispatch(createMovie(movieForm));
    setMovieForm({ title: "", description: "", durationMinutes: 90, posterUrl: "" });
  };

  return (
    <section className="grid two">
      {authState.current?.user.role === 'ADMIN' && (
        <div className="card">
          <div className="card-header">
            <h2>Tao phim moi</h2>
          </div>
          <form className="form" onSubmit={handleCreateMovie}>
            <div className="field">
              <label>Ten phim</label>
              <input value={movieForm.title} onChange={e => setMovieForm(p => ({ ...p, title: e.target.value }))} required />
            </div>
            <div className="field">
              <label>Mo ta</label>
              <textarea value={movieForm.description} onChange={e => setMovieForm(p => ({ ...p, description: e.target.value }))} rows={3} />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Duration</label>
                <input type="number" value={movieForm.durationMinutes} onChange={e => setMovieForm(p => ({ ...p, durationMinutes: Number(e.target.value) }))} />
              </div>
              <div className="field">
                <label>Poster URL</label>
                <input value={movieForm.posterUrl} onChange={e => setMovieForm(p => ({ ...p, posterUrl: e.target.value }))} />
              </div>
            </div>
            <button className="btn primary" type="submit">Tao phim</button>
          </form>
        </div>
      )}

      <div className="card" style={authState.current?.user.role !== 'ADMIN' ? { gridColumn: 'span 2' } : {}}>
        <div className="card-header">
          <h2>Danh sach phim</h2>
        </div>
        <div className="filter-bar">
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Tim phim..." />
          <input type="number" value={minDuration} onChange={e => setMinDuration(e.target.value)} placeholder="Min" />
          <input type="number" value={maxDuration} onChange={e => setMaxDuration(e.target.value)} placeholder="Max" />
        </div>
        <div className="movie-list">
          {moviesPageItems.map(movie => (
            <article className="movie-item" key={movie.id}>
              <img src={movie.posterUrl || 'https://placehold.co/240x360'} alt={movie.title} />
              <div>
                <h3>{movie.title}</h3>
                <p className="muted">{movie.description}</p>
                <div className="meta">
                  <span>{movie.durationMinutes} phut</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <Pagination current={moviesPage} total={moviesTotalPages} onChange={setMoviesPage} />
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
