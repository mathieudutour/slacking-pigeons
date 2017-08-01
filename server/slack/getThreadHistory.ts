import axios from 'axios'
import { IncomingMessage, ServerResponse } from 'http'
import { getSlackUser, users } from './users'

import { findSocket, findTeam, addBotIdToTeam } from '../monk'

export async function getThreadHistory(
  req: IncomingMessage & { params: { [key: string]: string } },
  res: ServerResponse
) {
  const teamId = req.params.team
  const team = await findTeam(teamId)

  if (!team) {
    res.end('[]')
    return
  }

  const socketId = req.params.socket
  const thread = await findSocket(socketId, team.teamId)

  if (!thread) {
    res.end('[]')
    return
  }

  const replies = await axios({
    method: 'post',
    url: `https://slack.com/api/channels.replies?token=${team.token}&thread_ts=${thread.threadId}&channel=${team.channel}`,
  })

  const messages = replies.data.messages

  const bot_id = messages[0].bot_id

  if (!team.bot_id) {
    await addBotIdToTeam(teamId, messages[0].bot_id)
  }

  const me = {
    name: 'me',
    id: 'me',
    avatar: '',
  }

  const userIds = messages
    .map((m: any) => m.user)
    .reduce((prev: { [key: string]: 1 }, userId: string) => {
      if (userId && !prev[userId]) {
        prev[userId] = 1
      }
      return prev
    }, {})

  await Promise.all(
    Object.keys(userIds).map(userId => getSlackUser(team, userId))
  )

  const mappedMessages = messages.map((m: any, i: number) => {
    if (i === 0) {
      return {
        user: me,
        text: m.attachments[0].text,
        id: m.ts,
      }
    }
    return {
      user: m.user ? users[m.user] : me,
      text: m.text,
      id: m.ts,
    }
  })

  res.end(JSON.stringify(mappedMessages))
  return
}
