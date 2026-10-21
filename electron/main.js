const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 700,
    backgroundColor: '#050811',
    title: 'EIDOLON // Synthetic Reality Terminal',
    frame: true,
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    // mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Application Menu
  const menuTemplate = [
    {
      label: 'EIDOLON',
      submenu: [
        { label: 'About Eidolon Laboratory', click: () => {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'About EIDOLON',
            message: 'EIDOLON — Living Laboratory for Artificial Realities\nVersion 1.0.0-PROD\nClassified Directorate Access',
          });
        }},
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: 'Simulations',
      submenu: [
        { label: 'Command Console', accelerator: 'CmdOrCtrl+K', click: () => mainWindow.webContents.send('menu-action', 'open-console') },
        { label: 'Pause/Resume Simulation', accelerator: 'Space', click: () => mainWindow.webContents.send('menu-action', 'toggle-pause') },
        { label: 'Single Step', accelerator: 'CmdOrCtrl+Right', click: () => mainWindow.webContents.send('menu-action', 'step-simulation') },
        { type: 'separator' },
        { label: 'Take Reality Snapshot', accelerator: 'CmdOrCtrl+S', click: () => mainWindow.webContents.send('menu-action', 'create-snapshot') },
      ],
    },
    {
      label: 'Workspaces',
      submenu: [
        { label: 'Command Center', accelerator: 'CmdOrCtrl+1', click: () => mainWindow.webContents.send('nav-workspace', 'command-center') },
        { label: 'Reality Observatory (3D)', accelerator: 'CmdOrCtrl+2', click: () => mainWindow.webContents.send('nav-workspace', 'observatory') },
        { label: 'Entity Atlas', accelerator: 'CmdOrCtrl+3', click: () => mainWindow.webContents.send('nav-workspace', 'entity-atlas') },
        { label: 'Anomaly Laboratory', accelerator: 'CmdOrCtrl+4', click: () => mainWindow.webContents.send('nav-workspace', 'anomaly-lab') },
        { label: 'Temporal Lab', accelerator: 'CmdOrCtrl+5', click: () => mainWindow.webContents.send('nav-workspace', 'temporal-lab') },
        { label: 'Experiment Workbench', accelerator: 'CmdOrCtrl+6', click: () => mainWindow.webContents.send('nav-workspace', 'experiment-workbench') },
        { label: 'Signal Room', accelerator: 'CmdOrCtrl+7', click: () => mainWindow.webContents.send('nav-workspace', 'signal-room') },
        { label: 'Research Tree', accelerator: 'CmdOrCtrl+8', click: () => mainWindow.webContents.send('nav-workspace', 'research-tree') },
        { label: 'Archive', accelerator: 'CmdOrCtrl+9', click: () => mainWindow.webContents.send('nav-workspace', 'archive') },
        { label: 'Settings & Diagnostics', accelerator: 'CmdOrCtrl+0', click: () => mainWindow.webContents.send('nav-workspace', 'settings') },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for Export/Import
ipcMain.handle('save-file-dialog', async (event, { defaultName, content }) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export EIDOLON Reality Data',
    defaultPath: defaultName || 'eidolon_reality_export.json',
    filters: [{ name: 'JSON Records', extensions: ['json'] }],
  });

  if (!canceled && filePath) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true, filePath };
  }
  return { success: false };
});

ipcMain.handle('open-file-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Import EIDOLON Reality Matrix',
    filters: [{ name: 'JSON Records', extensions: ['json'] }],
    properties: ['openFile'],
  });

  if (!canceled && filePaths.length > 0) {
    const data = fs.readFileSync(filePaths[0], 'utf-8');
    return { success: true, data, filePath: filePaths[0] };
  }
  return { success: false };
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
