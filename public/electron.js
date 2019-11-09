const { app, BrowserWindow } = require('electron')
const storage = require('electron-storage-promised');

// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win;
let cachedTheme;

const isDev = process.env.ELECTRON_ENV === 'development';

async function createWindow () {
  // 创建浏览器窗口。
  win = new BrowserWindow({
    width: 1000,
    height: 666,
    backgroundColor: await getThemeBgColor(),
    webPreferences: {
      nodeIntegration: true,
      // Development can be false to enable load image from local file system
      webSecurity: !isDev,
    },
    show: true,
  });

  // 加载index.html文件
  if (isDev) {
    win.loadURL('http://localhost:3000/');
    // win.webContents.openDevTools();
  } else {
    win.loadFile('./build/index.html');
  }

  // 打开开发者工具
  // win.webContents.openDevTools()

  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', async () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    win = null;

    // console.log('window closed saveTheme', cachedTheme);
    cachedTheme && saveTheme(cachedTheme);
  });
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow)

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow()
  }
})

const THEME_LIGHT = 'light';
const THEME_DARK = 'dark';

async function fetchTheme() {
  try {
    const theme = await storage.get('theme');

    // console.log('theme from storage:', theme);

    return theme === THEME_DARK ? THEME_DARK : THEME_LIGHT;
  } catch (error) {
    console.error('get theme from storage', error.message);

    return THEME_LIGHT;
  }
}

async function getThemeBgColor() {
  const LIGHT_BG_COLOR = '#ffefd5';
  const DARK_BG_COLOR = '#333333';

  const theme = await fetchTheme();

  return theme === THEME_DARK ? DARK_BG_COLOR : LIGHT_BG_COLOR;
}

/**
 * @param {string} theme
 */
exports.saveThemeToCache = function saveThemeToCache(theme) {
  console.log('saveThemeToCache:', theme);
  cachedTheme = theme;
}

/**
 * @param {string} theme
 */
exports.getLatestTheme = function getLatestTheme() {
  return cachedTheme;
}

exports.fetchTheme = fetchTheme;

function saveTheme(theme) {
  if (!theme) { return; }
  // console.log('saveTheme to storage:', theme);

  storage.set('theme', theme)
    .then(() => { console.log('theme', theme, ' saved successfully'); })
    .catch((error) => { console.error('saveTheme', error); });
}
