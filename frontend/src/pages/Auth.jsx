// frontend/src/pages/Auth.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, sendVerificationEmail, clearMessages,getUserProfile } from "../redux/authSlice";

import { toast } from 'react-toastify';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // Şifre gösterme ikonları

const Auth = () => {
  const [isSignup, setIsSignup] = useState(true); // Varsayılan olarak kayıt formu açık olabilir
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, isLoading, error: authError, isEmailSent, isVerified, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    avatar: "", // Bu alan backend'e base64 string olarak gönderilecekse backend'in bunu işlemesi gerekir.
                // Mevcut backend'iniz (authController.js) avatarı req.body.avatar olarak bekliyor.
  });

  const [preview, setPreview] = useState(
    "https://media.istockphoto.com/id/1300845620/tr/vekt%C3%B6r/kullan%C4%B1c%C4%B1-simgesi-d%C3%BCz-beyaz-arka-plan-%C3%BCzerinde-izole-kullan%C4%B1c%C4%B1-sembol%C3%BC-vekt%C3%B6r-ill%C3%BCstrasyonu.jpg?s=612x612&w=0&k=20&c=BapxTLg8R3jjWnvaSXeHqgtou_-FcyBKmAkUsgwQzxU="
  );
  const [showPassword, setShowPassword] = useState(false);

  // URL'deki 'type' parametresine göre formu ayarla
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    if (type === 'login') {
      setIsSignup(false);
    } else {
      setIsSignup(true);
    }
  }, [location.search]);


  const handleChange = (e) => {
    if (e.target.name === "avatar") {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.readyState === 2) {
            setFormData((prev) => ({ ...prev, avatar: reader.result })); // Base64 string
            setPreview(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearMessages());

    if (isSignup) {
      if (formData.password.length < 6) {
        toast.error("Şifre en az 6 karakter olmalıdır.");
        return;
      }
      dispatch(registerUser(formData))
        .unwrap()
        .then(() => {
            // Kayıt sonrası local sepet aktarımı ŞİMDİLİK DEVRE DIŞI
            // dispatch(transferLocalCartToBackend()); 
            // Giriş yapıldığında Navbar'daki useEffect backend sepetini çekecektir.
            // Ya da burada direkt dispatch(fetchCart()) yapılabilir.
            
            if(isVerified) navigate("/"); // Otomatik yönlendirme için (eğer hemen doğrulanıyorsa)
            
        })
        .catch(err => {
            // Hata authSlice'tan toast ile gösterilecek
        });
    } else {
      dispatch(loginUser({ email: formData.email, password: formData.password }))
        .unwrap()
        .then(async() => {
            // Giriş sonrası local sepet aktarımı ŞİMDİLİK DEVRE DIŞI
            // dispatch(transferLocalCartToBackend());
            // Giriş yapıldığında Navbar'daki useEffect backend sepetini çekecektir.

            await dispatch(getUserProfile()).unwrap();
             navigate("/"); // Başarılı giriş sonrası anasayfaya yönlendir.
        })
        .catch(err => {
            // Hata authSlice'tan toast ile gösterilecek
        });
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.isVerified) { 
      toast.success(`Hoş geldiniz ${user.name}!`);
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  // Email verification resend handler
  const handleResendVerification = () => {
    if (user && user.email) { // user null değilse
      dispatch(sendVerificationEmail(user.email))
        .unwrap()
        .then(() => {
            toast.info("Doğrulama e-postası tekrar gönderildi.");
        })
        .catch((err) => {
            toast.error(err.message || "E-posta gönderilemedi.");
        });
    } else if (formData.email && isSignup && !isAuthenticated) {
      // Henüz kayıt olmuş ama giriş yapmamış, user objesi yoksa
      // Bu senaryo genellikle registerUser sonrası user objesi ile yönetilir.
      // Eğer user objesi yoksa ve yeniden gönderme butonu aktifse,
      // kullanıcının girdiği email'i kullanabiliriz ancak bu durumun iyi yönetilmesi gerekir.
      // Şimdilik bu kısmı user objesinin varlığına bağlı bırakmak daha güvenli.
       toast.warn("E-posta göndermek için kullanıcı bilgisi bulunamadı. Lütfen sayfayı yenileyin veya tekrar kayıt olmayı deneyin.");
    }
  };

  useEffect(() => {
    // Hata mesajlarını toast ile göster
    if (authError) {
      toast.error(authError);
      dispatch(clearMessages()); // Hata gösterildikten sonra temizle
    }
  }, [authError, dispatch]);

  useEffect(() => {
    // Başarı mesajlarını toast ile göster (isEmailSent gibi)
    if (isEmailSent && !isVerified) { // isVerified false iken göster
        toast.success("Doğrulama e-postası adresinize gönderildi. Lütfen e-postanızı kontrol edin.");
        dispatch(clearMessages()); // Mesaj gösterildikten sonra temizle
    }
  }, [isEmailSent, isVerified, dispatch]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center p-4">
      <div className="container mx-auto flex flex-col lg:flex-row rounded-xl overflow-hidden shadow-2xl max-w-4xl bg-base-100">
        {/* Left side - Image/Banner */}
        <div className={`lg:w-1/2 relative p-8 flex flex-col justify-center items-center text-center
                       transition-colors duration-300 ease-in-out
                       ${isSignup ? 'bg-secondary text-secondary-content' : 'bg-primary text-primary-content'}`}>
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            {/* Arka plan SVG'si veya resmi */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" className="w-full h-full">
              <path d="M500,10C229.4,10,10,229.4,10,500s219.4,490,490,490s490-219.4,490-490S770.6,10,500,10z M500,867.5 C293.8,867.5,132.5,706.2,132.5,500S293.8,132.5,500,132.5S867.5,293.8,867.5,500S706.2,867.5,500,867.5z"/>
              <path d="M500,255.5c-135,0-244.5,109.5-244.5,244.5S365,744.5,500,744.5S744.5,635,744.5,500S635,255.5,500,255.5z M500,622c-67.4,0-122-54.6-122-122s54.6-122,122-122s122,54.6,122,122S567.4,622,500,622z"/>
            </svg>
          </div>
          <div className="text-center z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{isSignup ? "ElectroMart'a Hoş Geldiniz!" : "Tekrar Merhaba!"}</h1>
            <p className="text-lg mb-8">
              {isSignup
                ? "Hemen bir hesap oluşturun ve teknoloji dünyasını keşfetmeye başlayın."
                : "Hesabınıza giriş yaparak alışverişe kaldığınız yerden devam edin."}
            </p>
            <div className="hidden lg:block mt-12">
              <button
                onClick={() => setIsSignup(!isSignup)}
                className={`btn btn-outline btn-lg border-2 
                            ${isSignup ? 'text-secondary-content hover:bg-secondary-content hover:text-secondary' 
                                       : 'text-primary-content hover:bg-primary-content hover:text-primary'}`}
              >
                {isSignup ? "Zaten hesabınız var mı? Giriş Yapın" : "Yeni misiniz? Kayıt Olun"}
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="lg:w-1/2 p-6 md:p-8">
          <div className="text-center lg:text-left mb-6">
            <h2 className="text-3xl font-bold">{isSignup ? "Yeni Hesap Oluştur" : "Giriş Yap"}</h2>
            <p className="text-base-content/70 mt-1">
              {isSignup
                ? "Bilgilerinizi girerek aramıza katılın."
                : "E-posta ve şifrenizle giriş yapın."}
            </p>
          </div>

          {/* Hata Alert'i kaldırıldı, toast ile gösteriliyor */}
          {/* isEmailSent Alert'i kaldırıldı, toast ile gösteriliyor */}

          {isAuthenticated && !user?.isVerified && user && ( // Sadece kullanıcı varsa ve doğrulanmamışsa göster
            <div className="alert alert-warning shadow-lg mb-6">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /> </svg>
                  <span className="ml-2">E-posta adresinizi doğrulamanız gerekiyor.</span>
                </div>
                <button 
                  onClick={handleResendVerification} 
                  className="btn btn-sm btn-outline"
                  disabled={isLoading} // Butonu yükleme sırasında devre dışı bırak
                >
                  {isLoading ? 'Gönderiliyor...' : 'Yeniden Gönder'}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Kullanıcı Adı</span></label>
                <input type="text" name="name" placeholder="Kullanıcı adınız" className="input input-bordered w-full focus:input-primary" value={formData.name} onChange={handleChange} required />
              </div>
            )}

            <div className="form-control">
              <label className="label"><span className="label-text font-medium">E-posta</span></label>
              <input type="email" name="email" placeholder="ornek@mail.com" className="input input-bordered w-full focus:input-primary" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Şifre</span></label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="input input-bordered w-full focus:input-primary pr-10"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {!isSignup && (
                <label className="label">
                  <span onClick={() => navigate("/reset-password")} className="label-text-alt link link-hover text-primary">
                    Şifremi unuttum
                  </span>
                </label>
              )}
              {isSignup && (
                <label className="label">
                  <span className="label-text-alt text-info">En az 6 karakter olmalıdır.</span>
                </label>
              )}
            </div>

            {isSignup && (
              <div className="form-control mt-4">
                <label className="label"><span className="label-text font-medium">Profil Fotoğrafı (Opsiyonel)</span></label>
                <div className="flex items-center space-x-4">
                  <div className="avatar">
                    <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img src={preview} alt="Avatar Preview" />
                    </div>
                  </div>
                  <input type="file" name="avatar" accept="image/*" className="file-input file-input-bordered file-input-sm file-input-primary w-full max-w-xs" onChange={handleChange} />
                </div>
                {isSignup && (
                  <label className="label">
                    <span className="label-text-alt text-info">Kayıt sonrası e-posta doğrulaması gereklidir.</span>
                  </label>
                )}
              </div>
            )}

            <div className="form-control pt-2">
              <button
                className={`btn ${isSignup ? 'btn-secondary' : 'btn-primary'} ${isLoading ? "loading" : ""} w-full`}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (isSignup ? 'Kaydediliyor...' : 'Giriş Yapılıyor...') : (isSignup ? "Kayıt Ol" : "Giriş Yap")}
              </button>
            </div>
          </form>

          <div className="divider my-6">VEYA</div>

          <div className="lg:hidden text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="btn btn-outline btn-neutral w-full"
            >
              {isSignup ? "Hesabınız var mı? Giriş Yapın" : "Yeni misiniz? Kayıt Olun"}
            </button>
          </div>

          <div className="mt-4 flex justify-center space-x-2">
            <button className="btn btn-circle btn-outline hover:bg-red-500 hover:border-red-500" title="Google ile Giriş (Yakında)">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"></path>
              </svg>
            </button>
            <button className="btn btn-circle btn-outline hover:bg-blue-600 hover:border-blue-600" title="Facebook ile Giriş (Yakında)">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"></path>
              </svg>
            </button>
            <button className="btn btn-circle btn-outline hover:bg-sky-500 hover:border-sky-500" title="Twitter ile Giriş (Yakında)">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.599-.1-.899a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;