BASE_URL_API = "https://api.github.com/repos/Farmbot/Farmbot-Web-App/"
COMPARE_URL_API = "#{BASE_URL_API}compare/"
DEPLOYS_URL_API = "#{BASE_URL_API}deployments"
COMMITS_URL_API = "#{BASE_URL_API}commits"
COMPARE_URL_WEB = "https://github.com/Farmbot/Farmbot-Web-App/compare/"
COMMIT_SHA = ENV["HEROKU_BUILD_COMMIT"]
DESCRIPTION = ENV["HEROKU_BUILD_DESCRIPTION"]
WEBHOOK_URL = ENV["RELEASE_WEBHOOK_URL"]
ENVIRONMENT = ENV["HEROKU_APP_NAME"]
LAST_DEPLOY_COMMIT_OVERRIDE = ENV["LAST_DEPLOY_COMMIT_OVERRIDE"]

def open_json(url)
  begin
    JSON.parse(URI.parse(url).open.read)
  rescue *[OpenURI::HTTPError, SocketError] => exception
    puts exception.message + ": #{url}"
    return {}
  end
end

def last_deploy_sha
  if LAST_DEPLOY_COMMIT_OVERRIDE
    return LAST_DEPLOY_COMMIT_OVERRIDE
  end
  data = open_json(DEPLOYS_URL_API)
  environment = ENVIRONMENT.include?("production") ? "production" : ENVIRONMENT
  data = data.select { |deploy| deploy["environment"] == environment }
  deploy_index = 1 # 0 is the latest in-progress deploy
  (data[deploy_index] || {}).fetch("sha", nil)
end

def branch
  ENVIRONMENT.include?("production") ? "main" : "staging"
end

def first_branch_sha
  open_json(COMMITS_URL_API + "?per_page=1&sha=#{branch}")[0].fetch("sha")
end

def commits_since(sha)
  compare_url = "#{COMPARE_URL_API}#{sha}...#{COMMIT_SHA}"
  open_json(compare_url)["commits"]
end

def commit_list(commits)
  commits.map { |commit|
    [commit["commit"]["message"].gsub("\n", " "), commit["sha"]]
  }
end

def compare_link(sha)
  web_compare_url = "#{COMPARE_URL_WEB}#{sha}...#{COMMIT_SHA}"
  "<#{web_compare_url}|compare>"
end

def commits_and_compare_link
  commits = commits_since(last_deploy_sha)
  compare = compare_link(last_deploy_sha)
  if commits.nil?
    commits = commits_since(first_branch_sha)
    compare = compare_link(first_branch_sha)
  end
  if commits.nil?
    commits = []
    compare = ""
  end
  return {commits: commit_list(commits), compare: compare}
end

def block_data
  @block_data ||= commits_and_compare_link
end

def intro_block(start_text, environment)
  output = start_text
  output += "\n\n"
  if !DESCRIPTION.nil?
    output += "#{DESCRIPTION}\n\n"
  end
  output += block_data[:compare]
  output
end

def commit_blocks(environment)
  outputs = []
  block_data[:commits].reverse.each_slice(25) do |commits|
    output = ""
    commits.map do |commit|
      output += "\n + #{commit[0]} | ##{commit[1][0..5]}"
    end
    outputs.push(output)
  end
  outputs
end

def links_block(environment)
  output = ""
  pre = environment == "production" ? "my" : environment
  base = "#{pre}.farm.bot"
  [
    "",
    "promo",
    "promo?config=true&otherPreset=Minimal",
    "os",
    "try_farmbot",
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
      payload = {
        "mrkdwn": true,
        "text": notification_text,
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": intro_block(notification_text, environment),
            }
          },
          *commit_blocks(environment).map do |commit_block_text|
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": commit_block_text,
              }
            }
          end,
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": links_block(environment),
            }
          },
        ],
        "channel": "#software",
      }.to_json
      response = Faraday.post(WEBHOOK_URL,
                   payload,
                   "Content-Type" => "application/json")
      puts "Status: #{response.status} #{response.body}"
    end
  end
end
