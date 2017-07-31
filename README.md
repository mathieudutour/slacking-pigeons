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
- [ ] animate opening and new message
- [ ] figure our simple way to deploy

LATER:
- [ ] handle update message
- [ ] hook with https://github.com/rauchg/slackin to have a page to join the slack team
- [ ] enter email to receive replies if leaving
- [ ] tooltip with the name of the user
- [ ] sent/received indicators
- [ ] unread indicator
