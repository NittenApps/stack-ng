/**
 * Represents the data payload for a dialog message.
 */
export interface DialogData {
  /**
   * The main message content shown in the dialog.
   */
  message: string;

  /**
   * Optional title displayed at the top of the dialog.
   */
  title?: string;

  /**
   * The time the dialog was created or last updated.
   * Can be provided as a JavaScript Date or an ISO string.
   */
  timestamp: Date | string;
}
