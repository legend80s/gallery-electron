import React from 'react';

import './DirectoryOpener.scss';

export function DirectoryOpener({ theme, onClick }) {
  return <div className={ `directory-opener-wrapper ${theme}` }>
    <div
      className="directory-opener"
      onClick={onClick}>Open Photo Directory
    </div>
  </div>
}
