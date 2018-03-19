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
      @fbos_version = current_user&.device&.fbos_version || "0.0.0"
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
    user   = params[:token] && User.find_by!(confirmation_token: params[:token])
    # Two use cases:                  re-confirmation   Email change
    klass  = user.unconfirmed_email? ? Users::Reverify : Users::Verify
    @token = klass.run!(user: user).to_json
    render :confirmation_page, layout: false
  rescue User::AlreadyVerified
    @already_registered = true
    render :confirmation_page, layout: false, status: 409
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
