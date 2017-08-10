import Monk, { IObjectID } from 'monk'
const monk = Monk(process.env.MONGO_URL || 'localhost:27017')

const Teams = monk.get('teams')
Teams.createIndex('teamId')

const Threads = monk.get('threads')
Threads.createIndex('teamId threadId')
Threads.createIndex('teamId socketId')

export interface IChannel {
  readonly teamId: string
  readonly token: string
  readonly bot_id?: string
  readonly channel: string
}

export interface ITeam {
  readonly teamId: string
  readonly token: string
  readonly bot_id?: string
  readonly channels: string[]
  readonly premium?: boolean
  readonly stripeId?: string
  readonly email?: string
}

export interface IThread {
  readonly teamId: string
  readonly threadId: string
  readonly socketId: string
  readonly channel: string
  lastSeen?: number
  sentEmailAt?: number
  readonly email?: string
  readonly redirectURL?: string
}

export function createOrUpdateNewTeam(team: IChannel): Promise<void> {
  return findTeam(team.teamId).then(res => {
    if (res) {
      return Teams.update(
        { teamId: team.teamId },
        {
          $set: {
            token: team.token,
          },
          $addToSet: {
            channels: team.channel,
          },
        }
      )
    }
    const objectToInsert = {
      teamId: team.teamId,
      token: team.token,
      channels: [team.channel],
    }
    return Teams.insert(objectToInsert)
  })
}

export function findTeam(teamId: string): Promise<ITeam | undefined> {
  return Teams.findOne({ teamId })
}

export function updateTeam(
  teamId: string,
  update: { [key: string]: any }
): Promise<void> {
  return Teams.update({ teamId }, { $set: update })
}

export function createNewThread(thread: IThread): Promise<void> {
  thread.lastSeen = Date.now()
  return Threads.insert(thread)
}

export function removeThread(teamId: string, threadId: string): Promise<void> {
  return Threads.remove({
    threadId,
    teamId,
  })
}

export function findSocket(
  socketId: string,
  teamId: string
): Promise<IThread | undefined> {
  Threads.update(
    {
      socketId,
      teamId,
    },
    { $set: { lastSeen: Date.now() } }
  )
  return Threads.findOne({
    socketId,
    teamId,
  })
}

export function findThread(
  teamId: string,
  threadId: string
): Promise<IThread | undefined> {
  return Threads.findOne({
    threadId,
    teamId,
  })
}

export function addEmailAndRedirectToThread(
  socketId: string,
  teamId: string,
  email: string,
  redirectURL: string
) {
  return Threads.update(
    {
      socketId,
      teamId,
    },
    {
      $set: {
        email,
        redirectURL,
      },
    }
  )
}

export function recordSendEmail(teamId: string, threadId: string) {
  return Threads.update(
    {
      threadId,
      teamId,
    },
    {
      $set: {
        sentEmailAt: Date.now(),
      },
    }
  )
}

export function countThreadsSeenAfter(teamId: string, seenAfter: number) {
  return Threads.count({
    teamId,
    seenAt: { $gte: seenAfter },
  })
}
