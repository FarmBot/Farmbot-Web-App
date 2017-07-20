[![Code Climate](https://codeclimate.com/github/FarmBot/farmbot-web-app/badges/gpa.svg)](https://codeclimate.com/github/FarmBot/farmbot-web-app)
[![Coverage Status](https://coveralls.io/repos/github/FarmBot/Farmbot-Web-App/badge.svg)](https://coveralls.io/github/FarmBot/Farmbot-Web-App)

# Q: Do I need this?

This repository is intended for *software developers* who wish to modify the [Farmbot Web App](http://my.farmbot.io/). **If you are not a developer**, you are highly encouraged to use [the publicly available web app](http://my.farmbot.io/). Running a server is a non-trivial task which will require an intermediate background in Ruby, SQL and Linux system administration.

If you are a developer interested in contributing or would like to provision your own server, you are in the right place.

# Q: What is the Farmbot Web App?

This repo contains the web based user interface and RESTful JSON API for Farmbot. This includes things like storage of user data, plant data, authorization tokens and a variety of other resources.

The key responsibility of the API is *information and permissions management*. This should not be confused with device control, which is done via [MQTT](https://github.com/FarmBot/mqtt-gateway).

# Q: Can I see some example API requests?

For a list of example API requests and responses, see our [reference documentation](https://gist.github.com/RickCarlino/10db2df375d717e9efdd3c2d9d8932af). If you wish to write an add-on application that uses the FarmBot API, please let us know in an issue. We are happy to answer any specific questions you may have.

# Q: How do I Setup an instance locally?

## Prerequisites

You will need the following:

 0. A Linux or Mac based machine. We do not support windows at this time.
 0. [Ruby 2.4.1](http://rvm.io/rvm/install)
 0. [ImageMagick](https://www.imagemagick.org/script/index.php) (`brew install imagemagick` (Mac) or `sudo apt-get install imagemagick` (Ubuntu))
 0. [Node JS > v6](https://nodejs.org/en/download/)
 0. [`libpq-dev` and `postgresql`](http://stackoverflow.com/questions/6040583/cant-find-the-libpq-fe-h-header-when-trying-to-install-pg-gem/6040822#6040822)

### Setup

 0. `git clone https://github.com/FarmBot/Farmbot-Web-App`
 0. `cd Farmbot-Web-App`
 0. `bundle install`
 0. `yarn install`
 0. **MOST IMPORTANT STEP**. Copy `config/database.example.yml` to `config/database.yml`. In GNU/Linux or Mac: `mv config/database.example.yml config/database.yml`. **Please read the instructions inside the file. Replace the example values provided with real world values.**
 0. Give permission to create a database*
 0. `rake db:create:all db:migrate db:seed`
 0. (optional) Verify installation with `RAILS_ENV=test rake db:create db:migrate && rspec spec`.
 0. Start server with `npm run dev`. Make sure you set an `MQTT_HOST` entry in `application.yml` pointing to the IP address or domain of the (soon-to-be-installed) MQTT server. You will need to set that up next.
 0. Now that the API server is running, [provision an MQTT server](https://github.com/FarmBot/mqtt-gateway).
 0. Open [localhost:8080](http://localhost:8080). The application is now ready for use.
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
