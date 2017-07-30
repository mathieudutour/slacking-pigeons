import * as React from 'react'
import styled from 'styled-components'
import {TUser} from './NetworkHOC'

const MessageContainer = styled.div`
  padding: 0 35px 40px;
`

const IncomingMessage = styled.div`
  float: left;
  padding-left: 45px;
  position: relative;
  max-width: 75%;
`

const OutgoingMessage = styled.div`
  float: right;
  position: relative;
  max-width: 75%;
`

const Comment = styled.div`
  padding: 17px 20px;
  border-radius: 6px;
  position: relative;
  color: #fff;
  background-color: #3ead3f;
`

const Avatar = styled.div`
  position: absolute;
  left: 0;
  bottom: 10px
  width: 32px;
  height: 32px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
`

export default class Message extends React.Component<{id: string, sent?: boolean, received?: boolean, text: string, user: TUser, group?: boolean}, {}> {
  render () {
    return (
      <MessageContainer style={this.props.group ? {
        marginTop: '-35px',
      } : undefined}>
        {this.props.user.id === 'me'
        ? <OutgoingMessage>
            <Comment>{this.props.text}</Comment>
          </OutgoingMessage>
        : <IncomingMessage>
            {!this.props.group && <Avatar><img src={this.props.user.avatar} /></Avatar>}
            <Comment style={{color: '#263238', background: '#f4f7f9'}}>{this.props.text}</Comment>
          </IncomingMessage>}
        <div style={{clear: 'both'}}/>
      </MessageContainer>
    )
  }
}
