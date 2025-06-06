import type { PLCStatus } from '../config/api-endpoints';

/**
 * Check if a session is currently active (running_state flag indicates active session)
 */
export function isSessionActive(session: PLCStatus['session']): boolean {
  return session.running_state;
}

/**
 * Get the current session state as a string
 */
export function getSessionState(session: PLCStatus['session']): string {
  if (session.equalise_state) return 'equalise';
  if (session.pressuring_state) return 'pressuring';
  if (session.stabilising_state) return 'stabilising';
  if (session.depressurise_state) return 'depressurise';
  if (session.running_state) return 'running';
  if (session.stop_state) return 'stop';
  return 'unknown';
}

/**
 * Check if the session is idle (equalise state and not running)
 */
export function isSessionIdle(session: PLCStatus['session']): boolean {
  return session.equalise_state && !session.running_state;
} 