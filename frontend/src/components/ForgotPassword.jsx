import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetPassword, clearMessages } from "../redux/authSlice";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isLoading, error, isPasswordReset, isEmailSent } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Clear any previous messages when component mounts
    dispatch(clearMessages());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(resetPassword(email));
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col">
        <div className="text-center">
          <h1 className="text-5xl font-bold">Şifre Sıfırlama</h1>
          <p className="py-6">
            Kayıtlı e-posta adresinizi girin ve şifre sıfırlama bağlantısı alın.
          </p>
        </div>

        <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
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
                  <span>{error}</span>
                </div>
              </div>
            )}

            {isPasswordReset && isEmailSent ? (
              <div>
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
                    <span>Şifre sıfırlama bağlantısı gönderildi!</span>
                  </div>
                </div>
                <p className="mb-4">
                  {email} adresine şifre sıfırlama bağlantısı gönderdik. Lütfen e-postanızı kontrol edin.
                </p>
                <div className="form-control mt-6">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/auth")}
                  >
                    Giriş Sayfasına Dön
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">E-posta</span>
                  </label>
                  <input
                    type="email"
                    placeholder="E-posta adresiniz"
                    className="input input-bordered"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-control mt-6">
                  <button
                    className={`btn btn-primary ${isLoading ? "loading" : ""}`}
                    type="submit"
                    disabled={isLoading}
                  >
                    Şifre Sıfırlama Bağlantısı Gönder
                  </button>
                </div>
                <div className="form-control mt-4">
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={() => navigate("/auth")}
                  >
                    Giriş Sayfasına Dön
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;