import * as Stripe from 'stripe'
import { IncomingMessage, ServerResponse } from 'http'
import { text, send } from 'micro'
import { findTeam, updateTeam } from '../monk'

const stripe: StripeNode.Stripe & {
  webhooks?: {
    constructEvent: (body: string, sig: string | string[], secret: string) => any
  }
} = Stripe(process.env.STRIPE_SECRET!)

export async function handler (req: IncomingMessage, res: ServerResponse) {
  const sig = req.headers['stripe-signature']
  const body = await text(req)
  const stripeEvent = stripe.webhooks!.constructEvent(body, sig, process.env.STRIPE_ENDPOINT_SECRET!)

  const subscription = stripeEvent.data.object
  if (subscription.object === 'subscription' && subscription.status !== 'active') {
    const customer = await stripe.customers.retrieve(subscription.customer)

    if (!customer) {
      send(res, 204, 'nothing to do')
      return
    }

    const team = await findTeam((customer.metadata as {teamId: string}).teamId)

    if (!team) {
      send(res, 204, 'nothing to do')
      return
    }

    await updateTeam(team.teamId, {
      premium: false
    })

    send(res, 202, 'done')

  } else {
    send(res, 204, 'nothing to do')
  }
}
