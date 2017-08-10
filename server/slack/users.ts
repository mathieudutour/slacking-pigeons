import axios from 'axios'
import { ITeam } from '../monk'

export type User = {
  id: string
  name: string
  avatar: string
}

export const users: {
  [TeamIdPlususerId: string]: User
} = {}

export function getSlackUser(team: ITeam, userId: string) {
  const id = team.teamId + '-' + userId
  if (users[id]) {
    return users[id]
  }
  return axios({
    method: 'post',
    url: `https://slack.com/api/users.info?token=${team.token}&user=${userId}`,
  })
    .then(res => res.data.user)
    .then(res => {
      return {
        name: res.name,
        id: res.id,
        avatar: res.profile.image_32,
      }
    })
    .then(res => {
      users[res.id] = res
      return res
    })
}
