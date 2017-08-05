import { findSocket, findThread, IThread, findTeam, ITeam } from './monk'
import { postNewMessage, answerInThread, User } from './slack'
import * as SocketIO from 'socket.io'

function getSocketId(socket: SocketIO.Socket): string | undefined {
  return (socket.handshake.query || {}).socketId
}

function getTeamId(socket: SocketIO.Socket): string | undefined {
  return (socket.handshake.query || {}).teamId
}

function getChannelId(socket: SocketIO.Socket): string | undefined {
  return (socket.handshake.query || {}).channelId
}

export function Websocket(io: SocketIO.Server) {
  return {
    startServer() {
      io.on('connection', socket => {
        const socketId = getSocketId(socket)
        const teamId = getTeamId(socket)
        let channelId = getChannelId(socket)

        if (!socketId) {
          console.log('no socketId, ignore')
          return
        }

        if (!teamId) {
          console.log('no teamId, ignore')
          return
        }

        let thread: IThread
        let team: ITeam

        socket.on('disconnect', () => {
          // console.log('user disconnected')
        })

        socket.on('chat message', async (msg: string) => {
          if (!thread) {
            const res = await findSocket(socketId, teamId)
            if (res) {
              thread = res
            }
          }

          if (!team) {
            const res = await findTeam(teamId)
            if (res) {
              team = res
            }
          }

          if (thread) {
            answerInThread(team, msg, thread)
          } else {
            if (!channelId) {
              channelId = team.channels[0]
            }
            postNewMessage(team, msg, socketId, channelId)
          }

          socket.emit(
            'sent message',
            JSON.stringify({
              text: msg,
            })
          )
        })
      })
    },

    answerUser({
      teamId,
      user,
      text,
      threadId,
      id,
    }: {
      teamId: string
      user: User
      text: string
      threadId: string
      id: string
    }) {
      return findThread(threadId, teamId).then(res => {
        if (res) {
          const socket = Object.keys(io.sockets.sockets).find(k => {
            return getSocketId(io.sockets.sockets[k]) === res.socketId
          })

          if (socket) {
            io.sockets.sockets[socket].emit(
              'new message',
              JSON.stringify({
                user,
                text,
                id,
              })
            )
          }
        }
      })
    },

    acknowledgeReception({
      teamId,
      text,
      id,
      threadId,
      channel,
      socketId,
    }: {
      teamId: string
      text: string
      id: string
      threadId: string
      channel: string
      socketId?: string
    }) {
      return Promise.resolve()
        .then(() => {
          if (socketId) {
            return { socketId, threadId: '', teamId, channel }
          }
          return findThread(threadId, teamId)
        })
        .then(res => {
          if (res) {
            const socket = Object.keys(io.sockets.sockets).find(k => {
              return getSocketId(io.sockets.sockets[k]) === res.socketId
            })

            if (socket) {
              io.sockets.sockets[socket].emit(
                'received message',
                JSON.stringify({
                  text,
                  id,
                })
              )
            }
          }
        })
    },
  }
}
