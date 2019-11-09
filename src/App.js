import React, { useState, useEffect } from 'react';
import { Gallery } from './components/Gallery';

import './App.scss';
import "react-toggle/style.css";
// import { CinemaHall } from './components/CinemaHall';
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
const {
  saveThemeToCache,
  fetchThemeFromStorage,
  getMemorizedTheme,
  memorizePhotos,
  getMemorizedPhotos,
} = remote.require('../public/electron');

const MENU_KEY_HOME = 'home';
const MENU_KEY_GALLERY = 'gallery';

export const THEME_LIGHT = 'light';
export const THEME_DARK = 'dark';

const memorizedTheme = getMemorizedTheme();
const memorizedPhotos = getMemorizedPhotos();

function App() {
  // console.log('memorizedTheme:', memorizedTheme);
  const [isFooterVisible] = useState(true);
  const [photos, setPhotos] = useState(memorizedPhotos || []);
  const [theme, setTheme] = useState(memorizedTheme);
  const [currentMenuKey, setCurrentMenuKey] = useState(MENU_KEY_HOME);

  // console.log('photos:', photos, 'theme', theme, 'memorizedPhotos', memorizedPhotos);

  useEffect(() => {
    fetchThemeFromStorage().then(theme => {
      // console.log('fetchThemeFromStorage in renderer:', theme);
      setTheme(theme);
    });
  }, []);

  useEffect(() => {
    photos.length && setCurrentMenuKey(MENU_KEY_GALLERY);
  }, [photos.length]);

  const toggleTheme = () => {
    const newTheme = theme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;

    setTheme(newTheme);
    // console.log('toggleTheme to:', newTheme);
    saveThemeToCache(newTheme);
  };

  const openDirectory = async () => {
    const { filePaths = [] } = await remote.dialog.showOpenDialog({ properties: ['openDirectory'] });

    // console.log('filePaths:', filePaths);
    const mediaFolder = filePaths[0];

    if (mediaFolder) {
      const photoPaths = getRelativeFiles(mediaFolder, isImage);
      const photos = await formatPhotos(mediaFolder, photoPaths);

      setPhotos(photos);

      console.log('memorizePhotos:', photos);

      memorizePhotos(photos);
    }
  }

  const getActiveCls = (menuKey) => {
    return menuKey === currentMenuKey ? 'active' : '';
  }

  const onGalleryMenuClick = () => setCurrentMenuKey(MENU_KEY_GALLERY);
  const gotoHome = () => {
    setCurrentMenuKey(MENU_KEY_HOME);
  };

  return (
    <div className={ `App ${theme}` }>
      <nav className="menu-wrapper">
        <ul className="menu">
          <li
            className={ `icon-wrapper ${ getActiveCls(MENU_KEY_HOME) }` }
            onClick={ gotoHome }
          >
            <svg t="1573283980416" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7948"><path d="M946.5 505L560.1 118.8l-25.9-25.9c-12.3-12.2-32.1-12.2-44.4 0L77.5 505c-12.3 12.3-18.9 28.6-18.8 46 0.4 35.2 29.7 63.3 64.9 63.3h42.5V940h691.8V614.3h43.4c17.1 0 33.2-6.7 45.3-18.8 12.1-12.1 18.7-28.2 18.7-45.3 0-17-6.7-33.1-18.8-45.2zM568 868H456V664h112v204z m217.9-325.7V868H632V640c0-22.1-17.9-40-40-40H432c-22.1 0-40 17.9-40 40v228H238.1V542.3h-96l370-369.7 23.1 23.1L882 542.3h-96.1z" p-id="7949"></path></svg>
          </li>
          <li
            className={ `icon-wrapper gallery ${ getActiveCls(MENU_KEY_GALLERY) }` }
            onClick={ onGalleryMenuClick }
          >
            <svg t="1573284011191" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8066"><path d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32z m-40 632H136v-39.9l138.5-164.3 150.1 178L658.1 489 888 761.6V792z m0-129.8L664.2 396.8c-3.2-3.8-9-3.8-12.2 0L424.6 666.4l-144-170.7c-3.2-3.8-9-3.8-12.2 0L136 652.7V232h752v430.2z" p-id="8067"></path><path d="M304 456c48.6 0 88-39.4 88-88s-39.4-88-88-88-88 39.4-88 88 39.4 88 88 88z m0-116c15.5 0 28 12.5 28 28s-12.5 28-28 28-28-12.5-28-28 12.5-28 28-28z" p-id="8068"></path></svg>
          </li>
        </ul>
      </nav>

      <main className="main">
        {
          currentMenuKey === MENU_KEY_HOME ?
            <DirectoryOpener onClick={openDirectory} theme={theme} />:

            <div>
              {!photos.length ? <p className="no-photo-tips">
                No photos yet. Try to goto <button className="go-home-btn" onClick={ gotoHome }>Home</button> and open your photo directory
              </p> :

              <div>
                <Gallery theme={theme} photos={photos} />
                {/* <CinemaHall theme={theme} /> */}
              </div>}
            </div>
        }
      </main>

      {isFooterVisible && <AppFooter theme={theme} onThemeToggle={toggleTheme}></AppFooter>}
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
