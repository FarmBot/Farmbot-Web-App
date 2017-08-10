class DashboardController < ApplicationController
  FE_PATH          = "public/app/index.html"
  FE_FALLBACK      = "app/views/fe_fallback.html"
  HAS_FE           = File.file? FE_PATH
  THE_FRONTEND_APP = File.read(HAS_FE ? FE_PATH : FE_FALLBACK).html_safe
  ACME_SECRET      = ENV["ACME_SECRET"]

  def main_app
    # render html: THE_FRONTEND_APP, layout: false
    render :main_app, layout: false
  end

  def front_page
    render :front_page, layout: false
  end

  def password_reset
    render :password_reset, layout: false
  end

  # Hit by Certbot / Let's Encrypt when it's time to verify control of domain.
  def lets_encrypt
    render plain: ACME_SECRET
  end
end
