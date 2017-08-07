import * as fs from 'fs'
import * as path from 'path'
import { serveHTML } from '../serve-html'

const assets = {
  addToSlack: fs.readFileSync(path.join(__dirname, './add-to-slack.html'), 'utf-8'),
  loggedIn: fs.readFileSync(path.join(__dirname, './logged-in.html'), 'utf-8'),
  upsell: fs.readFileSync(path.join(__dirname, './upsell.html'), 'utf-8'),
  index: fs.readFileSync(path.join(__dirname, './index.html'), 'utf-8'),
}

export function index() {
  return serveHTML(assets.index, {
    SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID!
  })
}

export function addToSlack() {
  return serveHTML(assets.addToSlack, {
    SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID!
  })
}

export function loggedIn(teamId: string) {
  return serveHTML(assets.loggedIn, {
    TEAM_ID: teamId
  })
}

export function upsell(teamId: string, error?: string) {
  return serveHTML(assets.upsell, {
    TEAM_ID: teamId,
    STRIPE_CLIENT: process.env.STRIPE_CLIENT!,
    ERROR: error || ''
  })
}
