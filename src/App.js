import React, { useState } from 'react';
import { Gallery, THEME_LIGHT, THEME_DARK } from './components/Gallery';

import './App.css';
import "react-toggle/style.css";
import { CinemaHall } from './components/CinemaHall';
import { DirectoryOpener } from './components/DirectoryOpener';
import { AppFooter } from './components/AppFooter';

const { remote } = window.require('electron');
const fs = window.require('fs');
const path = window.require('path');
const url = window.require('url');
const isImage = require('is-image');
const { promisify } = window.require('util');
const sizeOf = promisify(window.require('image-size'));
const { extractName } = require('./utils/file');

function App() {
  const [isFooterVisible] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [theme, setTheme] = useState(THEME_LIGHT);

  const toggleTheme = () => {
    setTheme(theme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT);
  };

  const openDirectory = async () => {
    const { filePaths = [] } = await remote.dialog.showOpenDialog({ properties: ['openDirectory'] });

    console.log('filePaths:', filePaths);
    const mediaFolder = filePaths[0];

    if (mediaFolder) {
      const photoPaths = getRelativeFiles(mediaFolder, isImage);

      setPhotos(await formatPhotos(mediaFolder, photoPaths));
    }
  }

  console.log('photos:', photos);

  return (
    <div className={ `App ${theme}` }>
      <main className="main">
        {
          !photos.length ?
            <DirectoryOpener onClick={openDirectory} theme={theme} />:

            <>
              <div
                role="button"
                aria-label="go back to open directory"
                title="Previous page"
                className="back"
              ></div>

              <div>
                <Gallery theme={theme} photos={photos} />
                <CinemaHall theme={theme} />
              </div>
            </>
        }
      </main>

      {isFooterVisible && <AppFooter onThemeToggle={toggleTheme}></AppFooter>}
    </div>
  );
}

export default App;

function getRelativeFiles(folder, predicate) {
  return findAllFiles(folder, predicate)
    .map(filePath => path.relative(folder, filePath))
}

/**
 * Find all the files in the target folder recursively.
 * @param {string} folder directory
 * @param {(path: string) => boolean} predicate directory ignored
 * @param {string} excludedFolder directory ignored
 * @returns {string[]} file paths
 */
function findAllFiles(folder, predicate = () => true, excludedFolder = 'node_modules') {
  return fs.readdirSync(folder).reduce((acc, cur) => {
    // console.log('folder', folder, 'cur:', cur);

    if (folder.endsWith(`/${excludedFolder}`)) {
      return acc;
    }

    const filePath = path.join(folder, cur);

    if (fs.statSync(filePath).isDirectory()) {
      acc.push(...findAllFiles(filePath, predicate));
    } else {
      predicate(filePath) && acc.push(filePath);
    }

    return acc;
  }, []);
}

async function formatPhotos(mediaFolder, photoPaths) {
  const photos = await Promise.all(photoPaths.map(async src => {
    let dimensions = { width: 1, height: 1 };

    try {
      dimensions = await sizeOf(mediaFolder + '/' + src);
    } catch (error) {
      console.error(error);
    }

    return {
      ...normalizePath(mediaFolder, src),

      width: dimensions.width,
      height: dimensions.height,
    };
  }));

  return photos;
}

function normalizePath(mediaFolder, filePath) {
  const src = url.format({
    pathname: path.join(mediaFolder, filePath),
    protocol: 'file:',
    slashes: true
  });

  return {
    src,
    caption: extractName(filePath),
  };
}
