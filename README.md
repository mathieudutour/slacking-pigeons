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
- [ ] handle update message
- [ ] animate opening and new message
- [ ] tooltip with the name of the user
- [ ] figure our simple way to deploy
