import axios from 'axios'
import { IncomingMessage, ServerResponse } from 'http'
import { json, send } from 'micro'
import { VERIFICATION_TOKEN } from './constants'
import { CLIENT_ID, CLIENT_SECRET } from './constants'
import { greet } from './greet'
import { createOrUpdateNewTeam, findTeam } from '../monk'
import { addToSlack, loggedIn, upsell } from '../views'

export async function addNewTeam(
  req: IncomingMessage & { query: { [key: string]: string } },
  res: ServerResponse
) {
  if (req.query.error) {
    res.end(req.query.error)
    return
  }

  const body = (await axios({
    method: 'post',
    url: `https://slack.com/api/oauth.access?code=${req.query
      .code}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
  }).then(res => res.data)) as {
    error?: string
    access_token: string
    team_id: string
    incoming_webhook: {
      // only with Add to slack
      channel_id: string
    }
    team: {
      // only with Sign in with Slack
      id: string
    }
  }

  if (body.error) {
    res.end(body.error)
    return
  }

  res.setHeader('Content-Type', 'text/html')

  if (!body.incoming_webhook) {
    // sign in with Slack
    const team = await findTeam(body.team.id)

    if (!team) {
      res.end(addToSlack())
      return
    }

    if (team.premium) {
      res.end(loggedIn(body.team.id))
    } else {
      res.end(upsell(body.team.id))
    }
  } else {
    // add to slack
    const team = {
      teamId: body.team_id,
      token: body.access_token,
      channel: body.incoming_webhook.channel_id,
    }

    await createOrUpdateNewTeam(team)
    await greet(team)

    res.end(upsell(body.team_id))
  }

  return
}
