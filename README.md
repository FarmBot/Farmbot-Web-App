# FarmBot Web App
[![codebeat badge](https://codebeat.co/badges/7f81859b-67fe-4bdb-b56f-050bfed35e9c)](https://codebeat.co/projects/github-com-farmbot-farmbot-web-app-staging)
[![codecov](https://codecov.io/gh/FarmBot/Farmbot-Web-App/branch/master/graph/badge.svg)](https://codecov.io/gh/FarmBot/Farmbot-Web-App)
[![Coverage Status](https://coveralls.io/repos/github/FarmBot/Farmbot-Web-App/badge.svg)](https://coveralls.io/github/FarmBot/Farmbot-Web-App)
[![Maintainability](https://api.codeclimate.com/v1/badges/74091163d8a02bb8988f/maintainability)](https://codeclimate.com/github/FarmBot/Farmbot-Web-App/maintainability)


# Q: Do I need this?

This repository is intended for *software developers* who wish to modify the [Farmbot Web App](http://my.farmbot.io/). **If you are not a developer**, you are highly encouraged to use [the publicly available web app](http://my.farmbot.io/). Running a server is *a non-trivial task with security implications*. It requires an intermediate background in Ruby, SQL and Linux system administration.

If you are a developer interested in contributing or would like to provision your own server, you are in the right place.

# Q: Where do I report security issues?

We take security seriously and value the input of independent researchers. Please see our [responsible disclosure guidelines](https://farm.bot/responsible-disclosure-of-security-vulnerabilities/).

# Q: What is the Farmbot Web App?

This repo contains FarmBot's web based user interface, a RESTful JSON API and a Dockerized MQTT server. The API stores data such as user account information, plant data, authorization tokens and a variety of other resources. The MQTT server facilitates realtime messaging from the browser to the device.

# Q: Can I see some example API requests?

For a list of example API requests and responses, see our [reference documentation](https://gist.github.com/RickCarlino/10db2df375d717e9efdd3c2d9d8932af). If you wish to write an add-on application that uses the FarmBot API, please let us know in an issue. We are happy to answer any specific questions you may have.

# Q: How do I Setup an instance locally?

## Prerequisites

You will need the following:

 1. A Linux or Mac based machine. We do not support windows at this time.
 0. [Docker 17.06.0-ce or greater](https://docs.docker.com/engine/installation/)
 0. [Ruby 2..5.0](http://rvm.io/rvm/install)
 0. [ImageMagick](https://www.imagemagick.org/script/index.php) (`brew install imagemagick` (Mac) or `sudo apt-get install imagemagick` (Ubuntu))
 0. [Node JS >= v8.9.0](https://nodejs.org/en/download/)
 0. [`libpq-dev` and `postgresql`](http://stackoverflow.com/questions/6040583/cant-find-the-libpq-fe-h-header-when-trying-to-install-pg-gem/6040822#6040822) and `postgresql-contrib`
 0. `gem install bundler`

### Setup

**NOTE:** A step-by-step setup guide for Ubuntu 17 users can be found [here](https://github.com/FarmBot/Farmbot-Web-App/blob/master/ubuntu_example.sh)

Setup for non-Ubuntu users after installing the dependencies listed above:

 1. `git clone https://github.com/FarmBot/Farmbot-Web-App --branch=master --depth=10`
 0. `cd Farmbot-Web-App`
 0. `bundle install`
 0. `yarn install`
 0. Database config: Copy `config/database.example.yml` to `config/database.yml` via `cp config/database.example.yml config/database.yml`
 0. App config: **MOST IMPORTANT STEP**. Copy `config/application.example.yml` to `config/application.yml` via `mv config/application.example.yml config/application.yml`. **Please read the instructions inside the file. Replace the example values provided with real world values.**
 0. Give permission to create a database*
 0. `rake db:create:all db:migrate db:seed`
 0. (optional) Verify installation with `RAILS_ENV=test rake db:create db:migrate && rspec spec` (API) and `npm run test` (Frontend).
 0. Start server with `rails api:start`. Make sure you set an `MQTT_HOST` entry in `application.yml` pointing to the IP address or domain of  MQTT server. If you are not running the MQTT server on a separate machine, `MQTT_HOST` and `API_HOST` will point to the same server.
 0. Start MQTT with `rails mqtt:start`. **Important note:** You may be required to enter a `sudo` password because [docker requires root access](https://docs.docker.com/engine/security/security/#docker-daemon-attack-surface).
 0. Open [localhost:3000](http://localhost:3000).
 0. [Raise an issue](https://github.com/FarmBot/Farmbot-Web-App/issues/new?title=Installation%20Failure) if you hit problems with any of these steps. *We can't fix issues we don't know about.*

\*Give permission to `user` to create database:
```
sudo -u postgres psql
CREATE USER "user" WITH SUPERUSER;
```

# Q: Is Dokku / Docker supported?

Dokku (a Docker management system) is partially supported. Pull requests welcome. Please see `deployment.md` for more information.

# Config Settings (important)

We try our best to follow the [12 Factor Methodology](https://12factor.net/). Part of that means using ENV variables as a means of [storing configuration](https://12factor.net/config). **Your server won't run without setting ENV variables first**.

You can accomplish this by setting the ENV variables directly from your shell / server management tool or by writing an `application.yml` file.

See `config/application.example.yml` for a list of all the variables that must be set.

**Encryption keys**: Encryption keys will be auto-generated if not present. They can be reset using `rake keys:generate`. If `ENV['RSA_KEY']` is set, it will be used in place of the `*.pem` files. Useful for environments like Heroku, where file system access is not allowed.

**We can't fix issues we don't know about.** Please submit an issue if you are having trouble installing on your local machine.

# Q: How can I Generate an API token?

You must pass a `token` string into most HTTP requests under the `Authorization: ` request header.

Here's what a response looks like when you request a token:

```json
{
    "token": {
        "unencoded": {
            "sub": "test123@test.com",
            "iat": 1459109728,
            "jti": "922a5a0d-0b3a-4767-9318-1e41ae600352",
            "iss": "http://localhost:3000/",
            "exp": 1459455328,
            "mqtt": "localhost",
            "bot": "aa7bb37f-5ba3-4654-b2e4-58ed5746508c"
        },
        "encoded":
        // THE IMPORTANT PART IS HERE!!:
         "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0MTIzQHRlc3QuY29tIiwiaWF0IjoxNDU5MTA5NzI4LCJqdGkiOiI5MjJhNWEwZC0wYjNhLTQ3NjctOTMxOC0xZTQxYWU2MDAzNTIiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAvIiwiZXhwIjoxNDU5NDU1MzI4LCJtcXR0IjoibG9jYWxob3N0IiwiYm90IjoiYWE3YmIzN2YtNWJhMy00NjU0LWIyZTQtNThlZDU3NDY1MDhjIn0.KpkNGR9YH68AF3iHP48GormqXzspBJrDGm23aMFGyL_eRIN8iKzy4gw733SaJgFjmebJOqZkz3cly9P5ZpCKwlaxAyn9RvfjQgFcUK0mywWAAvKp5lHfOFLhBBGICTW1r4HcZBgY1zTzVBw4BqS4zM7Y0BAAsflYRdl4dDRG_236p9ETCj0MSYxFagfLLLq0W63943jSJtNwv_nzfqi3TTi0xASB14k5vYMzUDXrC-Z2iBdgmwAYUZUVTi2HsfzkIkRcTZGE7l-rF6lvYKIiKpYx23x_d7xGjnQb8hqbDmLDRXZJnSBY3zGY7oEURxncGBMUp4F_Yaf3ftg4Ry7CiA"
    }
}
```

**Important:** The response is provided as JSON for human readability. For your `Authorization` header, you will only be using `data.token.encoded`. In this example, it's the string starting with `eyJ0eXAiOiJ...`

## Via CURL

```
curl -H "Content-Type: application/json" \
     -X POST \
     -d '{"user":{"email":"test123@test.com","password":"password123"}}' \
     https://my.farmbot.io/api/tokens
```

## Via JQuery

Since the API supports [CORS](http://enable-cors.org/), you can generate your token right in the browser.

Here's an example:

```javascript
$.ajax({
    url: "https://my.farmbot.io/api/tokens",
    type: "POST",
    data: JSON.stringify({user: {email: 'admin@admin.com', password: 'password123'}}),
    contentType: "application/json",
    success: function (data) {
                 // You can now use your token:
                 var MY_SHINY_TOKEN = data.token.encoded;
             }
});
```

# Want to Help?

[Low Hanging Fruit](https://github.com/FarmBot/Farmbot-Web-App/search?utf8=%E2%9C%93&q=todo). [Raise an issue](https://github.com/FarmBot/Farmbot-Web-App/issues/new?title=Question%20about%20a%20TODO) if you have any questions.

## Translating the web app into your language

Thanks for your interest in internationalizing the FarmBot web app! To add translations:

1. Fork this repo
0. Navigate to `/public/app-resources/languages` and run the command `node _helper.js yy` where `yy` is your language's [language code](http://www.science.co.il/Language/Locale-codes.php). Eg: `ru` for Russian.
0. Edit the translations in the file created in the previous step: `"phrase": "translated phrase"`.
0. When you have updated or added new translations, commit/push your changes and submit a pull request.
