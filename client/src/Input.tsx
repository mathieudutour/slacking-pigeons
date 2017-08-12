import * as React from 'react'
import styled from 'styled-components'
import textarea from 'react-textarea-autosize'
import {PigeonIcon} from './PigeonIcon'

const KEY_ENTER = 13

const Textarea = styled(textarea)`
  position: absolute;
  bottom: 0;
  left: 0;
  color: #565867;
  background-color: #f4f7f9;
  resize: none;
  border: none;
  transition: background-color .2s ease, box-shadow .2s ease;
  box-sizing: border-box;
  padding: 18px;
  padding-right: 45px;
  padding-left: 30px;
  width: 100%;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.33;
  white-space: pre-wrap;
  word-wrap: break-word;

  &:focus {
    outline: none;
    background-color: #fff;
    box-shadow: 0 0 100px 0 rgba(150, 165, 190, .24)
  }
`

const SendButton = styled.button`
  background: transparent;
  border: none;
  outline: none;
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 5px;
  opacity: 0.4;
  cursor: pointer;
`

type Props = {
  onSendMessage: (msg: string) => void
  alreadyAMessage: boolean
}

export class Input extends React.Component<
  Props,
  {
    message: string
  }
> {
  public constructor(props: Props) {
    super(props)

    this.state = {
      message: '',
    }
  }

  public render() {
    return (
      <div>
        <Textarea
          style={{
            minHeight: '55px',
            maxHeight: '200px',
          }}
          placeholder={
            this.props.alreadyAMessage
              ? 'Write a reply...'
              : 'Write a question...'
          }
          value={this.state.message}
          onChange={this._onChange}
          onKeyDown={this._onKeyDown}
        />
        <SendButton onClick={this._onSendMessage} title="Send message">
          <PigeonIcon color="#565867" />
        </SendButton>
      </div>
    )
  }

  private _onChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    this.setState({
      message: e.currentTarget.value,
    })
  }

  private _onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.keyCode === KEY_ENTER && !e.ctrlKey && !e.altKey && !e.shiftKey) {
      e.preventDefault()
      this._onSendMessage()
    }
  }

  private _onSendMessage = (e?: any) => {
    if (this.state.message) {
      this.props.onSendMessage(this.state.message)
      this.setState({
        message: '',
      })
    }
  }
}
