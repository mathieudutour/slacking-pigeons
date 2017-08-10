import * as SocketIO from 'socket.io'
import {
  findSocket,
  findThread,
  IThread,
  findTeam,
  ITeam,
  addEmailAndRedirectToThread,
  recordSendEmail,
} from './monk'
import { postNewMessage, answerInThread, User } from './slack'
import { sendEmail } from './email'

function getSocketId(socket: SocketIO.Socket): string | undefined {
  return (socket.handshake.query || {}).socketId
}

function getTeamId(socket: SocketIO.Socket): string | undefined {
  return (socket.handshake.query || {}).teamId
}

function getChannelId(socket: SocketIO.Socket): string | undefined {
  return (socket.handshake.query || {}).channelId
}

function getredirectURL(socket: SocketIO.Socket): string {
  return (
    (socket.handshake.query || {}).redirectURL ||
    socket.handshake.headers.origin
  )
}

export function Websocket(io: SocketIO.Server) {
  return {
    startServer() {
      io.on('connection', socket => {
        const socketId = getSocketId(socket)
        const teamId = getTeamId(socket)
        let channelId = getChannelId(socket)
        const redirectURL = getredirectURL(socket)

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

        socket.on('send email', async (email: string) => {
          await addEmailAndRedirectToThread(
            socketId,
            teamId,
            email,
            redirectURL
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
      return findThread(teamId, threadId).then(thread => {
        if (thread) {
          const socket = Object.keys(io.sockets.sockets).find(k => {
            return getSocketId(io.sockets.sockets[k]) === thread.socketId
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
          } else if (
            thread.redirectURL &&
            thread.email &&
            (!thread.sentEmailAt || thread.sentEmailAt < thread.lastSeen!)
          ) {
            sendEmail(thread, teamId, text)
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
          return findThread(teamId, threadId)
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
