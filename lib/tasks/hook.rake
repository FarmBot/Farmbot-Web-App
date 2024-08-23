COMPARE_URL_API = "https://api.github.com/repos/Farmbot/Farmbot-Web-App/compare/"
COMPARE_URL_WEB = "https://github.com/Farmbot/Farmbot-Web-App/compare/"
COMMIT_SHA = ENV["HEROKU_BUILD_COMMIT"]
DESCRIPTION = ENV["HEROKU_BUILD_DESCRIPTION"]
WEBHOOK_URL = ENV["RELEASE_WEBHOOK_URL"]

def open_json(url)
  begin
    JSON.parse(URI.parse(url).open.read)
  rescue *[OpenURI::HTTPError, SocketError] => exception
    puts exception.message
    return {}
  end
end

def commit_messages
  base_head = "main...#{COMMIT_SHA}"
  url = "#{COMPARE_URL_API}#{base_head}"
  data = open_json(url)
  commits = data.fetch("commits", [])
  web_url = "#{COMPARE_URL_WEB}#{base_head}"
  output = "\n\n"
  if !DESCRIPTION.nil?
    output += "#{DESCRIPTION}\n\n"
  end
  output += "<#{web_url}|compare>\n"
  messages = commits.map do |x|
    output += "\n + #{x["commit"]["message"].gsub("\n", " ")}"
  end
  output
end

namespace :hook do
  desc "Post release info."
  task release_info: :environment do
    if WEBHOOK_URL
      notification_text = "A new release has been deployed to the server."
      info = notification_text + commit_messages
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
