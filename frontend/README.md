[![Build Status](https://travis-ci.org/FarmBot/farmbot-web-frontend.svg?branch=master)](https://travis-ci.org/FarmBot/farmbot-web-frontend)
[![codebeat badge](https://codebeat.co/badges/73a8b8b6-2683-4bea-a759-e3a07210e4ca)](https://codebeat.co/projects/github-com-rickcarlino-farmbot-web-frontend-master)
[![Coverage Status](https://coveralls.io/repos/github/FarmBot/farmbot-web-frontend/badge.svg?branch=master)](https://coveralls.io/github/FarmBot/farmbot-web-frontend?branch=master) (we're working on it)
# Do I need this?

This repository is intended for *software developers* who wish to modify the frontend of the FarmBot Web App or host it on their own server. **If you are not a developer**, you are highly encouraged to use the free hosted web app at [my.farmbot.io](http://my.farmbot.io/).

If you would like to report a problem with the web app, please [submit an issue](https://github.com/FarmBot/farmbot-web-frontend/issues/new).

# FarmBot Web Frontend

 This is the Javascript / HTML / CSS of the FarmBot web app. It depends on a [backend API](https://github.com/FarmBot/Farmbot-Web-API) (my.farmbot.io by default).

# Developer Setup

**[LATEST STABLE VERSION IS HERE](https://github.com/FarmBot/farmbot-web-frontend/releases)** :star: :star: :star:

0. [Install node](https://nodejs.org/en/download/) if you haven't already.
1. [Install Google Chrome](https://www.google.com/chrome/) for best app experience.
2. `git clone https://github.com/FarmBot/farmbot-web-frontend.git`
3. `cd farmbot-web-frontend`
4. `npm install`
5. `npm start`
6. Visit `http://localhost:8080/`

# Deploy to Production

**NOTE:** The [Web API](https://github.com/FarmBot/Farmbot-Web-API) deployment will automatically build the latest version of the frontend and mount it in the web server. The instructions below are intended for reference purposes, or for users who wish to host their frontend code on a different server than their API.

1. (optional, usually not needed) If you have an NPM module that needs to get baked into the build, pass the NPM modules name in as `NPM_ADDON=foo`
2. run `npm run build`
3. Copy the contents of `/app` into your webserver and it will be accessible via `/`.
4. Visit `/` on your web server to verify installation.
5. [Submit an issue](https://github.com/FarmBot/farmbot-web-frontend/issues/new?title=Installation%20Failure) if you hit problems during the installation.

# Debugging external devices (DEV ONLY)

[Weinre](https://www.npmjs.com/package/weinre) is included in this project.
To utilize it, head over to the `/src` directory of the app, add a file called
`config.json`, and populate it with this:
```
{
    "ip_address": "YOUR-IP-ADDRESS"
}
```
Then, in your console, `weinre --boundHost YOUR-IP-ADDRESS --httpPort 8081`.
This should run in tandem with the rest of your project.
Then navigate to http://YOUR-IP-ADDRESS:8081/client/#anonymous.
After adding the `config.json`, you may be required to `npm start` again.

# Want to Help?

Check out the [Low Hanging Fruit](https://github.com/FarmBot/farmbot-web-frontend/search?l=typescript&q=TODO&utf8=%E2%9C%93).

Also, if you're experiencing UI/UX issues, please include any possible specifications (device type, device OS, and device browser) to help in the debugging process. Bonus points for GIFs and screenshots. :fist:

# Translating the app into your language
Thanks for your interest in internationalizing the FarmBot web app! To add translations:

1. Fork this repo
2. Create a `yy.js` file in ``/public/app-resources/languages/`` where `yy` is your language's [language code](http://www.science.co.il/Language/Locale-codes.php). Eg: `ru` for Russian. If your language already has a file, then you can skip this step.
3. Search the application for calls to `t()`. Any file that imports `from "i18next"` will have strings that require translation.
4. When you have updated or added new translations, commit/push your changes and submit a pull request.
