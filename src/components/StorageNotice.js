import React from 'react';
import { MODE_DEVICE, MODE_SESSION } from '../utils/resumeStore';

/**
 * Explains where the user's resumes live and what happens when they close the
 * tab.
 *
 * This banner exists because the browser's own close prompt cannot be given
 * custom wording — it says only "Leave site?". Without something on the page
 * saying the data is about to be erased, that dialog is meaningless.
 */
const StorageNotice = ({ mode, onChangeMode, needsBackup, onBackup, storageError }) => {
  const isSession = mode === MODE_SESSION;

  return (
    <div className={`storage-notice ${isSession ? 'is-session' : 'is-device'}`}>
      <div className="storage-notice-head">
        <i className={`fas ${isSession ? 'fa-user-shield' : 'fa-hard-drive'}`}></i>
        <span>{isSession ? 'Erased when you close this tab' : 'Kept on this device'}</span>
      </div>

      <p className="storage-notice-body">
        {isSession ? (
          <>
            Your resume lives only in this tab. Refreshing is safe, but closing it wipes everything —
            nothing was ever sent to a server, so we cannot get it back for you.{' '}
            <strong>Download a backup to keep it.</strong>
          </>
        ) : (
          <>
            Your resumes stay in this browser between visits, on this device only. Clearing your
            browser data still removes them, so keep a backup.
          </>
        )}
      </p>

      {needsBackup && (
        <button type="button" className="storage-notice-backup" onClick={onBackup}>
          <i className="fas fa-download"></i> Back up now
        </button>
      )}

      <label className="storage-notice-toggle">
        <input
          type="checkbox"
          checked={!isSession}
          onChange={(e) => onChangeMode(e.target.checked ? MODE_DEVICE : MODE_SESSION)}
        />
        <span>Keep my resumes on this device</span>
      </label>

      {storageError && (
        <p className="storage-notice-error" role="alert">
          <i className="fas fa-triangle-exclamation"></i> {storageError}
        </p>
      )}
    </div>
  );
};

export default StorageNotice;
