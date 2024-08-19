import { ElectronAPI } from '@electron-toolkit/preload'
import { EventType } from '@preload/type'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      on: (event: EventType, callback: () => void) => void
      off: (event: EventType, callback: () => void) => void
    }
  }
}
