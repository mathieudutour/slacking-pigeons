source .env.prod
SERVER_HOST=$SERVER_HOST COLOR=$DEFAULT_COLOR npm run build
cd server/dist
git init
git add .
git commit -m 'deploying'
eb deploy slacking-pigeons-prod2
