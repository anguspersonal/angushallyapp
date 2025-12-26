#!/bin/bash

# Script to set Raindrop.io OAuth redirect URI for production
# This fixes the "Cannot GET /v2/oauth/undefined" error

echo "Setting Raindrop.io production environment variables..."

# Set the production redirect URI
heroku config:set RAINDROP_REDIRECT_URI="https://angushally.com/api/raindrop/oauth/callback" --app angushallyapp

echo "Done! Current Raindrop configuration:"
heroku config:get RAINDROP_CLIENT_ID --app angushallyapp
heroku config:get RAINDROP_CLIENT_SECRET --app angushallyapp
heroku config:get RAINDROP_REDIRECT_URI --app angushallyapp 