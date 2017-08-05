type HANDLER_TYPE =
  | 'newThread'
  | 'newMessage'
  | 'removeThread'
  | 'receivedMessage'

type NEW_THREAD_HANDLER_TYPE = (
  thread: {
    teamId: string
    text: string
    id: string
    socketId: string
    threadId: string
    channel: string
  }
) => void
type NEW_MESSAGE_HANDLER_TYPE = (
  message: {
    teamId: string
    user: User
    text: string
    threadId: string
    id: string
  }
) => void
type REMOVE_THREAD_HANDLER_TYPE = (teamId: string, threadId: string) => void
type RECEIVED_MESSAGE_HANDLER_TYPE = (
  message: { teamId: string; text: string; id: string; threadId: string, channel: string }
) => void

export type User = {
  id: string
  name: string
  avatar: string
}

export const handlers: {
  newThread: Array<NEW_THREAD_HANDLER_TYPE>
  newMessage: Array<NEW_MESSAGE_HANDLER_TYPE>
  removeThread: Array<REMOVE_THREAD_HANDLER_TYPE>
  receivedMessage: Array<RECEIVED_MESSAGE_HANDLER_TYPE>
} = {
  newThread: [],
  newMessage: [],
  removeThread: [],
  receivedMessage: [],
}

function error(message: string): never {
  throw new Error(message)
}

export function on(
  type: HANDLER_TYPE,
  callback:
    | NEW_THREAD_HANDLER_TYPE
    | NEW_MESSAGE_HANDLER_TYPE
    | REMOVE_THREAD_HANDLER_TYPE
    | RECEIVED_MESSAGE_HANDLER_TYPE
) {
  if (type === 'newThread') {
    handlers.newThread.push(callback as NEW_THREAD_HANDLER_TYPE)
  } else if (type === 'newMessage') {
    handlers.newMessage.push(callback as NEW_MESSAGE_HANDLER_TYPE)
  } else if (type === 'removeThread') {
    handlers.removeThread.push(callback as REMOVE_THREAD_HANDLER_TYPE)
  } else if (type === 'receivedMessage') {
    handlers.receivedMessage.push(callback as RECEIVED_MESSAGE_HANDLER_TYPE)
  } else {
    return error('unknown handler type')
  }
}
