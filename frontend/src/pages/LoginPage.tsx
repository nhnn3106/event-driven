import { useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import type { AppDispatch, RootState } from "../store";
import { loginUser } from "../features/authSlice";

export const LoginPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const authState = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const from = (location.state as any)?.from?.pathname || "/";

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      if (result.payload.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <div className="card-header">
        <h2>Dang nhap</h2>
      </div>
      <form className="form" onSubmit={handleLogin}>
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button className="btn primary" type="submit" disabled={authState.status === 'loading'}>
          {authState.status === 'loading' ? 'Loading...' : 'Dang nhap'}
        </button>
        {authState.error && <p className="error">{authState.error}</p>}
        <p className="muted" style={{ marginTop: '16px', textAlign: 'center' }}>
          Chua co tai khoan? <Link to="/register">Dang ky ngay</Link>
        </p>
      </form>
    </div>
  );
};
