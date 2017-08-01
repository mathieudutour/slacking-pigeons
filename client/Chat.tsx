import * as React from 'react'
import * as SocketIOClient from 'socket.io-client'
import styled from 'styled-components'
import { getSocketId } from './storage'
import { Input } from './Input'
import { Message } from './Message'
import { ToggleButton } from './ToggleButton'
import { NetworkHOC, TMessages, TMessage } from './NetworkHOC'

type Props = {
  messages: TMessages
  onSendMessage: (msg: string) => void
}

const Container = styled.div`
  height: calc(100% - 20px - 75px - 20px);
  bottom: calc(20px + 75px);
  z-index: 2147483000;
  position: fixed;
  right: 20px;
  width: 370px;
  min-height: 250px;
  max-height: 590px;
  box-shadow: 0 5px 40px rgba(0, 0, 0, .16);
  border-radius: 8px;
  overflow: hidden;
  opacity: 1;
  background-color: #fff;
`

const MessagesContainer = styled.div`
  overflow-y: scroll;
  position: absolute;
  bottom: 55px;
  top: 0;
  width: 100%;
  padding-top: 30px;
`

const IntroCopy = styled.p`
  text-align: center;
  color: #263238;
  padding: 0 30px 30px;
  opacity: 0.7;
`

class Chat extends React.Component<Props, { open: boolean }> {
  private _messagesContainer: HTMLDivElement | undefined

  public constructor(props: Props) {
    super(props)

    this.state = {
      open: false,
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.messages.length !== this.props.messages.length &&
      this._messagesContainer
    ) {
      if (
        this._messagesContainer.scrollHeight <=
        this._messagesContainer.scrollTop + this._messagesContainer.offsetHeight
      ) {
        setTimeout(() => {
          if (this._messagesContainer) {
            this._messagesContainer.scrollTop = this._messagesContainer.scrollHeight
          }
        }, 0)
      }
    }
  }

  public componentDidUpdate(prevProps: Props, prevState: { open: boolean }) {
    if (this.state.open && !prevState.open && this._messagesContainer) {
      this._messagesContainer.scrollTop = this._messagesContainer.scrollHeight
    }
  }

  public render() {
    let previousMessage: TMessage
    return (
      <div>
        <ToggleButton open={this.state.open} onClick={this._toggleOpen} />
        {this.state.open &&
          <Container>
            <MessagesContainer innerRef={this._onRef}>
              <IntroCopy>
                Hey there! Let us know if you have any questions! We'd be happy
                to help.
              </IntroCopy>
              {this.props.messages.map(message => {
                const _previousMessage = previousMessage
                previousMessage = message
                return (
                  <Message
                    key={message.id}
                    {...message}
                    group={
                      _previousMessage &&
                      message.user.id === _previousMessage.user.id
                    }
                  />
                )
              })}
            </MessagesContainer>
            <Input
              onSendMessage={this.props.onSendMessage}
              alreadyAMessage={this.props.messages.length > 0}
            />
          </Container>}
      </div>
    )
  }

  private _onRef = (c: HTMLDivElement) => (this._messagesContainer = c)

  private _toggleOpen = () => {
    this.setState({
      open: !this.state.open,
    })
  }
}

export const HookedChat = NetworkHOC(process.env.TEAM_ID!)(Chat)
