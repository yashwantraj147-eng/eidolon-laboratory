const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('eidolonDesktop', {
  isDesktop: true,
  exportData: (defaultName, content) => ipcRenderer.invoke('save-file-dialog', { defaultName, content }),
  importData: () => ipcRenderer.invoke('open-file-dialog'),
  onMenuAction: (callback) => {
    const handler = (_event, action) => callback(action);
    ipcRenderer.on('menu-action', handler);
    return () => ipcRenderer.removeListener('menu-action', handler);
  },
  onNavWorkspace: (callback) => {
    const handler = (_event, workspaceId) => callback(workspaceId);
    ipcRenderer.on('nav-workspace', handler);
    return () => ipcRenderer.removeListener('nav-workspace', handler);
  },
});
