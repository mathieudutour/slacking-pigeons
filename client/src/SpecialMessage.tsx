import * as React from 'react'
import styled from 'styled-components'
import { SpecialMessageType } from '../../MessageTypes'
import { EmailInput } from './special/EmailInput'

type Props = {
  id: string
  text: string
  special: SpecialMessageType
  color?: string
  onSendEmail: (email: string) => void
}

export class SpecialMessage extends React.Component<Props, { text: string }> {
  public constructor(props: Props) {
    super(props)
  }

  public shouldComponentUpdate(nextProps: Props) {
    return nextProps.special !== this.props.special
  }

  public render() {
    if (this.props.special === SpecialMessageType.EmailInput) {
      return <EmailInput onSendEmail={this.props.onSendEmail} />
    }
    return false
  }
}
