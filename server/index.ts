import * as path from 'path'
import * as fs from 'fs'
import { IncomingMessage, ServerResponse} from 'http'
import micro from 'micro'
import {router, get, post} from 'microrouter'
import * as SocketIO from 'socket.io'
import * as slack from './slack'
import * as monk from './monk'
import Websocket from './websocket-server'

if (!process.env.OAUTH_TOKEN) {
  console.error('missing slack token')
  console.log(process.env.BOT_ID)
  console.log(process.env.VERIFICATION_TOKEN)
  console.log(process.env.OAUTH_TOKEN)
  process.exit(1)
}

const assets = {
  html: fs.readFileSync(path.join(__dirname, '../index.html')),
  js: fs.readFileSync(path.join(__dirname, './static/bundle.js'))
}

const staticServing = (key: 'html' | 'js') => async (req: IncomingMessage, res: ServerResponse) => {
  console.log('Serving asset')
  res.end(assets[key])
}

const server = micro(router(
  get('/', staticServing('html')),
  get('/bundle.js', staticServing('js')),
  get('/history/:socket', slack.getThreadHistory),
  post('/slack-incoming', slack.slackEventHandler),
  post('/slack-action', slack.slackActionHandler)
))

const io = SocketIO(server)
const websocket = Websocket(io)

slack.on('newThread', (thread: {text: string, threadId: string, socketId: string, id: string}) => {
  monk.createNewThread({
    threadId: thread.threadId,
    socketId: thread.socketId
  })
  websocket.acknowledgeReception(thread)
})
slack.on('removeThread', monk.removeThread)
slack.on('newMessage', websocket.answerUser)
slack.on('receivedMessage', websocket.acknowledgeReception)

// socket-io handlers
websocket.startServer()

server.listen(parseInt(process.env.PORT || '4000'))

slack.greet()

// Micro expects a function to be exported
export default function () {
  console.log('YOLO')
}
