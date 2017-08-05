let socketId: string

const STORAGE_KEY = '__slacking_pigeons_socketId'

export function getSocketId() {
  if (socketId) {
    return socketId
  }

  if (location.search && location.search.indexOf(STORAGE_KEY) !== -1) {
    // load from url
    socketId = location.search.split(STORAGE_KEY + '=')[1].split('&')[0]
  } else if (localStorage[STORAGE_KEY]) {
    // load from localStorage
    socketId = localStorage[STORAGE_KEY]
  } else {
    // create a new ID
    // tslint:disable-next-line:insecure-random
    socketId = (Date.now() + Date.now() * Math.random()).toFixed(0)
    localStorage[STORAGE_KEY] = socketId
  }

  return socketId
}
