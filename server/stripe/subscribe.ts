import * as Stripe from 'stripe'
import { IncomingMessage, ServerResponse } from 'http'
import { text, json, send } from 'micro'
import { findTeam, updateTeam } from '../monk'
import { loggedIn, upsell, addToSlack } from '../views'
import { parseQuery } from '../_parseQuery'

const stripe = Stripe(process.env.STRIPE_SECRET!)

export async function subscribeToPremium(
  req: IncomingMessage,
  res: ServerResponse
) {
  const body = parseQuery(await text(req)) as {
    stripeToken: string
    teamId: string
    stripeEmail: string
    coupon?: string
  }

  const team = await findTeam(body.teamId)

  res.setHeader('Content-Type', 'text/html')

  if (!team) {
    send(res, 404, addToSlack())
    return
  }

  if (team.premium) {
    send(res, 202, loggedIn(body.teamId, team.channels[0]))
    return
  }

  try {
    let stripeId = team.stripeId

    if (stripeId) {
      await stripe.customers.update(stripeId, {
        email: body.stripeEmail,
        source: body.stripeToken,
        metadata: {
          teamId: body.teamId,
        },
      })
    } else {
      stripeId = (await stripe.customers.create({
        email: body.stripeEmail,
        source: body.stripeToken,
        metadata: {
          teamId: body.teamId,
        },
      })).id
    }

    await stripe.subscriptions.create({
      customer: stripeId,
      plan: 'premium-1-month',
      coupon: body.coupon || undefined,
    })

    await updateTeam(body.teamId, {
      premium: true,
      stripeId: stripeId,
      email: body.stripeEmail,
    })
  } catch (err) {
    if (!err.type) {
      send(
        res,
        500,
        upsell(
          body.teamId,
          `${err.message}. How did that happen!? Please ping me.`
        )
      )
      return
    }
    switch (err.type) {
      case 'StripeCardError':
        // A declined card error
        const message = err.message // => e.g. "Your card's expiration year is invalid."
        send(res, 400, upsell(body.teamId, team.channels[0], message))
        break
      case 'RateLimitError':
        // Too many requests made to the API too quickly
        send(
          res,
          503,
          upsell(body.teamId, `Server is a bit overloaded, try again in a bit`)
        )
        break
      case 'StripeInvalidRequestError':
        // Invalid parameters were supplied to Stripe's API
        send(res, 400, upsell(body.teamId, team.channels[0], `Bad request`))
        break
      case 'StripeAPIError':
        // An error occurred internally with Stripe's API
        send(res, 500, upsell(body.teamId, team.channels[0], `Stripe failed, sorry about that`))
        break
      case 'StripeConnectionError':
        // Some kind of error occurred during the HTTPS communication
        send(res, 500, upsell(body.teamId, team.channels[0], `Stripe is down, sorry about that`))
        break
      case 'StripeAuthenticationError':
        // You probably used an incorrect API key
        send(
          res,
          500,
          upsell(body.teamId, team.channels[0], `How did that happen!? Please ping me.`)
        )
        break
      default:
        // Handle any other types of unexpected errors
        send(
          res,
          500,
          upsell(
            body.teamId, team.channels[0],
            `${err.message}. How did that happen!? Please ping me.`
          )
        )
        break
    }
    return
  }

  send(res, 200, loggedIn(body.teamId, team.channels[0]))
}
