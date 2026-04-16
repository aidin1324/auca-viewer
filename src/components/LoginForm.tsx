import React, { useState, useEffect } from 'react';
import { LogIn, Eye, EyeOff, Lock, User, Database, Save, Clock, X } from 'lucide-react';

interface SavedAccount {
  username: string;
  password: string;
  lastUsed: number;
}

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  onDemoMode?: () => void;
  isLoading: boolean;
}

const STORAGE_KEY = 'auca_saved_accounts';
const MAX_SAVED_ACCOUNTS = 3;

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onDemoMode, isLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberCredentials, setRememberCredentials] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [showSavedAccounts, setShowSavedAccounts] = useState(false);

  // Загружаем сохраненные аккаунты при инициализации
  useEffect(() => {
    loadSavedAccounts();
  }, []);

  const loadSavedAccounts = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const accounts: SavedAccount[] = JSON.parse(saved);
        // Сортируем по времени последнего использования
        accounts.sort((a, b) => b.lastUsed - a.lastUsed);
        setSavedAccounts(accounts);
        
        // Если есть сохраненные аккаунты, показываем их
        if (accounts.length > 0) {
          setShowSavedAccounts(true);
        }
      }
    } catch (error) {
      console.error('Error loading saved accounts:', error);
    }
  };

  const saveAccount = (username: string, password: string) => {
    try {
      let accounts = [...savedAccounts];
      
      // Проверяем, есть ли уже такой аккаунт
      const existingIndex = accounts.findIndex(acc => acc.username === username);
      
      if (existingIndex >= 0) {
        // Обновляем существующий аккаунт
        accounts[existingIndex] = {
          username,
          password,
          lastUsed: Date.now()
        };
      } else {
        // Добавляем новый аккаунт
        accounts.unshift({
          username,
          password,
          lastUsed: Date.now()
        });
        
        // Ограничиваем количество сохраненных аккаунтов
        if (accounts.length > MAX_SAVED_ACCOUNTS) {
          accounts = accounts.slice(0, MAX_SAVED_ACCOUNTS);
        }
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
      setSavedAccounts(accounts);
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const removeSavedAccount = (usernameToRemove: string) => {
    try {
      const filtered = savedAccounts.filter(acc => acc.username !== usernameToRemove);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      setSavedAccounts(filtered);
      
      if (filtered.length === 0) {
        setShowSavedAccounts(false);
      }
    } catch (error) {
      console.error('Error removing account:', error);
    }
  };

  const selectSavedAccount = (account: SavedAccount) => {
    setUsername(account.username);
    setPassword(account.password);
    setShowSavedAccounts(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    try {
      const success = await onLogin(username, password);
      if (success) {
        // Сохраняем аккаунт при успешном входе, если включено запоминание
        if (rememberCredentials) {
          saveAccount(username, password);
        }
      } else {
        setError('Неверные учетные данные');
      }
    } catch {
      setError('Ошибка подключения к серверу');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
          <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">AUCA Course Viewer</h1>
          <p className="text-blue-100">Войдите в систему для просмотра предметов</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Saved Accounts */}
          {savedAccounts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Сохраненные аккаунты
                </label>
                <button
                  type="button"
                  onClick={() => setShowSavedAccounts(!showSavedAccounts)}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {showSavedAccounts ? 'Скрыть' : 'Показать'}
                </button>
              </div>
              
              {showSavedAccounts && (
                <div className="space-y-2">
                  {savedAccounts.map((account, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {account.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            Использован: {new Date(account.lastUsed).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => selectSavedAccount(account)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          disabled={isLoading}
                        >
                          Выбрать
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSavedAccount(account.username)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          disabled={isLoading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Имя пользователя
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Введите имя пользователя"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Введите пароль"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              checked={rememberCredentials}
              onChange={(e) => setRememberCredentials(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={isLoading}
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600 flex items-center">
              <Save className="w-4 h-4 mr-1" />
              Запомнить учетные данные
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Вход...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <LogIn className="w-5 h-5" />
                <span>Войти</span>
              </div>
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Используйте свои учетные данные из AUCA Study
            </p>
            {onDemoMode && (
              <button
                type="button"
                onClick={onDemoMode}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-4"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>Демо режим</span>
                </div>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
