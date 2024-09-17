class WebhooksController < ApplicationController

  skip_before_action :verify_authenticity_token

  def create
    request_body = request.raw_post
    heroku_signature = request.headers['Heroku-Webhook-Hmac-SHA256']
    secret = ENV['HEROKU_WEBHOOK_SECRET']

    if secret.nil?
      render json: { message: 'Secret not set' }, status: :forbidden
      return
    end
    calculated_signature = Base64.strict_encode64(OpenSSL::HMAC.digest('sha256', secret, request_body))

    if heroku_signature && secure_compare(calculated_signature, heroku_signature)
      webhook_url = ENV["RELEASE_WEBHOOK_URL"]
      current = params[:data][:current]
      status = params[:data][:status]
      build = params[:resource] == "build" && params[:action] == "create" && status == "pending"
      if webhook_url && (current || build)
        environment = ENV["HEROKU_APP_NAME"]&.include?("staging") ? "staging" : "production"
        notification_text = "New #{environment} Heroku event: "
        if build
          output = params[:data][:output_stream_url]
          notification_text += "Build started"
          details = "<#{output}|build log>"
        else
          notification_text += "#{params[:data][:description]} `#{status}`"
          commit_desc = params[:data][:slug][:commit_description]
          details = commit_desc
        end
        payload = {
          "mrkdwn": true,
          "text": notification_text,
          "blocks": [
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": "#{notification_text}\n#{details}",
              }
            }
          ],
          "channel": "#software",
        }.to_json
        Faraday.post(webhook_url,
                     payload,
                     "Content-Type" => "application/json")
      end
      render json: { message: 'Webhook received successfully' }, status: :ok
    else
      render json: { message: 'Invalid signature' }, status: :forbidden
    end
  end

  private

  def secure_compare(calculated_signature, heroku_signature)
    ActiveSupport::SecurityUtils.secure_compare(calculated_signature, heroku_signature)
  end
end
