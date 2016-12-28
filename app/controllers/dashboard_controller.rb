class DashboardController < ApplicationController
  # TODO: Possbile Hack? find better ways to support HTML5 push state routing
  # in Rails when the frontend and the backend are decoupled? I really don't
  # like this controller but have not found a better way to support HTML5 push
  # state routing. If anyone knows a better way to support push state routing,
  # please let me know.
  THE_FRONTEND_APP = File.read("public/app/index.html").html_safe
  ACME_SECRET      = ENV["ACME_SECRET"]

  def index
    render html: THE_FRONTEND_APP, layout: false
  end

  # Hit by Certbot / Let's Encrypt when its time to verify control of domain.
  def lets_encrypt
    render plain: ACME_SECRET
  end
end
