class DashboardController < ApplicationController
  LONG_REVISION         = ENV["BUILT_AT"] || ENV["HEROKU_SLUG_COMMIT"] || "NONE"
  $FRONTEND_SHARED_DATA = { NODE_ENV:       Rails.env || "development",
                            TOS_URL:        ENV.fetch("TOS_URL", ""),
                            PRIV_URL:       ENV.fetch("PRIV_URL", ""),
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
    define_method(actn) do
      @rev = LONG_REVISION
      begin
        response.headers["Cache-Control"] = "no-cache, no-store"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        render actn, layout: false
      rescue ActionView::MissingTemplate => q
        raise ActionController::RoutingError, "Bad URL in dashboard"
      end
    end
  end

  def verify
    # user = User.find_by!(confirmation_token: params.fetch(:token)) or raise "X"
    user = User.first
    user.update_attributes!(confirmation_token: SecureRandom.uuid,
                            confirmed_at:       Time.now)
    @token = SessionToken.as_json(user,
                                  AbstractJwtToken::HUMAN_AUD,
                                  Gem::Version.new("99.99.99")).to_json
    render :confirmation_page, layout: false
  end

  # Endpoint reports CSP violations, indicating a possible security problem.
  def csp_reports
    payload = request.body.read || ""
    begin
      report = JSON.parse(payload)
    rescue
      report = {problem: "Crashed while parsing report"}
    end
    Rollbar.error("CSP VIOLATION!!!", report)

    render json: report
  end
end
