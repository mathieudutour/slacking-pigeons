import * as React from 'react'
import * as SocketIOClient from 'socket.io-client'
import { getSocketId } from './storage'
import {TMessages, TUser, SpecialMessageType} from '../../MessageTypes'

export type Props = {
  channelId?: string
  label?: string
  teamId: string
  color?: string
  intro?: string
  onSendMessage?: (message: string, instance: React.Component) => void
  redirectURL?: string
}

let tempId = 0
let artificialId = 0

export const NetworkHOC = (
  Chat: React.ComponentClass<{
    messages: TMessages
    onSendMessage: (msg: string) => void
    color?: string
    showing?: boolean
    intro?: string
    onSendEmail: (email: string) => void
  }>
) =>
  class HookedChat extends React.Component<
    Props,
    {
      messages: TMessages
      showing: boolean
    }
  > {
    private _socket: SocketIOClient.Socket
    public sentEmail: boolean

    public constructor(props: Props) {
      super(props)

      this.state = {
        messages: [],
        showing: false,
      }

      if (!props.teamId) {
        throw new Error('[Slacking-pigeons] Missing team id')
      }

      const socketId = getSocketId()

      this._socket = SocketIOClient(
        process.env.SERVER_HOST +
          '?socketId=' +
          socketId +
          '&teamId=' +
          props.teamId +
          '&label=' +
          (props.label || 'default') +
          props.channelId ? ('&channel=' + props.channelId) : '' +
          props.redirectURL ? ('&redirectURL=' + props.redirectURL) : ''
      )

      this._socket.on('new message', this._onNewMessage)
      this._socket.on('sent message', this._onSentMessage)
      this._socket.on('received message', this._onReceivedMessage)

      fetch(
        process.env.SERVER_HOST + '/history/' + props.teamId + '/' + socketId
      )
        .then(res => res.json())
        .then(({messages, alreadySentEmail}) => {
          this.sentEmail = alreadySentEmail
          this.setState({
            messages: messages
              .map((m: { user: TUser; text: string; id: string }) => {
                return {
                  ...m,
                  read: true,
                  sent: true,
                  received: true,
                }
              })
              .concat(this.state.messages),
            showing: true,
          })
        })
    }

    public componentWillUnmout() {
      this._socket.close()
    }

    public render() {
      return (
        <Chat
          showing={this.state.showing}
          messages={this.state.messages}
          onSendMessage={this._onSendMessage}
          color={this.props.color}
          intro={this.props.intro}
          onSendEmail={this._onSendEmail}
        />
      )
    }

    public addMessage = (text: string) => {
      const message = {
        text,
        id: 'artificial' + artificialId++,
        user: {
          name: 'them',
          id: 'them',
          avatar: '',
        }
      }
      this.setState({
        messages: this.state.messages.concat({
          ...message,
          sent: true,
          received: true,
          read: false,
        }),
      })
    }

    public addSpecialMessage = (special: SpecialMessageType) => {
      const message = {
        text: '',
        id: 'artificial' + artificialId++,
        user: {
          name: 'them',
          id: 'them',
          avatar: '',
        },
        special
      }
      this.setState({
        messages: this.state.messages.concat({
          ...message,
          sent: true,
          received: true,
          read: false,
        }),
      })
    }

    private _onNewMessage = (msg: string) => {
      const message = JSON.parse(msg) as {
        text: string
        id: string
        user: TUser
      }
      this.setState({
        messages: this.state.messages.concat({
          ...message,
          sent: true,
          received: true,
          read: false,
        }),
      })
    }

    private _onSentMessage = (msg: string) => {
      const message = JSON.parse(msg) as {
        text: string
      }

      let found = false
      this.setState({
        messages: this.state.messages.map(m => {
          if (!found && m.text === message.text && m.id.indexOf('temp') === 0) {
            found = true
            return {
              ...m,
              sent: true,
            }
          }
          return m
        }),
      })
    }

    private _onReceivedMessage = (msg: string) => {
      const message = JSON.parse(msg) as {
        text: string
        id: string
      }

      let found = false
      this.setState({
        messages: this.state.messages.map(m => {
          if (!found && m.text === message.text && m.id.indexOf('temp') === 0) {
            found = true
            return {
              ...m,
              sent: true,
              received: true,
              id: message.id,
            }
          }
          return m
        }),
      })
    }

    private _onSendMessage = (message: string) => {
      this.setState({
        messages: this.state.messages.concat({
          text: message,
          user: {
            name: 'me',
            id: 'me',
            avatar: '',
          },
          id: 'temp' + tempId++,
          read: true,
        }),
      })
      if (this._socket) {
        this._socket.emit('chat message', message)
      }
      if (this.props.onSendMessage) {
        this.props.onSendMessage(message, this)
      }
    }

    private _onSendEmail = (email: string) => {
      if (this._socket) {
        this._socket.emit('send email', email)
      }
    }
  }
