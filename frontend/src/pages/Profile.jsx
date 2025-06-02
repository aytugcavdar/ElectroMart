import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { uploadAvatar, getUserProfile, changePassword, updateProfile } from '../redux/authSlice'

const Profile = () => {
    const dispatch = useDispatch()
    const { user, loading, error } = useSelector((state) => state.auth)
    const [avatar, setAvatar] = useState(null)
    const [previewUrl, setPreviewUrl] = useState('')
    const [activeTab, setActiveTab] = useState('profile')
    const [editMode, setEditMode] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    })
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    console.log('User data:', user)

    useEffect(() => {
        dispatch(getUserProfile())
    }, [dispatch])

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || ''
            })
        }
    }, [user])

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setAvatar(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleAvatarSubmit = async (e) => {
        e.preventDefault()
        if (!avatar) return

        const formDataObj = new FormData()
        formDataObj.append('avatar', avatar)

        try {
            await dispatch(uploadAvatar(formDataObj)).unwrap()
            setAvatar(null)
            setPreviewUrl('')
            await dispatch(getUserProfile())
        } catch (err) {
            console.error('Avatar upload failed:', err)
        }
    }

    const handleProfileUpdate = async () => {
        try {
            await dispatch(updateProfile(formData)).unwrap()
            setEditMode(false)
            await dispatch(getUserProfile())
        } catch (err) {
            console.error('Profile update failed:', err)
        }
    }

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match')
            return
        }
        try {
            await dispatch(changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })).unwrap()
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })
            alert('Password changed successfully')
        } catch (err) {
            console.error('Password change failed:', err)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="min-h-screen bg-base-200 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header Card */}
                <div className="card bg-base-100 shadow-xl mb-6">
                    <div className="card-body">
                        <div className="flex flex-col lg:flex-row items-center gap-6">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center">
                                <div className="avatar">
                                    <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                        <img 
                                            src={previewUrl || user?.avatar?.url || '/default-avatar.png'} 
                                            alt="Profile"
                                        />
                                    </div>
                                </div>
                                
                                <div className="mt-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="file-input file-input-bordered file-input-primary w-full max-w-xs"
                                    />
                                    {avatar && (
                                        <button
                                            onClick={handleAvatarSubmit}
                                            className={`btn btn-primary mt-2 w-full ${loading ? 'loading' : ''}`}
                                            disabled={loading}
                                        >
                                            {loading ? 'Yükleniyor...' : 'Fotoğrafı Yükle'}
                                        </button>
                                    )}
                                </div>
                                
                                {error && (
                                    <div className="alert alert-error mt-2">
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center lg:text-left">
                                <h1 className="text-3xl font-bold">{user?.name}</h1>
                                <p className="text-base-content/70 text-lg">{user?.email}</p>
                                
                                <div className="flex flex-wrap gap-2 mt-4 justify-center lg:justify-start">
                                    <div className={`badge badge-lg ${user?.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                                        {user?.role === 'admin' ? '👑 Admin' : '👤 Kullanıcı'}
                                    </div>
                                    <div className={`badge badge-lg ${user?.isVerified ? 'badge-success' : 'badge-warning'}`}>
                                        {user?.isVerified ? '✅ Doğrulanmış' : '⚠️ Doğrulanmamış'}
                                    </div>
                                </div>

                                <div className="stats shadow mt-4">
                                    <div className="stat">
                                        <div className="stat-title">Üyelik Tarihi</div>
                                        <div className="stat-value text-sm">
                                            {user?.createdAt ? formatDate(user.createdAt) : 'Bilinmiyor'}
                                        </div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-title">Son Giriş</div>
                                        <div className="stat-value text-sm">
                                            {user?.lastLogin ? formatDate(user.lastLogin) : 'Bilinmiyor'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs tabs-boxed bg-base-100 shadow-xl p-2 mb-6">
                    <button 
                        className={`tab tab-lg ${activeTab === 'profile' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        👤 Profil Bilgileri
                    </button>
                    <button 
                        className={`tab tab-lg ${activeTab === 'security' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        🔒 Güvenlik
                    </button>
                    <button 
                        className={`tab tab-lg ${activeTab === 'activity' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('activity')}
                    >
                        📊 Aktivite
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'profile' && (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="card-title text-2xl">Profil Bilgileri</h2>
                                <button 
                                    className="btn btn-outline"
                                    onClick={() => setEditMode(!editMode)}
                                >
                                    {editMode ? '❌ İptal' : '✏️ Düzenle'}
                                </button>
                            </div>

                            {editMode ? (
                                <div className="space-y-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">İsim</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="input input-bordered"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">E-posta</span>
                                        </label>
                                        <input
                                            type="email"
                                            className="input input-bordered"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                    <div className="card-actions justify-end">
                                        <button 
                                            onClick={handleProfileUpdate}
                                            className={`btn btn-primary ${loading ? 'loading' : ''}`}
                                            disabled={loading}
                                        >
                                            💾 Kaydet
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">İsim</span>
                                        </label>
                                        <div className="input input-bordered flex items-center">
                                            {user?.name}
                                        </div>
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">E-posta</span>
                                        </label>
                                        <div className="input input-bordered flex items-center">
                                            {user?.email}
                                        </div>
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Rol</span>
                                        </label>
                                        <div className="input input-bordered flex items-center">
                                            {user?.role}
                                        </div>
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Durum</span>
                                        </label>
                                        <div className="input input-bordered flex items-center">
                                            {user?.isVerified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-2xl mb-6">🔒 Güvenlik Ayarları</h2>
                            
                            <div className="space-y-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Mevcut Şifre</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="input input-bordered"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Yeni Şifre</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="input input-bordered"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Yeni Şifre (Tekrar)</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="input input-bordered"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    />
                                </div>
                                <div className="card-actions justify-end">
                                    <button 
                                        onClick={handlePasswordChange}
                                        className={`btn btn-primary ${loading ? 'loading' : ''}`}
                                        disabled={loading}
                                    >
                                        🔐 Şifreyi Değiştir
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-2xl mb-6">📊 Hesap Aktivitesi</h2>
                            
                            <div className="space-y-4">
                                <div className="alert alert-info">
                                    <div>
                                        <h3 className="font-bold">Hesap Oluşturulma</h3>
                                        <div className="text-xs">{user?.createdAt ? formatDate(user.createdAt) : 'Bilinmiyor'}</div>
                                    </div>
                                </div>
                                
                                <div className="alert alert-success">
                                    <div>
                                        <h3 className="font-bold">Son Giriş</h3>
                                        <div className="text-xs">{user?.lastLogin ? formatDate(user.lastLogin) : 'Bilinmiyor'}</div>
                                    </div>
                                </div>

                                <div className="alert alert-warning">
                                    <div>
                                        <h3 className="font-bold">E-posta Doğrulama</h3>
                                        <div className="text-xs">
                                            {user?.isVerified ? 'E-posta adresiniz doğrulanmış ✅' : 'E-posta adresinizi doğrulayın ⚠️'}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Security Info */}
                                <div className="divider">Güvenlik Bilgileri</div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="stat bg-base-200 rounded-lg">
                                        <div className="stat-figure text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                                            </svg>
                                        </div>
                                        <div className="stat-title">Hesap Türü</div>
                                        <div className="stat-value text-primary">{user?.role}</div>
                                        <div className="stat-desc">Yetki seviyeniz</div>
                                    </div>
                                    
                                    <div className="stat bg-base-200 rounded-lg">
                                        <div className="stat-figure text-secondary">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </div>
                                        <div className="stat-title">Doğrulama</div>
                                        <div className="stat-value text-secondary">{user?.isVerified ? 'Aktif' : 'Bekliyor'}</div>
                                        <div className="stat-desc">E-posta durumu</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Profile