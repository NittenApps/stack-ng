/** Severity level assigned to an API message. */
export enum MessageLevel {
  FATAL = 'FATAL',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
  OK = 'OK',
  TOO_BUSY = 'TOO_BUSY',
}

/** Describes a message returned by the API. */
export type ApiMessage = {
  /** Severity level of the message. */
  level: MessageLevel;
  /** Application-specific message code. */
  code: string;
  /** Human-readable message text. */
  message: string;
  /** Additional details about the message, when available. */
  detail?: string;
};
