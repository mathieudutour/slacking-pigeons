import Monk, { IObjectID } from 'monk'
const monk = Monk(process.env.MONGO_URL || 'localhost:27017')

const Teams = monk.get('teams')
Teams.createIndex('teamId')

const Threads = monk.get('threads')
Threads.createIndex('teamId threadId')
Threads.createIndex('teamId socketId')

export interface ITeam {
  readonly teamId: string
  readonly token: string
  readonly bot_id?: string
  readonly channel: string
}

export interface IThread {
  readonly teamId: string
  readonly threadId: string
  readonly socketId: string
}

export function createOrUpdateNewTeam(team: ITeam): Promise<void> {
  return findTeam(team.teamId).then(res => {
    if (res) {
      return Teams.update(
        { teamId: team.teamId },
        {
          $set: {
            token: team.token,
            channel: team.channel,
          },
        }
      )
    }
    return Teams.insert(team)
  })
}

export function findTeam(teamId: string): Promise<ITeam | undefined> {
  return Teams.findOne({ teamId })
}

export function addBotIdToTeam(teamId: string, bot_id: string): Promise<void> {
  return Teams.update({ teamId }, { $set: { bot_id } })
}

export function createNewThread(thread: IThread): Promise<void> {
  return Threads.insert(thread)
}

export function removeThread(threadId: string, teamId: string): Promise<void> {
  return Threads.remove({ threadId, teamId })
}

export function findSocket(
  socketId: string,
  teamId: string
): Promise<IThread | undefined> {
  return Threads.findOne({
    socketId,
    teamId,
  })
}

export function findThread(
  threadId: string,
  teamId: string
): Promise<IThread | undefined> {
  return Threads.findOne({
    threadId,
    teamId,
  })
}
