<h1 align="center">Slacking Pigeons</h1>

<div align="center">
  <img src="https://user-images.githubusercontent.com/3254314/29243751-bb628be2-7f5b-11e7-9c88-df4bdbd3cf71.png" />
</div>
<br />
<div align="center">
  <strong>Chat in real time with your users directly from Slack</strong>
</div>

Slacking Pigeons lets chat in real time with your users directly from Slack. No need for another tool, everybody can jump in to answer a question.

- Each new user's question will create a new thread, keeping everything cleanly in one place
- You can invite some people to join the support channel and help orient newcomers. There is no operator's limitations!
- Every bits is completely open source. Build the features you need and become a part of future releases.

![Slacking pigeons demo](https://user-images.githubusercontent.com/3254314/29005469-057cd2f2-7a91-11e7-95ba-1c4a49401eb3.gif)

## :bird: How can I get it?

Just click here:

 - [Add to slack](https://slack.com/oauth/authorize?&client_id=218949921206.219415872899&scope=incoming-webhook,channels:history,chat:write:bot,users:read,groups:history)


## :bird: I have a problem with Slacking Pigeons

First, please search the [open issues](https://github.com/mathieudutour/slacking-pigeons/issues?q=is%3Aopen)
and [closed issues](https://github.com/mathieudutour/slacking-pigeons/issues?q=is%3Aclosed)
to see if your issue hasn't already been reported (it may also be fixed).

If you can't find an issue that matches what you're seeing, open a [new issue](https://github.com/mathieudutour/slacking-pigeons/issues/new).

## :bird: How can I contribute to Slacking Pigeons?

If you're looking for something to work on, check out the [accepting-prs](https://github.com/kactus-io/kactus/issues?q=is%3Aopen+is%3Aissue+label%3Aaccepting-prs) label.

Here is how to get started with a developer environment:
```
# install deps
npm i

# replace environment variables
cp .env.sample .env
source .env

cd client && npm run watch
cd server && npm run watch && npm run start
open http://localhost:4000
open http://localhost:2708

# install ngrok to expose localhost
npm i -g ngrok
ngrok http 4000
```

## :bird: More Resources

See [slacking-pigeons.com](https://slacking-pigeons.com) for more product-oriented
information about Slacking Pigeons.

## :bird: License

**[GPLv3](http://www.gnu.org/licenses/gpl-3.0.html)**


