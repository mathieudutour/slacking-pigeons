export enum SpecialMessageType {
  EmailInput = 'email-input',
}

export type TUser = {
  id: string
  name: string
  avatar: string
}

export type TMessage = {
  text: string
  id: string
  user: TUser
  sent?: boolean
  received?: boolean
  read?: boolean
  special?: SpecialMessageType
}

export type TMessages = Array<TMessage>
