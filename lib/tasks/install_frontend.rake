require_relative '../key_gen'

namespace :frontend do
  desc "Install the frontend into /public"
  task install: :environment do
    `rm -rf /tmp/farmbot_frontend`
    `mkdir /tmp/farmbot_frontend`
    `git clone https://github.com/rickcarlino/farmbot-web-frontend.git /tmp/farmbot_frontend
     rm -rf /tmp/farmbot_frontend/.git
     cp -R /tmp/farmbot_frontend/* public/ 
     cd public
     npm install webpack
     npm install --production
     npm run build`
  end
end
