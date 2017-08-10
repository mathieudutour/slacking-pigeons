import * as fs from 'fs'
import * as path from 'path'
import { serveHTML } from '../serve-html'

const assets = {
  addToSlack: fs.readFileSync(
    path.join(__dirname, './add-to-slack.html'),
    'utf-8'
  ),
  loggedIn: fs.readFileSync(path.join(__dirname, './logged-in.html'), 'utf-8'),
  upsell: fs.readFileSync(path.join(__dirname, './upsell.html'), 'utf-8'),
  index: fs.readFileSync(path.join(__dirname, './index.html'), 'utf-8'),
  privacy: fs.readFileSync(path.join(__dirname, './privacy.html'), 'utf-8'),
}

export function index() {
  return serveHTML(assets.index, {
    SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID!,
  })
}

export function privacy() {
  return serveHTML(assets.privacy, {})
}

export function addToSlack() {
  return serveHTML(assets.addToSlack, {
    SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID!,
  })
}

export function loggedIn(teamId: string, channelId: string) {
  return serveHTML(assets.loggedIn, {
    TEAM_ID: teamId,
    CHANNEL_ID: channelId
  })
}

export function upsell(teamId: string, channelId: string, error?: string) {
  return serveHTML(assets.upsell, {
    TEAM_ID: teamId,
    STRIPE_CLIENT: process.env.STRIPE_CLIENT!,
    ERROR: error || '',
    CHANNEL_ID: channelId
  })
}
