import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Lock } from 'lucide-react';
import { rateLimiter, RATE_LIMITS } from '../../utils/rateLimiter';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (!rateLimiter.check('login', RATE_LIMITS.LOGIN)) {
      const remaining = rateLimiter.getBlockedTimeRemaining('login');
      setError(`Zbyt wiele prób logowania. Spróbuj ponownie za ${remaining} sekund.`);
      return;
    }
    
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      // Don't reset rate limiter on failed login
    } else {
      // Success! Reset rate limiter
      rateLimiter.reset('login');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md border-2 border-black shadow-brutal">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <CardTitle className="text-3xl font-display uppercase tracking-wide">
            Panel Właściciela
          </CardTitle>
          <div className="w-16 h-1 bg-black mx-auto"></div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6 pt-4">
            {error && (
              <div className="p-3 text-sm font-medium text-red-800 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold uppercase mb-2 ml-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@barber.com"
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase mb-2 ml-1">Hasło</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full text-lg py-6 mt-6"
            >
              {loading ? 'Logowanie...' : 'Zaloguj się'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
