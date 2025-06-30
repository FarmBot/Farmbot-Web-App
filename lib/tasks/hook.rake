BASE_URL_API = "https://api.github.com/repos/Farmbot/Farmbot-Web-App/"
COMPARE_URL_API = "#{BASE_URL_API}compare/"
DEPLOYS_URL_API = "#{BASE_URL_API}deployments"
COMMITS_URL_API = "#{BASE_URL_API}commits"
COMPARE_URL_WEB = "https://github.com/Farmbot/Farmbot-Web-App/compare/"
COMMIT_SHA = ENV["HEROKU_BUILD_COMMIT"]
DESCRIPTION = ENV["HEROKU_BUILD_DESCRIPTION"]
WEBHOOK_URL = ENV["RELEASE_WEBHOOK_URL"]
ENVIRONMENT = ENV["HEROKU_APP_NAME"]

def open_json(url)
  begin
    JSON.parse(URI.parse(url).open.read)
  rescue *[OpenURI::HTTPError, SocketError] => exception
    puts exception.message + ": #{url}"
    return {}
  end
end

def last_deploy_commit
  data = open_json(DEPLOYS_URL_API)
  environment = ENVIRONMENT.include?("production") ? "production" : ENVIRONMENT
  data = data.select { |deploy| deploy["environment"] == environment }
  deploy_index = 1 # 0 is the latest in-progress deploy
  (data[deploy_index] || {}).fetch("sha", nil)
end

def commits_since_last_deploy
  last_sha_deployed = last_deploy_commit()
  deploy_commit_found = false
  commits = []
  open_json(COMMITS_URL_API + "?per_page=100").map do |commit|
    if commit.fetch("sha") == last_sha_deployed
      deploy_commit_found = true
      break
    end
    commits.push([commit["commit"]["message"].gsub("\n", " "), commit["sha"]])
  end
  if !deploy_commit_found
    commits.push(["[LAST DEPLOY COMMIT NOT FOUND]", "0000000"])
  end
  commits
end

def details(environment)
  output = "\n\n"
  if !DESCRIPTION.nil?
    output += "#{DESCRIPTION}\n\n"
  end
  web_compare_url = "#{COMPARE_URL_WEB}#{last_deploy_commit}...#{COMMIT_SHA}"
  output += "<#{web_compare_url}|compare>\n"
  messages = commits_since_last_deploy.reverse.map do |commit|
    output += "\n + #{commit[0]} | ##{commit[1][0..5]}"
  end
  output += "\n"
  pre = environment == "production" ? "my" : environment
  base = "#{pre}.farm.bot"
  [
    "promo",
    "promo?config=true&otherPreset=Minimal",
    "demo",
    "try_farmbot",
    "os",
  ].map do |path|
    url = "#{base}/#{path}"
    output += "\n<https://#{url}|#{url}>"
  end
  output
end

namespace :hook do
  desc "Post release info."
  task release_info: :environment do
    if WEBHOOK_URL
      environment = ENVIRONMENT.include?("staging") ? "staging" : "production"
      notification_text = "A new release has been deployed to #{environment}."
      info = notification_text + details(environment)
      payload = {
        "mrkdwn": true,
        "text": notification_text,
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": info,
            }
          }
        ],
        "channel": "#software",
      }.to_json
      Faraday.post(WEBHOOK_URL,
                   payload,
                   "Content-Type" => "application/json")
    end
  end
end
