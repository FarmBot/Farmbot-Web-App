class ApplicationMailer < ActionMailer::Base
  EMAIL_HOST = ENV["API_HOST"] || "please-set-api-host.com"
  default from: "farmbot-mailer@#{EMAIL_HOST}"
  layout 'mailer'
end
