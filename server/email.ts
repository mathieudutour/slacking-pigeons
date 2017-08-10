import * as nodemailer from 'nodemailer'
import * as SES from 'aws-sdk/clients/ses'
import { getMessages } from './slack/getThreadHistory'
import { recordSendEmail, findTeam, IThread } from './monk'
import { TMessage } from '../MessageTypes'

const transporter = nodemailer.createTransport({
  SES: new SES({
    apiVersion: '2010-12-01',
    accessKeyId: process.env.AWS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY,
    region: 'eu-west-1',
  }),
})

const outgoingMessage = `
  <div style="padding: 0 35px 40px;{{{GROUP}}}">
    <div style="float: right;position: relative;max-width: 75%;">
      <div style="padding: 17px 20px;border-radius: 6px;position: relative;color: #fff;background-color: #08AEEA;background-image: linear-gradient(0deg, #08AEEA 0%, #2AF5CA 100%);font-size: 15px;">{{{TEXT}}}</div>
    </div>
    <div style="clear: both;"></div>
  </div>
`

const avatar = `
  <div style="position: absolute;left: 0;bottom: 10px;width: 32px;height: 32px;margin: 0 auto;border-radius: 50%;overflow: hidden;"><img src="{{{AVATAR}}}"></div>
`

const incomingMessage = `
  <div style="padding: 0 35px 40px;{{{GROUP}}}">
    <div style="float: left;padding-left: 45px;position: relative;max-width: 75%;">
      {{{AVATAR}}}
      <div style="padding: 17px 20px;border-radius: 6px;position: relative;color: rgb(38, 50, 56);background-color: rgb(244, 247, 249);;font-size: 15px;">{{{TEXT}}}</div>
    </div>
    <div style="clear: both;"></div>
  </div>
`

const emailTemplate = `
<div style='margin: 0 auto;width: 80%;max-width: 370px;box-shadow: 0 5px 40px rgba(0, 0, 0, .16);border-radius: 8px;background-color: #fff;padding-top: 30px;font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";font-size: 14px;line-height: 1.5;color: #24292e;'>
  <p style="text-align: center;color: #263238;padding: 0 30px 30px;opacity: 0.7;">Hey there! {{{USERNAME}}} answered your question.</p>
  {{{MESSAGES}}}
  <a style="display: block; text-decoration: none; color: #565867;background-color: #f4f7f9;padding: 18px;padding-right: 30px;padding-left: 30px;font-size: 15px;font-weight: 400;line-height: 1.33;" href="{{{REDIRECT_URL}}}">Write a reply</a>
</div>
`

export async function sendEmail(
  thread: IThread,
  teamId: string,
  message: string
) {
  const team = await findTeam(teamId)

  if (!team || !team.premium) {
    return
  }

  await recordSendEmail(teamId, thread.threadId)

  const messages = (await getMessages(team, thread)).slice(-5)
  let previousMessage: TMessage
  const text = emailTemplate
    .replace('{{{USERNAME}}}', messages[messages.length - 1].user.name)
    .replace(
      '{{{MESSAGES}}}',
      messages.reduce((prev, m, i) => {
        const _previousMessage = previousMessage
        previousMessage = m
        const group = _previousMessage && _previousMessage.user.id === m.user.id
        let s = m.user.id === 'me' ? outgoingMessage : incomingMessage
        s = s
          .replace('{{{GROUP}}}', group ? 'margin-top: -35px;' : '')
          .replace(
            '{{{AVATAR}}}',
            !group ? avatar.replace('{{{AVATAR}}}', m.user.avatar) : ''
          )
          .replace('{{{REDIRECT_URL}}}', thread.redirectURL!)
          .replace('{{{TEXT}}}', m.text)
        return prev + s
      }, '')
    )

  transporter.sendMail(
    {
      from: '"Slacking Pigeons" <mathieu@slacking-pigeons.com>',
      to: thread.email,
      subject: 'A new answer to your question',
      text,
    },
    (err, info) => {
      if (err) {
        console.error(err)
      }
    }
  )
}
