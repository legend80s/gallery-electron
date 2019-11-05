import React, { useState, useEffect } from 'react';

import './DirectoryOpener.css';

export function DirectoryOpener({ theme, onClick }) {
  return <div className={ `directory-opener-wrapper ${theme}` }>
    <div
      className="directory-opener"
      onClick={onClick}>Open Directory
    </div>
  </div>
}
