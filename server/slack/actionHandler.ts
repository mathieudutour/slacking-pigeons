import axios from 'axios'
import { IncomingMessage, ServerResponse } from 'http'
import { text, send } from 'micro'
import { VERIFICATION_TOKEN } from './constants'
import { handlers } from './handlers'
import { parseQuery } from '../_parseQuery'

import { findTeam } from '../monk'

export async function slackActionHandler(
  req: IncomingMessage,
  res: ServerResponse
) {
  const body = JSON.parse(
    (parseQuery(await text(req)) as { payload: string }).payload
  ) as {
    token: string
    team: {
      id: string
    }
    callback_id: string
    actions: Array<{
      name: string
    }>
    original_message: {
      ts: string
      attachments: Array<{
        actions: Array<any>
        attachment_type: string
        callback_id: string
        color?: string
      }>
    }
    channel: {
      name: string
      id: string
    }
  }

  if (
    body.token !== VERIFICATION_TOKEN ||
    body.callback_id !== 'slacking-pigeons-actions'
  ) {
    send(res, 200)
    return
  }

  const team = await findTeam(body.team.id)

  if (!team) {
    send(res, 200)
    return
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
      url: `https://slack.com/api/chat.update?token=${team.token}&ts=${body
        .original_message.ts}&channel=${body.channel
        .id}&text=Done&attachments=${encodeURIComponent(
        JSON.stringify(message.attachments)
      )}`,
    })
  } else {
    send(res, 200)
    axios({
      method: 'post',
      url: `https://slack.com/api/chat.delete?token=${team.token}&ts=${body
        .original_message.ts}&channel=${body.channel.id}`,
    })
    handlers.removeThread.forEach(handler => {
      handler(team.teamId, body.original_message.ts)
    })
  }
}
