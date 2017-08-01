import * as path from 'path'
import * as fs from 'fs'
import { IncomingMessage, ServerResponse } from 'http'
import micro from 'micro'
import { router, get, post } from 'microrouter'
import * as SocketIO from 'socket.io'
import * as slack from './slack'
import * as monk from './monk'
import { Websocket } from './websocket-server'
import { cors } from './cors'

if (!process.env.SLACK_CLIENT_ID) {
  console.error('missing slack client ID')
  process.exit(1)
}

if (!process.env.SLACK_CLIENT_SECRET) {
  console.error('missing slack client secret')
  process.exit(1)
}

const assets = {
  html: fs.readFileSync(path.join(__dirname, './static/index.html'), 'utf-8'),
  js: fs.readFileSync(path.join(__dirname, './static/bundle.js'), 'utf-8'),
}

const defaultTeamIdRegex = new RegExp(
  process.env.DEFAULT_TEAM_ID || 'T6ETXT362',
  'g'
)
const defaultColorRegex = new RegExp(
  process.env.DEFAULT_COLOR || '#3ead3f',
  'g'
)

const staticServing = (key: 'html' | 'js') => async (
  req: IncomingMessage & { query: { [key: string]: string } },
  res: ServerResponse
) => {
  console.log('Serving asset')
  let asset = assets[key]
  if (key === 'js') {
    if (req.query.teamId) {
      asset = asset.replace(defaultTeamIdRegex, req.query.teamId)
    }
    if (req.query.color) {
      asset = asset.replace(defaultColorRegex, decodeURIComponent(req.query.color))
    }
  }
  res.end(asset)
}

const server = micro(
  cors(
    router(
      get('/', staticServing('html')),
      get('/bundle.js', staticServing('js')),
      get('/history/:team/:socket', slack.getThreadHistory),
      get('/slack-oauth-callback', slack.addNewTeam),
      post('/slack-incoming', slack.slackEventHandler),
      post('/slack-action', slack.slackActionHandler)
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
    id: string
  }) => {
    monk.createNewThread({
      teamId: thread.teamId,
      threadId: thread.threadId,
      socketId: thread.socketId,
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
