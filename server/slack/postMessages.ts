import axios from 'axios'

import { ITeam, IThread } from '../monk'

export function postNewMessage(
  team: ITeam,
  message: string,
  socketId: string,
  channelId: string
) {
  return axios({
    method: 'post',
    url: `https://slack.com/api/chat.postMessage?token=${team.token}&attachments=${encodeURIComponent(
      JSON.stringify([
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
              value: 'resolve',
            },
            {
              name: 'ignore',
              text: 'Ignore',
              style: 'danger',
              type: 'button',
              value: 'ignore',
              confirm: {
                title: 'Are you sure?',
                text: "You won't be able to answer this user then.",
                ok_text: 'Yes',
                dismiss_text: 'No',
              },
            },
          ],
        },
      ])
    )}&channel=${channelId}`,
  })
}

export function answerInThread(team: ITeam, message: string, thread: IThread) {
  return axios({
    method: 'post',
    url: `https://slack.com/api/chat.postMessage?token=${team.token}&text=${message}&thread_ts=${thread.threadId}&channel=${thread.channel}`,
  })
}
