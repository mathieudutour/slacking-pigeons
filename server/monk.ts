import Monk = require('monk')
const monk = Monk(process.env.MONGO_URL || 'localhost:27017')

const Threads = monk.get('threads')

export interface IThread {
  readonly threadId: string
  readonly socketId: string
}

export function createNewThread (thread: IThread): Promise<void> {
  return Threads.insert(thread)
}

export function removeThread (threadId: string): Promise<void> {
  return Threads.remove({threadId})
}

export function findSocket (socketId : string): Promise<IThread | undefined> {
  return Threads.findOne({
    socketId
  })
}

export function findThread (threadId: string): Promise<IThread | undefined> {
  return Threads.findOne({
    threadId
  })
}
