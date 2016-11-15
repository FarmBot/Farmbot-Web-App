class DashboardController < ApplicationController
  # TODO: Possbile Hack?
  # Better ways to support HTML5 push state routing in Rails?
  # I really don't like this controller. But I have not found a better way to
  # support HTML5 push state routing.
  # If anyone knows a better way to support push state routing, please let me
  # know.
  THE_FRONTEND_APP = File.read("public/app/index.html") # Cache in memory.
  LETS_ENCRYPT_CHALENGE = ENV["LETS_ENCRYPT"] || "SET ENV['LETS_ENCRYPT'] PLZ"
  def index
    render text: THE_FRONTEND_APP, format: :html
  end

  # This endpoint gets hit by Certbot / Let's Encrypt when its time to verify
  # You control a domain name.
  def lets_encrypt
    render text: LETS_ENCRYPT_CHALENGE
  end
end