import { useEffect, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchMovies, createMovie, updateMovie, deleteMovie } from "../features/moviesSlice";
import type { MovieDto } from "../../api";

export const AdminMoviesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const moviesState = useSelector((state: RootState) => state.movies);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [movieForm, setMovieForm] = useState({
    title: "",
    description: "",
    durationMinutes: 90,
    posterUrl: "",
  });

  useEffect(() => {
    dispatch(fetchMovies());
  }, [dispatch]);

  const handleEdit = (movie: MovieDto) => {
    setEditingId(movie.id);
    setMovieForm({
      title: movie.title,
      description: movie.description,
      durationMinutes: movie.durationMinutes,
      posterUrl: movie.posterUrl,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setMovieForm({ title: "", description: "", durationMinutes: 90, posterUrl: "" });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (editingId) {
      dispatch(updateMovie({ id: editingId, data: movieForm }));
      setEditingId(null);
    } else {
      dispatch(createMovie(movieForm));
    }
    setMovieForm({ title: "", description: "", durationMinutes: 90, posterUrl: "" });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Ban co chac chan muon xoa phim nay?")) {
      dispatch(deleteMovie(id));
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Quan ly phim</h2>
      </div>

      <form className="form" onSubmit={handleSubmit} style={{ marginBottom: '32px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
        <h3>{editingId ? "Cap nhat phim" : "Them phim moi"}</h3>
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
            <label>Thoi luong (phut)</label>
            <input type="number" value={movieForm.durationMinutes} onChange={e => setMovieForm(p => ({ ...p, durationMinutes: Number(e.target.value) }))} />
          </div>
          <div className="field">
            <label>Poster URL</label>
            <input value={movieForm.posterUrl} onChange={e => setMovieForm(p => ({ ...p, posterUrl: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn primary" type="submit">{editingId ? "Cap nhat" : "Them phim"}</button>
          {editingId && <button className="btn ghost" type="button" onClick={handleCancel}>Huy</button>}
        </div>
      </form>

      <div className="movie-list">
        {Array.isArray(moviesState.items) && moviesState.items.map(movie => (
          <article className="booking-item" key={movie.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img src={movie.posterUrl || 'https://placehold.co/60x90'} alt={movie.title} style={{ width: '60px', height: '90px', borderRadius: '4px', objectFit: 'cover' }} />
                <div>
                    <h3>{movie.title}</h3>
                    <p className="muted">{movie.durationMinutes} phut</p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn primary" style={{ backgroundColor: '#3498db' }} onClick={() => handleEdit(movie)}>Sua</button>
              <button className="btn primary" style={{ backgroundColor: '#e74c3c' }} onClick={() => handleDelete(movie.id)}>Xoa</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
