import * as path from 'path'
import * as fs from 'fs'
import { IncomingMessage, ServerResponse } from 'http'
import micro from 'micro'
import { router, get, post } from 'microrouter'
import * as SocketIO from 'socket.io'
import * as slack from './slack'
import * as stripe from './stripe'
import * as monk from './monk'
import { Websocket } from './websocket-server'
import { cors } from './cors'
import { index } from './views'

if (!process.env.SLACK_CLIENT_ID) {
  console.error('missing slack client ID')
  process.exit(1)
}

if (!process.env.SLACK_CLIENT_SECRET) {
  console.error('missing slack client secret')
  process.exit(1)
}

const assets = {
  html: index(),
  js: fs.readFileSync(path.join(__dirname, './static/bundle.js'), 'utf-8'),
  css: fs.readFileSync(path.join(__dirname, './static/style.css'), 'utf-8'),
}

const staticServing = (key: 'html' | 'js' | 'css') => async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  if (key === 'html') {
    res.end(index())
  } else {
    res.end(assets[key])
  }
}

const server = micro(
  cors(
    router(
      get('/', staticServing('html')),
      get('/bundle.js', staticServing('js')),
      get('/style.css', staticServing('css')),
      get('/history/:team/:socket', slack.getThreadHistory),
      get('/slack-oauth-callback', slack.addNewTeam),
      post('/slack-incoming', slack.slackEventHandler),
      post('/slack-action', slack.slackActionHandler),
      post('/stripe-webhook', stripe.handler),
      post('/subscribe', stripe.subscribeToPremium)
    )
  )
)

const io = SocketIO(server)
const websocket = Websocket(io)

slack.on(
  'newThread',
  (thread: {
    teamId: string
    text: string
    threadId: string
    socketId: string
    channel: string
    id: string
  }) => {
    monk.createNewThread({
      teamId: thread.teamId,
      threadId: thread.threadId,
      socketId: thread.socketId,
      channel: thread.channel,
    })
    websocket.acknowledgeReception(thread)
  }
)
slack.on('removeThread', monk.removeThread)
slack.on('newMessage', websocket.answerUser)
slack.on('receivedMessage', websocket.acknowledgeReception)

// socket-io handlers
websocket.startServer()

const port = parseInt(process.env.PORT || '4000')
server.listen(port)
console.log('Listening to ' + port)

// Micro expects a function to be exported
// tslint:disable-next-line:no-default-export
export default function() {
  console.log('YOLO')
}
