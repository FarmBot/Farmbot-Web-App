# Farmbot Web Frontend

 This is the Javascript / HTML / CSS related to Farmbot's browser control app. It depends on a [backend API](https://github.com/FarmBot/farmbot-web-app) (my.farmbot.io by default).

# Up and Running

0. [Install node](https://nodejs.org/en/download/) if you haven't already.
1. git clone https://github.com/FarmBot/farmbot-web-frontend.git
2. cd farmbot-web-frontend
3. npm install
4. run `npm start`
5. Visit `http://localhost:8080/`

# Deploy to Production

1. run `npm run build`
2. Upload `tools/dist/farmbot-production.min.js` to your server.
3. Add `<script src="entry.min.js">` to the page at `app/index.html`. This is the only endpoint we support at the moment. PRs welcome.
4. Please, [raise an issue](https://github.com/FarmBot/farmbot-web-frontend/issues/new?title=Help,%20I%20cant%20setup!) if you have any trouble setting up.

# Configuration

All config is in the user auth token. There's no need to point to an MQTT URL or a particular bot. That information is contained in your auth token.

# Low Hanging Fruit

Are you a developer? Do you want to help? Don't know where to start?

Here are some easy-to-do tasks that our (small) team hasn't gotten around to yet:

 - [ ] Writing unit tests for existing code.
 - [ ] Factoring out implcity `any` types. This was originally a vanilla JS project that later became TypeScript. We have a lot of "unsafe" code that does not have type annotations yet.
 - [ ] DRY up URL usage into a URL config object. A lot of AJAX requests are still relying on hardcoded strings rather than DRY configuration.
 - [ ] Any comment in sourcode with the word `HACK` or `TODO`.
