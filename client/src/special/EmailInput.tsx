import * as React from 'react'
import styled from 'styled-components'

const KEY_ENTER = 13

const Wrapper = styled.div`margin-bottom: 20px;`

const Copy = styled.p`
  text-align: center;
  color: #263238;
  padding: 0 30px 10px;
  opacity: 0.7;
`

const Input = styled.input`
  width: 80%;
  color: #565867;
  background-color: #f4f7f9;
  resize: none;
  border: none;
  transition: background-color .2s ease, box-shadow .2s ease;
  box-sizing: border-box;
  padding: 18px;
  padding-right: 30px;
  padding-left: 30px;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.33;
  margin-left: 10%;

  &:focus {
    outline: none;
    background-color: #fff;
    box-shadow: 0 0 100px 0 rgba(150, 165, 190, .24);
  }
`

type Props = {
  onSendEmail: (email: string) => void
}

export class EmailInput extends React.Component<
  Props,
  { email: string; sent: boolean }
> {
  public constructor(props: Props) {
    super(props)

    this.state = {
      email: '',
      sent: false,
    }
  }

  public render() {
    if (this.state.sent) {
      return (
        <Wrapper>
          <Copy>Cool, we will ping you!</Copy>
        </Wrapper>
      )
    }
    return (
      <Wrapper>
        <Copy>
          If you want you can enter your email and we will ping you when we
          answer.
        </Copy>
        <Input
          type="email"
          placeholder="Enter you email..."
          value={this.state.email}
          onChange={this._onChange}
          onKeyDown={this._onKeyDown}
        />
      </Wrapper>
    )
  }

  private _onChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      email: e.currentTarget.value,
    })
  }

  private _onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.keyCode === KEY_ENTER &&
      this.state.email &&
      this.state.email.indexOf('@') !== -1
    ) {
      e.preventDefault()
      this.props.onSendEmail(this.state.email)
      this.setState({
        sent: true,
      })
    }
  }
}
