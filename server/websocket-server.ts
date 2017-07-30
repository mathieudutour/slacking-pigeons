import {findSocket, findThread, IThread} from './monk'
import {postNewMessage, answerInThread, User} from './slack'
import * as SocketIO from 'socket.io'

function getSocketId (socket: SocketIO.Socket): string | undefined {
  return (socket.handshake.query || {}).socketId
}

export default function (io: SocketIO.Server) {
  return {
    startServer () {
      io.on('connection', socket => {
        const socketId = getSocketId(socket)
        console.log('a user connected ' + socketId)

        if (!socketId) {
          console.log('no socketId, ignore')
          return
        }

        let thread: IThread

        socket.on('disconnect', () => {
          console.log('user disconnected')
        })

        socket.on('chat message', async (msg: string) => {
          if (!thread) {
            const res = await findSocket(socketId)
            if (res) {
              thread = res
            }
          }

          if (thread) {
            answerInThread(msg, thread)
          } else {
            postNewMessage(msg, socketId)
          }

          socket.emit('sent message', JSON.stringify({
            text: msg
          }))
        })
      })
    },

    answerUser ({user, text, threadId, id}: {user: User, text: string, threadId: string, id: string}) {
      return findThread(threadId).then(res => {
        if (res) {
          let socket = Object.keys(io.sockets.sockets).find(k => {
            return getSocketId(io.sockets.sockets[k]) === res.socketId
          })

          if (socket) {
            io.sockets.sockets[socket].emit('new message', JSON.stringify({
              user, text, id
            }))
          }
        }
      })
    },

    acknowledgeReception({text, id, threadId, socketId}: {text: string, id: string, threadId: string, socketId?: string}) {
      return Promise.resolve().then(() => {
        if (socketId) {
          return {socketId, threadId: ''}
        }
        return findThread(threadId)
      }).then((res) => {
        if (res) {
          let socket = Object.keys(io.sockets.sockets).find(k => {
            return getSocketId(io.sockets.sockets[k]) === res.socketId
          })

          if (socket) {
            io.sockets.sockets[socket].emit('received message', JSON.stringify({
              text, id
            }))
          }
        }
      })
    }
  }
}
