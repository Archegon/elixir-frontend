import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ModalTemplate from './ModalTemplate';
import apiService from '../../services/api.service';
import type { PLCStatus } from '../../config/api-endpoints';

interface PasswordInputModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onProceed: (password: string) => void;
  onChangePassword: (oldPassword: string, newPassword: string) => void;
}

const PasswordInputModal: React.FC<PasswordInputModalProps> = ({
  isOpen,
  onCancel,
  onProceed,
  onChangePassword,
}) => {
  const { currentTheme } = useTheme();
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentField, setCurrentField] = useState<'password' | 'newPassword' | 'confirmNewPassword'>('password');
  const [error, setError] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [plcStatus, setPLCStatus] = useState<PLCStatus | null>(null);

  // Monitor PLC status for password validation
  useEffect(() => {
    const handleStatusUpdate = (status: PLCStatus) => {
      setPLCStatus(status);
      
      // Update password validation based on PLC feedback
      if (currentField === 'password' && password.length === 4) {
        setIsPasswordValid(status.auth.proceed_status);
      }
    };

    apiService.on('status-update', handleStatusUpdate);
    
    const initialStatus = apiService.getSystemStatus();
    if (initialStatus) {
      handleStatusUpdate(initialStatus);
    }

    return () => {
      apiService.off('status-update', handleStatusUpdate);
    };
  }, [password, currentField]);

  // Validate password with PLC when password changes
  useEffect(() => {
    if (currentField === 'password' && password.length === 4) {
      // Send password to PLC for validation (this will trigger proceed_status update)
      validatePasswordWithPLC(password);
    } else {
      setIsPasswordValid(false);
    }
  }, [password, currentField]);

  const validatePasswordWithPLC = async (pin: string) => {
    try {
      // Send password to PLC for real-time validation
      // The PLC responds by setting auth.proceed_status = true/false
      await apiService.validatePassword(pin);
    } catch (error) {
      // Password validation failed, PLC will not set proceed_status
      console.debug('Password validation in progress...');
    }
  };

  const handleCancel = () => {
    setPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setIsChangingPassword(false);
    setCurrentField('password');
    setIsPasswordValid(false);
    setError('');
    onCancel();
  };

  const handleProceed = async () => {
    if (!isPasswordValid || password.length !== 4) {
      return; // Button should be disabled anyway
    }
    setError('');
    try {
      // Actually proceed with the validated password
      await apiService.proceedWithPassword(password);
      onProceed(password);
      setPassword('');
      setIsPasswordValid(false);
    } catch (error) {
      console.error('Failed to proceed with password:', error);
      setError('Failed to proceed. Please try again.');
    }
  };

  const handleChangePassword = () => {
    if (password.length !== 4) {
      setError('Please enter your current 4-digit PIN');
      return;
    }
    if (newPassword.length !== 4) {
      setError('Please enter a new 4-digit PIN');
      return;
    }
    if (confirmNewPassword.length !== 4) {
      setError('Please confirm your new 4-digit PIN');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New PINs do not match');
      return;
    }
    
    setError('');
    onChangePassword(password, newPassword);
    setPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setIsChangingPassword(false);
    setCurrentField('password');
    setIsPasswordValid(false);
  };

  const toggleChangePasswordMode = () => {
    setIsChangingPassword(!isChangingPassword);
    setError('');
    setPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setCurrentField('password');
    setIsPasswordValid(false);
  };

  const handleNumberInput = (digit: string) => {
    setError(''); // Clear any previous errors
    
    switch (currentField) {
      case 'password':
        if (password.length < 4) {
          const newPassword = password + digit;
          setPassword(newPassword);
          setIsPasswordValid(false); // Reset validation until PLC responds
          // Immediately invalidate PLC proceed status when PIN is modified
          if (currentField === 'password' && !isChangingPassword) {
            apiService.invalidatePassword().catch(console.error);
          }
        }
        break;
      case 'newPassword':
        if (newPassword.length < 4) {
          setNewPassword(prev => prev + digit);
        }
        break;
      case 'confirmNewPassword':
        if (confirmNewPassword.length < 4) {
          setConfirmNewPassword(prev => prev + digit);
        }
        break;
    }
  };

  const handleClear = () => {
    setError('');
    setIsPasswordValid(false);
    
    // Immediately invalidate PLC proceed status when PIN is cleared
    if (currentField === 'password' && !isChangingPassword) {
      apiService.invalidatePassword().catch(console.error);
    }
    
    switch (currentField) {
      case 'password':
        setPassword('');
        break;
      case 'newPassword':
        setNewPassword('');
        break;
      case 'confirmNewPassword':
        setConfirmNewPassword('');
        break;
    }
  };

  const handleBackspace = () => {
    setError('');
    
    switch (currentField) {
      case 'password':
        const newPassword = password.slice(0, -1);
        setPassword(newPassword);
        setIsPasswordValid(false);
        // Immediately invalidate PLC proceed status when PIN is modified
        if (currentField === 'password' && !isChangingPassword) {
          apiService.invalidatePassword().catch(console.error);
        }
        break;
      case 'newPassword':
        setNewPassword(prev => prev.slice(0, -1));
        break;
      case 'confirmNewPassword':
        setConfirmNewPassword(prev => prev.slice(0, -1));
        break;
    }
  };

  const getCurrentFieldValue = () => {
    switch (currentField) {
      case 'password':
        return password;
      case 'newPassword':
        return newPassword;
      case 'confirmNewPassword':
        return confirmNewPassword;
      default:
        return '';
    }
  };

  const getCurrentFieldLabel = () => {
    if (!isChangingPassword) return 'Enter 4-Digit PIN';
    
    switch (currentField) {
      case 'password':
        return 'Current PIN';
      case 'newPassword':
        return 'New PIN';
      case 'confirmNewPassword':
        return 'Confirm New PIN';
      default:
        return 'Enter PIN';
    }
  };

  const getPasswordDisplayText = () => {
    const value = getCurrentFieldValue();
    const dots = '●'.repeat(value.length);
    const remaining = 4 - value.length;
    const placeholders = '○'.repeat(remaining);
    return dots + placeholders;
  };

  const handleNext = () => {
    if (!isChangingPassword) {
      handleProceed();
      return;
    }

    switch (currentField) {
      case 'password':
        if (password.length === 4) {
          setCurrentField('newPassword');
          setError('');
        } else {
          setError('Please enter your current 4-digit PIN');
        }
        break;
      case 'newPassword':
        if (newPassword.length === 4) {
          setCurrentField('confirmNewPassword');
          setError('');
        } else {
          setError('Please enter a new 4-digit PIN');
        }
        break;
      case 'confirmNewPassword':
        handleChangePassword();
        break;
    }
  };

  const canProceed = () => {
    if (!isChangingPassword) {
      // For main password entry, only enable if PLC validates the password
      return password.length === 4 && isPasswordValid;
    }
    
    // For password change flow
    switch (currentField) {
      case 'password':
        return password.length === 4;
      case 'newPassword':
        return newPassword.length === 4;
      case 'confirmNewPassword':
        return confirmNewPassword.length === 4 && newPassword === confirmNewPassword;
      default:
        return false;
    }
  };

  const getFieldStatusColor = () => {
    if (currentField !== 'password' || isChangingPassword) {
      return currentTheme.colors.border;
    }
    
    if (password.length !== 4) {
      return currentTheme.colors.border;
    }
    
    return isPasswordValid ? currentTheme.colors.success : currentTheme.colors.danger;
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={handleCancel}
      title="PIN Required"
      subtitle={isChangingPassword ? "Change your PIN" : "Enter 4-digit PIN to continue"}
      width="w-[600px]"
      height="h-auto"
    >
      <div className="p-6 space-y-6">
        {/* Current Field Display */}
        <div className="text-center">
          <label 
            className="block text-lg font-medium mb-4"
            style={{ color: currentTheme.colors.textPrimary }}
          >
            {getCurrentFieldLabel()}
          </label>
          
          {/* PIN Display with 4-digit layout */}
          <div 
            className="mx-auto w-80 h-16 flex items-center justify-center rounded-lg border-2 text-4xl font-mono tracking-wider"
            style={{
              backgroundColor: currentTheme.colors.secondary,
              borderColor: getFieldStatusColor(),
              color: currentTheme.colors.textPrimary,
            }}
          >
            {getCurrentFieldValue().length > 0 ? (
              getPasswordDisplayText()
            ) : (
              <span className="text-gray-500 text-lg">Enter PIN</span>
            )}
          </div>
          
          {/* Status indicator for main password field */}
          {!isChangingPassword && currentField === 'password' && password.length === 4 && (
            <div className="mt-2 text-sm">
              {isPasswordValid ? (
                <span style={{ color: currentTheme.colors.success }}>✓ PIN Verified</span>
              ) : (
                <span style={{ color: currentTheme.colors.danger }}>✗ Invalid PIN</span>
              )}
            </div>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="flex justify-center">
          <div className="grid grid-cols-3 gap-4 w-80">
            {/* Numbers 1-9 */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberInput(num.toString())}
                disabled={getCurrentFieldValue().length >= 4}
                className="h-16 text-2xl font-bold rounded-lg border-2 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: currentTheme.colors.secondary,
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.textPrimary,
                }}
              >
                {num}
              </button>
            ))}
            
            {/* Bottom row: Clear, 0, Backspace */}
            <button
              onClick={handleClear}
              className="h-16 text-lg font-bold rounded-lg border-2 transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: currentTheme.colors.tertiary,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.textPrimary,
              }}
            >
              Clear
            </button>
            
            <button
              onClick={() => handleNumberInput('0')}
              disabled={getCurrentFieldValue().length >= 4}
              className="h-16 text-2xl font-bold rounded-lg border-2 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: currentTheme.colors.secondary,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.textPrimary,
              }}
            >
              0
            </button>
            
            <button
              onClick={handleBackspace}
              disabled={getCurrentFieldValue().length === 0}
              className="h-16 text-lg font-bold rounded-lg border-2 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: currentTheme.colors.tertiary,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.textPrimary,
              }}
            >
              ⌫
            </button>
          </div>
        </div>

        {/* Field Navigation for PIN Change */}
        {isChangingPassword && (
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setCurrentField('password')}
              className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                currentField === 'password' 
                  ? 'font-bold' 
                  : 'opacity-60 hover:opacity-80'
              }`}
              style={{
                backgroundColor: currentField === 'password' ? currentTheme.colors.brand : 'transparent',
                color: currentField === 'password' ? '#ffffff' : currentTheme.colors.textSecondary,
              }}
            >
              Current
            </button>
            <button
              onClick={() => setCurrentField('newPassword')}
              className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                currentField === 'newPassword' 
                  ? 'font-bold' 
                  : 'opacity-60 hover:opacity-80'
              }`}
              style={{
                backgroundColor: currentField === 'newPassword' ? currentTheme.colors.brand : 'transparent',
                color: currentField === 'newPassword' ? '#ffffff' : currentTheme.colors.textSecondary,
              }}
            >
              New
            </button>
            <button
              onClick={() => setCurrentField('confirmNewPassword')}
              className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                currentField === 'confirmNewPassword' 
                  ? 'font-bold' 
                  : 'opacity-60 hover:opacity-80'
              }`}
              style={{
                backgroundColor: currentField === 'confirmNewPassword' ? currentTheme.colors.brand : 'transparent',
                color: currentField === 'confirmNewPassword' ? '#ffffff' : currentTheme.colors.textSecondary,
              }}
            >
              Confirm
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div 
            className="text-sm p-3 rounded-lg border text-center"
            style={{
              backgroundColor: `${currentTheme.colors.danger}20`,
              borderColor: currentTheme.colors.danger,
              color: currentTheme.colors.danger,
            }}
          >
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={handleCancel}
            className="px-6 py-3 rounded-lg border font-medium transition-all duration-200 hover:opacity-80"
            style={{
              backgroundColor: 'transparent',
              borderColor: currentTheme.colors.border,
              color: currentTheme.colors.textSecondary,
            }}
          >
            Cancel
          </button>

          <div className="flex space-x-3">
            <button
              onClick={toggleChangePasswordMode}
              className="px-6 py-3 rounded-lg border font-medium transition-all duration-200 hover:opacity-80"
              style={{
                backgroundColor: currentTheme.colors.secondary,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.textPrimary,
              }}
            >
              {isChangingPassword ? 'Back to Login' : 'Change PIN'}
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: canProceed() ? currentTheme.colors.brand : currentTheme.colors.border,
                color: canProceed() ? '#ffffff' : currentTheme.colors.textSecondary,
              }}
              disabled={!canProceed()}
            >
              {isChangingPassword && currentField !== 'confirmNewPassword' ? 'Next' : 
               isChangingPassword ? 'Update PIN' : 'Proceed'}
            </button>
          </div>
        </div>
      </div>
    </ModalTemplate>
  );
};

export default PasswordInputModal; 