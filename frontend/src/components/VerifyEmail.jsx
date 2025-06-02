import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { verifyEmail } from "../redux/authSlice";

const VerifyEmail = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isLoading, error, isEmailVerified, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (token) {
      dispatch(verifyEmail(token));
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (isAuthenticated && isEmailVerified) {
      // Redirect to home page after successful verification
      const timer = setTimeout(() => {
        navigate("/");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isEmailVerified, navigate]);

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-6">E-posta Doğrulama</h1>
          
          {isLoading && (
            <div className="flex flex-col items-center gap-4">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-lg">E-posta adresiniz doğrulanıyor...</p>
            </div>
          )}
          
          {error && (
            <div className="alert alert-error shadow-lg">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Doğrulama hatası: {error}</span>
              </div>
            </div>
          )}
          
          {isEmailVerified && (
            <div className="py-6">
              <div className="alert alert-success shadow-lg mb-6">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current flex-shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>E-posta adresiniz başarıyla doğrulandı!</span>
                </div>
              </div>
              
              <p className="mb-6">
                Birkaç saniye içinde ana sayfaya yönlendirileceksiniz...
              </p>
              
              <button 
                className="btn btn-primary" 
                onClick={() => navigate("/")}
              >
                Ana Sayfaya Git
              </button>
            </div>
          )}
          
          {!isLoading && !isEmailVerified && !error && (
            <div className="py-6">
              <p className="mb-6">
                Doğrulama bağlantısı geçersiz veya süresi dolmuş olabilir.
              </p>
              
              <button 
                className="btn btn-primary" 
                onClick={() => navigate("/auth")}
              >
                Giriş Sayfasına Dön
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;