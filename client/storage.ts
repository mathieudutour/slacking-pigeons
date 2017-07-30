var socketId: string

const STORAGE_KEY = '__slacking_pigeons_socketId'

export default function getSocketId () {
  if (socketId) {
    return socketId
  }

  // load from storage
  if (localStorage[STORAGE_KEY]) {
    socketId = localStorage[STORAGE_KEY]
  } else {
    // create a new ID
    socketId = (Date.now() + Date.now() * Math.random()).toFixed(0)
    localStorage[STORAGE_KEY] = socketId
  }

  return socketId
}
