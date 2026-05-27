import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function Splash() {
  const navigate = useNavigate();
  const { session } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(session ? '/home' : '/login', { replace: true });
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate, session]);

  return (
    <div className="splash-screen">
      <div className="splash-logo">GIR RITUALS</div>
      <p className="splash-tagline">Pure. Natural. Daily.</p>
      <div className="splash-loader" />
    </div>
  );
}
