import { BrowserWindow, MenuItemConstructorOptions } from 'electron'

const { Menu, app } = require('electron')

const createMenu = (win: BrowserWindow): void => {
  const config: MenuItemConstructorOptions[] = [
    {
      label: 'Lock Analyzer',
      submenu: [
        {
          label: '退出',
          role: 'quit'
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'SelectAll',
          role: 'selectAll'
        },
        {
          label: 'Undo',
          role: 'undo'
        },
        {
          label: 'Redo',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          role: 'cut'
        },

        {
          label: 'Copy',
          role: 'copy'
        },
        {
          label: 'Paste',
          role: 'paste'
        }
      ]
    },
    {
      label: 'Hotkey',
      submenu: [
        {
          label: '分析',
          accelerator: 'CommandOrControl+J',
          click: (): void => {
            win.webContents.send('analyze')
          }
        },
        {
          label: '返回分析',
          accelerator: 'CommandOrControl+B',
          click: (): void => {
            win.webContents.send('back')
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: '打开开发者工具',
          role: 'toggleDevTools'
        },
        {
          label: '最小化',
          role: 'minimize'
        }
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(config))
}

export { createMenu }
