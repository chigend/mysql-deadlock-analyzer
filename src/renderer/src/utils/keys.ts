type Key = 'Cmd' | 'Option'
export const mapKey = (key: Key): string => {
  if (key === 'Cmd') {
    return window.electron.process.platform === 'darwin' ? 'Cmd' : 'Ctrl'
  }
  return key
}
