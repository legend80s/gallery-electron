import React from 'react';
import Toggle from 'react-toggle';

import './AppFooter.css';

export function AppFooter({ theme, onThemeToggle }) {
  return <footer className="App-footer">
    <div className="toggle-wrapper">
      <span>Theme</span>

      <Toggle
        className="toggle"
        defaultChecked={false}
        icons={false}
        onChange={onThemeToggle}
      />
    </div>

    <p className="tips-wrapper">
      <span className="tips">
        Powered by @gallery-server
      </span>
      <a
        className="App-link"
        href="https://github.com/legend80s/gallery-server"
        target="_blank"
        rel="noopener noreferrer"
      >
        Give a <span role="img" aria-label="github star">⭐️</span> if this project helped you!
      </a>
    </p>
  </footer>;
}
