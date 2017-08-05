import axios from 'axios'
import { IChannel } from '../monk'

export const GREET_MESSAGE =
  "Hello there! I'll post the questions from the users here, stay tune."

export async function greet(team: IChannel) {
  return axios({
    method: 'post',
    url: `https://slack.com/api/chat.postMessage?token=${team.token}&text=${GREET_MESSAGE}&channel=${team.channel}`,
  })
}
