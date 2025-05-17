web: npm start
release: if [ "$NODE_ENV" = "production" ]; then cd server && npx knex migrate:latest --knexfile knexfile.js --env production || exit 1; fi 