import { useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../store";
import { registerUser } from "../features/authSlice";

export const RegisterPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const authState = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState({ fullName: "", email: "", password: "" });

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      navigate('/login');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <div className="card-header">
        <h2>Dang ky</h2>
      </div>
      <form className="form" onSubmit={handleRegister}>
        <div className="field">
          <label>Ho ten</label>
          <input value={form.fullName} onChange={e => setForm(prev => ({ ...prev, fullName: e.target.value }))} required />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={form.password} onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))} required />
        </div>
        <button className="btn primary" type="submit" disabled={authState.status === 'loading'}>
          {authState.status === 'loading' ? 'Loading...' : 'Tao tai khoan'}
        </button>
        {authState.error && <p className="error">{authState.error}</p>}
        <p className="muted" style={{ marginTop: '16px', textAlign: 'center' }}>
          Da co tai khoan? <Link to="/login">Dang nhap</Link>
        </p>
      </form>
    </div>
  );
};
