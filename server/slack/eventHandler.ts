import axios from 'axios'
import { IncomingMessage, ServerResponse } from 'http'
import { json, send } from 'micro'
import { VERIFICATION_TOKEN } from './constants'
import { GREET_MESSAGE } from './greet'
import { handlers } from './handlers'
import { users, getSlackUser } from './users'

import { findTeam, updateTeam, ITeam } from '../monk'

function isOurBot(bot: string | undefined, team: ITeam) {
  return bot && team.bot_id === bot
}

export async function slackEventHandler(
  req: IncomingMessage,
  res: ServerResponse
) {
  const body = (await json(req)) as
    | {
        challenge: string
        token: string
        event: undefined
        team_id: string
      }
    | {
        challenge: undefined
        token: string
        team_id: string
        event: {
          type: string
          thread_ts?: string
          ts: string
          bot_id?: string
          channel: string
          subtype?: string
          text: string
          user: string
          attachments: Array<{
            footer?: string
            text: string
          }>
        }
      }

  if (body.token !== VERIFICATION_TOKEN) {
    res.end('weird, I dunno you')
    return
  }

  if (body.challenge) {
    res.end(body.challenge)
    return
  }

  const team = await findTeam(body.team_id)

  if (!team) {
    res.end('weird, I dunno your team')
    return
  }

  if (body.event) {
    const event = body.event
    if (event.type === 'message') {
      const threadId = event.thread_ts

      // if we greet and haven't a BOT_ID yet, it's most probably us
      if (event.text === GREET_MESSAGE && event.bot_id && !team.bot_id) {
        await updateTeam(team.teamId, {bot_id: event.bot_id})
      } else if (!threadId || event.thread_ts === event.ts) {
        // if top level message
        // if we sent the top message, then we need to associate the message id with the user
        const socketId = ((event.attachments || [])[0] || {}).footer
        if (isOurBot(event.bot_id, team) && socketId) {
          handlers.newThread.forEach(handler => {
            handler({
              teamId: team.teamId,
              text: event.attachments[0].text,
              id: event.ts,
              socketId,
              threadId: event.ts,
              channel: event.channel,
            })
          })
        }
      } else if (event.subtype === 'message_changed') {
        // console.log(event)
      } else if (!isOurBot(event.bot_id, team) && threadId) {
        // if we are in a thread and we haven't sent it
        let user = users[event.user]
        if (!user) {
          user = await getSlackUser(team, event.user)
        }
        handlers.newMessage.forEach(handler => {
          handler({
            teamId: team.teamId,
            user,
            text: event.text,
            threadId,
            id: event.ts,
          })
        })
      } else if (isOurBot(event.bot_id, team) && threadId) {
        handlers.receivedMessage.forEach(handler => {
          handler({
            teamId: team.teamId,
            text: event.text,
            id: event.ts,
            threadId,
            channel: event.channel,
          })
        })
      }
    } else {
      // console.log(event)
    }
  }

  send(res, 200)
}
