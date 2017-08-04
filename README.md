```
# install deps
npm i

# replace environment variables
cp .env.sample .env
source .env

cd client && npm run build
cd server && npm run build && npm run start
open http://localhost:4000

# install ngrok to expose localhost
npm i -g ngrok
ngrok http 4000
```

TODO:
- [x] copy at the top
- [x] scroll to bottom when adding a message
- [x] emoji
- [x] load history
- [x] figure out how to find bot id
- [x] figure our simple way to deploy
- [ ] landing page
- [ ] success page with installation instruction

LATER:
- [ ] method to interact with the widget (open, add message, etc.)
- [ ] animate opening and new message
- [ ] handle update message
- [ ] hook with https://github.com/rauchg/slackin to have a page to join the slack team
- [ ] enter email to receive replies if leaving
- [ ] tooltip with the name of the user
- [ ] sent/received indicators
- [ ] unread indicator
- [ ] private request (to target another channel, possibly private message)
- [ ] hook up twitter, facebook
