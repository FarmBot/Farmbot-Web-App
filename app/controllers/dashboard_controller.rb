class DashboardController < ApplicationController
  # TODO: Possbile Hack?
  # Better ways to support HTML5 push state routing in Rails?
  # I really don't like this controller. But I have not found a better way to
  # support HTML5 push state routing.
  # If anyone knows a better way to support push state routing, please let me
  # know.
  THE_FRONTEND_APP = File.read("public/app/index.html") # Cache in memory.
  ACME_SECRET = ENV["ACME_SECRET"]
  def index
    render plain: THE_FRONTEND_APP, format: :html
  end

  # This endpoint gets hit by Certbot / Let's Encrypt when its time to verify
  # You control a domain name.
  def lets_encrypt
    render plain: ACME_SECRET
  end
end
