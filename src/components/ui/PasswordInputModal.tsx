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
  const [plcStatus, setPLCStatus] = useState<PLCStatus | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [awaitingPLCResponse, setAwaitingPLCResponse] = useState(false);

  // Monitor PLC status for button enable/disable logic
  useEffect(() => {
    const handleStatusUpdate = (status: PLCStatus) => {
      setPLCStatus(status);
      // Complete validation when PLC responds after validation request
      if (awaitingPLCResponse && currentField === 'password' && password.length === 3) {
        setIsValidating(false);
        setAwaitingPLCResponse(false);
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
  }, [awaitingPLCResponse, currentField, password]);

  // Validate PIN with backend when 3 digits are entered
  useEffect(() => {
    if (currentField === 'password' && password.length === 3) {
      validatePinWithBackend(password);
    }
  }, [password, currentField]);

  const validatePinWithBackend = async (pin: string) => {
    setIsValidating(true);
    setAwaitingPLCResponse(true);
    try {
      // Send PIN to backend for validation
      // Backend will set proceed_status and change_password_status based on PIN match
      await apiService.validatePassword(pin);
    } catch (error) {
      console.error('PIN validation failed:', error);
      setIsValidating(false);
      setAwaitingPLCResponse(false);
    }
  };

  const handleCancel = async () => {
    setError('');
    try {
      // Activate back_password bit on PLC when cancelling
      await apiService.cancelPasswordRequest();
      resetAllFields();
      onCancel();
    } catch (error) {
      console.error('Failed to cancel password request:', error);
      // Still proceed with closing the modal even if API call fails
      resetAllFields();
      onCancel();
    }
  };

  const resetAllFields = () => {
    setPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setIsChangingPassword(false);
    setCurrentField('password');
    setError('');
    setIsValidating(false);
    setAwaitingPLCResponse(false);
  };

  const handleProceed = async () => {
    if (!canProceed()) {
      return;
    }
    
    setError('');
    try {
      await apiService.proceedWithPassword(password);
      onProceed(password);
      resetAllFields();
    } catch (error) {
      console.error('Failed to proceed with password:', error);
      setError('Failed to proceed. Please try again.');
    }
  };

  const handleChangePassword = () => {
    if (password.length !== 3) {
      setError('Please enter your current 3-digit PIN');
      return;
    }
    if (newPassword.length !== 3) {
      setError('Please enter a new 3-digit PIN');
      return;
    }
    if (confirmNewPassword.length !== 3) {
      setError('Please confirm your new 3-digit PIN');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New PINs do not match');
      return;
    }
    
    setError('');
    onChangePassword(password, newPassword);
    resetAllFields();
  };

  const toggleChangePasswordMode = () => {
    setIsChangingPassword(!isChangingPassword);
    setError('');
    setPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setCurrentField('password');
    setIsValidating(false);
    setAwaitingPLCResponse(false);
  };

  const handleNumberInput = (digit: string) => {
    setError('');
    setIsValidating(false); // Clear validating state when PIN is modified
    setAwaitingPLCResponse(false);
    
    switch (currentField) {
      case 'password':
        if (password.length < 3) {
          setPassword(prev => prev + digit);
        }
        break;
      case 'newPassword':
        if (newPassword.length < 3) {
          setNewPassword(prev => prev + digit);
        }
        break;
      case 'confirmNewPassword':
        if (confirmNewPassword.length < 3) {
          setConfirmNewPassword(prev => prev + digit);
        }
        break;
    }
  };

  const handleClear = () => {
    setError('');
    setIsValidating(false); // Clear validating state when PIN is cleared
    setAwaitingPLCResponse(false);
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
    setIsValidating(false); // Clear validating state when PIN is modified
    setAwaitingPLCResponse(false);
    switch (currentField) {
      case 'password':
        setPassword(prev => prev.slice(0, -1));
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
    if (!isChangingPassword) return 'Enter 3-Digit PIN';
    
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
    const remaining = 3 - value.length;
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
        if (password.length === 3) {
          setCurrentField('newPassword');
          setError('');
        } else {
          setError('Please enter your current 3-digit PIN');
        }
        break;
      case 'newPassword':
        if (newPassword.length === 3) {
          setCurrentField('confirmNewPassword');
          setError('');
        } else {
          setError('Please enter a new 3-digit PIN');
        }
        break;
      case 'confirmNewPassword':
        handleChangePassword();
        break;
    }
  };

  // Button enable/disable logic based on PLC status
  const canProceed = () => {
    if (!plcStatus) return false;
    
    if (!isChangingPassword) {
      // Main proceed button: enabled if PLC proceed_status is true
      return password.length === 3 && plcStatus.auth.proceed_status;
    }
    
    // Password change flow
    switch (currentField) {
      case 'password':
        return password.length === 3;
      case 'newPassword':
        return newPassword.length === 3;
      case 'confirmNewPassword':
        return confirmNewPassword.length === 3 && newPassword === confirmNewPassword;
      default:
        return false;
    }
  };

  const canChangePassword = () => {
    if (!plcStatus) return false;
    // Change password button: enabled if PLC change_password_status is true (admin access)
    return password.length === 3 && plcStatus.auth.change_password_status;
  };

  const getFieldStatusColor = () => {
    if (currentField !== 'password' || isChangingPassword) {
      return currentTheme.colors.border;
    }
    
    if (password.length !== 3) {
      return currentTheme.colors.border;
    }
    
    // Show neutral color while validating or awaiting PLC response
    if (isValidating || awaitingPLCResponse) {
      return currentTheme.colors.brand;
    }
    
    if (!plcStatus) {
      return currentTheme.colors.border;
    }
    
    // Show validation colors based on PLC proceed status
    return plcStatus.auth.proceed_status ? currentTheme.colors.success : currentTheme.colors.danger;
  };

  const getPinValidationStatus = () => {
    if (currentField !== 'password' || isChangingPassword || password.length !== 3) {
      return null;
    }
    
    // Show validating message while validation is in progress
    if (isValidating || awaitingPLCResponse) {
      return {
        message: '⏳ Validating PIN...',
        color: currentTheme.colors.brand
      };
    }
    
    if (!plcStatus) {
      return null;
    }
    
    // Show validation results based on PLC proceed status
    if (plcStatus.auth.proceed_status) {
      return {
        message: plcStatus.auth.change_password_status ? '✓ Admin Access' : '✓ PIN Verified',
        color: currentTheme.colors.success
      };
    } else {
      return {
        message: '✗ Invalid PIN',
        color: currentTheme.colors.danger
      };
    }
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={handleCancel}
      title="PIN Required"
      subtitle={isChangingPassword ? "Change your PIN" : "Enter 3-digit PIN to continue"}
      width="w-[80vw] max-w-[800px]"
      height="h-[85vh] max-h-[900px]"
    >
      <div 
        className="p-6 space-y-6"
        style={{ 
          overflow: 'visible',
          maxHeight: 'none'
        }}
      >
        {/* Current Field Display */}
        <div className="text-center">
          <label 
            className="block text-lg font-medium mb-4"
            style={{ color: currentTheme.colors.textPrimary }}
          >
            {getCurrentFieldLabel()}
          </label>
          
          {/* PIN Display with 3-digit layout */}
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
          {(() => {
            const status = getPinValidationStatus();
            return status ? (
              <div className="mt-2 text-sm">
                <span style={{ color: status.color }}>{status.message}</span>
              </div>
            ) : null;
          })()}
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
              className="px-6 py-3 rounded-lg border font-medium transition-all duration-200 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: canChangePassword() || isChangingPassword ? currentTheme.colors.secondary : currentTheme.colors.border,
                borderColor: currentTheme.colors.border,
                color: canChangePassword() || isChangingPassword ? currentTheme.colors.textPrimary : currentTheme.colors.textSecondary,
              }}
              disabled={!isChangingPassword && !canChangePassword()}
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