class DashboardController < ApplicationController
  NO_ENV                = "NO ACME_SECRET SET"
  ACME_SECRET           = ENV["ACME_SECRET"] || "NO ACME_SECRET SET"
  LONG_REVISION         = ENV["BUILT_AT"] || ENV["HEROKU_SLUG_COMMIT"] || "NONE"
  $FRONTEND_SHARED_DATA = { NODE_ENV:       Rails.env || "development",
                            TOS_URL:        ENV.fetch("TOS_URL", ""),
                            LONG_REVISION: LONG_REVISION,
                            SHORT_REVISION: LONG_REVISION.first(8) }.to_json
  def tos_update
    # I want to keep an eye on this one in prod.
    # If `tos_update` is firing without us knowing about it, it could cause a
    # service outage.
    Rollbar.info("TOS UPDATE????")
    render :tos_update, layout: false
  end

  [:main_app, :front_page, :verify, :password_reset].map do |actn|
    define_method(actn) { render actn, layout: false }
  end

  # Hit by Certbot / Let's Encrypt when it's time to verify control of domain.
  def lets_encrypt
    render plain: ACME_SECRET
  end
end
