require_relative '../key_gen'

namespace :frontend do
  desc "Install the frontend into /public"
  task install: :environment do
    `

    git clone https://github.com/FarmBot/farmbot-web-frontend.git public
    cd public
    npm install
    npm run build

    `
  end
end
