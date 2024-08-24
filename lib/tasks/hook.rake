BASE_URL_API = "https://api.github.com/repos/Farmbot/Farmbot-Web-App/"
COMPARE_URL_API = "#{BASE_URL_API}compare/"
DEPLOYS_URL_API = "#{BASE_URL_API}deployments"
COMPARE_URL_WEB = "https://github.com/Farmbot/Farmbot-Web-App/compare/"
COMMIT_SHA = ENV["HEROKU_BUILD_COMMIT"]
DESCRIPTION = ENV["HEROKU_BUILD_DESCRIPTION"]
WEBHOOK_URL = ENV["RELEASE_WEBHOOK_URL"]

def open_json(url)
  begin
    JSON.parse(URI.parse(url).open.read)
  rescue *[OpenURI::HTTPError, SocketError] => exception
    puts exception.message + ": #{url}"
    return {}
  end
end

def commits_since_main
  base_head = "main...#{COMMIT_SHA}"
  url = "#{COMPARE_URL_API}#{base_head}"
  data = open_json(url)
  data.fetch("commits", [])
end

def last_deploy_commit
  data = open_json(DEPLOYS_URL_API)
  (data[1] || {}).fetch("sha", nil)
end

def commits_since_last_deploy
  last_sha_deployed = last_deploy_commit()
  commits = []
  commits_since_main.reverse.map do |commit|
    if commit.fetch("sha") == last_sha_deployed
      break
    end
    commits.push(commit["commit"]["message"].gsub("\n", " "))
  end
  commits
end

def details
  output = "\n\n"
  if !DESCRIPTION.nil?
    output += "#{DESCRIPTION}\n\n"
  end
  web_compare_url = "#{COMPARE_URL_WEB}#{last_deploy_commit}...#{COMMIT_SHA}"
  output += "<#{web_compare_url}|compare>\n"
  messages = commits_since_last_deploy.reverse.map do |commit|
    output += "\n + #{commit}"
  end
  output
end

namespace :hook do
  desc "Post release info."
  task release_info: :environment do
    if WEBHOOK_URL
      notification_text = "A new release has been deployed to the server."
      info = notification_text + details
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
