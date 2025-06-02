import React, { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { performPasswordReset } from '../redux/authSlice';

const PasswordReset = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const { isLoading, isPasswordChanged, error: apiError } = useSelector(state => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Temel doğrulama
    if (password.trim() === "") {
      setError("Lütfen yeni şifrenizi girin");
      return;
    }
    
    if (password.length < 6) {
      setError("Şifre en az 6 karakter uzunluğunda olmalıdır");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }
    
    setError("");
    dispatch(performPasswordReset({ token, password }))
      .unwrap()
      .then(() => {
        // Başarılı olunca yönlendir
        setTimeout(() => {
          navigate('/login', { state: { message: "Şifreniz başarıyla değiştirildi. Şimdi giriş yapabilirsiniz." } });
        }, 2000);
      })
      .catch((err) => {
        // Redux'un rejected state'i ile zaten yakalanıyor
      });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Başarılı durum gösterildiğinde
  if (isPasswordChanged) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-base-100 shadow-xl rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Şifre Başarıyla Değiştirildi!</h2>
          <p className="text-gray-600 mb-6">Giriş sayfasına yönlendiriliyorsunuz...</p>
          <button 
            onClick={() => navigate('/login')} 
            className="btn btn-primary w-full"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-base-100 shadow-xl rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Şifre Sıfırlama</h1>
          <p className="text-gray-500 mt-2">Lütfen yeni şifrenizi belirleyin</p>
        </div>

        {(error || apiError) && (
          <div className="alert alert-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error || apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Yeni Şifre</span>
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="input input-bordered w-full pr-10" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Yeni şifrenizi girin"
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                onClick={toggleShowPassword}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <label className="label">
              <span className="label-text-alt text-gray-500">En az 6 karakter olmalıdır</span>
            </label>
          </div>

          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Şifre Tekrar</span>
            </label>
            <input 
              type={showPassword ? "text" : "password"} 
              className="input input-bordered w-full" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Şifrenizi tekrar girin"
            />
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'İşleniyor...' : 'Şifreyi Değiştir'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/login" className="link link-primary">Giriş Sayfasına Dön</a>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;