import axios from 'axios'
import { IncomingMessage, ServerResponse} from 'http'
import {json, text, send} from 'micro'

import { IThread } from './monk'

const BOT_ID = process.env.BOT_ID
const VERIFICATION_TOKEN = process.env.VERIFICATION_TOKEN
const OAUTH_TOKEN = process.env.VERIFICATION_TOKEN
const CHANNEL = encodeURIComponent(process.env.CHANNEL || '#support')

type HANDLER_TYPE = 'newThread' | 'newMessage' | 'removeThread' | 'receivedMessage'

type NEW_THREAD_HANDLER_TYPE = (thread: {text: string, id: string, socketId: string, threadId: string}) => void
type NEW_MESSAGE_HANDLER_TYPE = (message: { user: User, text: string, threadId: string, id: string }) => void
type REMOVE_THREAD_HANDLER_TYPE = (threadId: string) => void
type RECEIVED_MESSAGE_HANDLER_TYPE = (message: { text: string, id: string, threadId: string }) => void

export type User = {
  id: string,
  name: string,
  avatar: string
}

const handlers: {
  newThread: Array<NEW_THREAD_HANDLER_TYPE>,
  newMessage: Array<NEW_MESSAGE_HANDLER_TYPE>,
  removeThread: Array<REMOVE_THREAD_HANDLER_TYPE>,
  receivedMessage: Array<RECEIVED_MESSAGE_HANDLER_TYPE>
} = {
  newThread: [],
  newMessage: [],
  removeThread: [],
  receivedMessage: []
}

const users: {
  [userId: string]: User
} = {}

function isOurBot (bot: string | undefined) {
  return bot && BOT_ID === bot
}

export function on (type: HANDLER_TYPE, callback: NEW_THREAD_HANDLER_TYPE | NEW_MESSAGE_HANDLER_TYPE | REMOVE_THREAD_HANDLER_TYPE) {
  handlers[type].push(callback)
}

export async function slackEventHandler (req: IncomingMessage, res: ServerResponse) {
  const body = await json(req) as {
    challenge: string,
    token: string
    event: undefined
  } | {
    challenge: undefined,
    token: undefined,
    event: {
      type: string,
      thread_ts?: string,
      ts: string,
      bot_id?: string,
      channel: string,
      subtype?: string,
      text: string,
      user: string,
      attachments: Array<{
        footer?: string,
        text: string
      }>
    }
  }

  if (body.challenge) {
    if (body.token === VERIFICATION_TOKEN) {
      return res.end(body.challenge)
    } else {
      return res.end('weird, I dunno you')
    }
  }

  if (body.event) {
    const event = body.event
    if (event.type === 'message') {
      const threadId = event.thread_ts
      // if top level message
      if (!threadId || event.thread_ts === event.ts) {
        // if we sent the top message, then we need to associate the message id with the user
        const socketId = ((event.attachments || [])[0] || {}).footer
        if (isOurBot(event.bot_id) && socketId) {
          handlers.newThread.forEach(handler => {
            handler({
              text: event.attachments[0].text,
              id: event.ts,
              socketId,
              threadId: event.ts
            })
          })
        }
      } else if (event.subtype === 'message_changed') {
        console.log(event)
      } else if (!isOurBot(event.bot_id) && threadId) {
        // if we are in a thread and we haven't sent it
        let user = users[event.user]
        if (!user) {
          user = await getSlackUser(event.user)
          users[event.user] = user
        }
        handlers.newMessage.forEach(handler => {
          handler({
            user,
            text: event.text,
            threadId,
            id: event.ts
          })
        })
      } else if (isOurBot(event.bot_id) && threadId) {
        handlers.receivedMessage.forEach(handler => {
          handler({
            text: event.text,
            id: event.ts,
            threadId
          })
        })
      }
    } else {
      console.log(event)
    }
  }

  send(res, 200)
}

function parseQuery (q: string) {
  const result: {[key: string]: string} = {}
  return q.split('&').reduce((prev, s) => {
    const part = s.split('=')
    prev[part[0]] = decodeURIComponent(part[1])
    return prev
  }, result)
}

export async function slackActionHandler (req: IncomingMessage, res: ServerResponse) {
  const body = JSON.parse((parseQuery(await text(req)) as {payload: string}).payload) as {
    token: string,
    callback_id: string,
    actions: Array<{
      name: string
    }>
    original_message: {
      ts: string,
      attachments: Array<{
        actions: Array<any>,
        attachment_type: string,
        callback_id: string,
        color?: string
      }>
    },
    channel: {
      name: string,
      id: string
    }
  }

  if (body.token !== VERIFICATION_TOKEN || body.callback_id !== 'slacking-pigeons-actions') {
    return send(res, 200)
  }

  if (body.actions[0].name === 'resolve') {
    send(res, 200)
    const message = body.original_message
    delete message.attachments[0].actions
    delete message.attachments[0].attachment_type
    delete message.attachments[0].callback_id
    message.attachments[0].color = 'good'
    axios({
      method: 'post',
      url: `https://slack.com/api/chat.update?token=${OAUTH_TOKEN
      }&ts=${body.original_message.ts
      }&channel=${body.channel.id
      }&text=Done&attachments=${encodeURIComponent(JSON.stringify(message.attachments))}`
    })
  } else {
    send(res, 200)
    axios({
      method: 'post',
      url: `https://slack.com/api/chat.delete?token=${OAUTH_TOKEN
      }&ts=${body.original_message.ts
      }&channel=${body.channel.id}`
    })
    handlers.removeThread.forEach(handler => {
      handler(body.original_message.ts)
    })
  }
}

export function postNewMessage (message: string, socketId: string) {
  return axios({
    method: 'post',
    url: `https://slack.com/api/chat.postMessage?token=${OAUTH_TOKEN
    }&attachments=${encodeURIComponent(JSON.stringify([
      {
        fallback: message,
        text: message,
        footer: socketId,
        callback_id: 'slacking-pigeons-actions',
        attachment_type: 'default',
        actions: [
          {
            name: 'resolve',
            style: 'primary',
            text: 'Resolve',
            type: 'button',
            value: 'resolve'
          },
          {
            name: 'ignore',
            'text': 'Ignore',
            'style': 'danger',
            'type': 'button',
            'value': 'ignore',
            'confirm': {
              'title': 'Are you sure?',
              'text': 'You won\'t be able to answer this user then.',
              'ok_text': 'Yes',
              'dismiss_text': 'No'
            }
          }
        ]
      }
    ]))
    }&channel=${CHANNEL}`
  })
}

export function answerInThread (message: string, thread: IThread) {
  return axios({
    method: 'post',
    url: `https://slack.com/api/chat.postMessage?token=${OAUTH_TOKEN
    }&text=${message
    }&thread_ts=${thread.threadId
    }&channel=${CHANNEL}`
  })
}

function getSlackUser (userId: string): Promise<User> {
  return axios({
    method: 'post',
    url: `https://slack.com/api/users.info?token=${OAUTH_TOKEN}&user=${userId}`
  }).then((res) => res.data.user)
  .then(res => {
    return {
      name: res.name,
      id: res.id,
      avatar: res.profile.image_32
    }
  })
}
