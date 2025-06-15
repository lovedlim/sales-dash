import React, { useState } from 'react';
import { X, Mail, Lock, User, Building, Briefcase, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { signIn, signUp, validateEmail, validatePassword, getAuthErrorMessage } from '../services/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    company: '',
    position: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      company: '',
      position: ''
    });
    setError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleModeChange = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return false;
    }

    if (!validateEmail(formData.email)) {
      setError('유효한 이메일 주소를 입력해주세요.');
      return false;
    }

    if (mode === 'signup') {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.message);
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        return false;
      }

      if (!formData.displayName.trim()) {
        setError('이름을 입력해주세요.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await signIn(formData.email, formData.password);
        console.log('로그인 성공');
      } else {
        await signUp(formData.email, formData.password, formData.displayName);
        console.log('회원가입 성공');
      }
      
      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error('인증 오류:', error);
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-8 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? '로그인' : '회원가입'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'login' 
                ? '계정에 로그인하여 영업 데이터를 관리하세요' 
                : '새 계정을 만들어 영업 관리를 시작하세요'
              }
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-8">
          {/* 모드 전환 탭 */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
            <button
              onClick={() => handleModeChange('login')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => handleModeChange('signup')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              회원가입
            </button>
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 font-medium">오류가 발생했습니다</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이메일 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Mail className="w-4 h-4 inline mr-2" />
                이메일 주소 *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </div>

            {/* 회원가입 시 추가 필드 */}
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <User className="w-4 h-4 inline mr-2" />
                    이름 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="홍길동"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Building className="w-4 h-4 inline mr-2" />
                      회사명
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="㈜가나다테크"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Briefcase className="w-4 h-4 inline mr-2" />
                      직책
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="영업팀장"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Lock className="w-4 h-4 inline mr-2" />
                비밀번호 *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-gray-500 mt-2">
                  영문, 숫자 포함 6자 이상
                </p>
              )}
            </div>

            {/* 비밀번호 확인 (회원가입 시만) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Lock className="w-4 h-4 inline mr-2" />
                  비밀번호 확인 *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{mode === 'login' ? '로그인 중...' : '계정 생성 중...'}</span>
                </>
              ) : (
                <span>{mode === 'login' ? '로그인' : '계정 만들기'}</span>
              )}
            </button>
          </form>

          {/* 모드 전환 링크 */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {mode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
              <button
                onClick={() => handleModeChange(mode === 'login' ? 'signup' : 'login')}
                className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                {mode === 'login' ? '회원가입' : '로그인'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};