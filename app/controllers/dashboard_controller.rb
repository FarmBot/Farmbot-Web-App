class DashboardController < ApplicationController
  before_action :set_global_config

  OUTPUT_URL_PATH = "/dist"

  CSS_INPUTS  = {
    front_page: "/css/laptop_splash.scss",
    default:    "/css/_index.scss",
  }.with_indifferent_access

  JS_INPUTS   = {
    main_app:       "/entry.tsx",
    front_page:     "/front_page/index.tsx",
    password_reset: "/password_reset/index.tsx",
    tos_update:     "/tos_update/index.tsx",
  }.with_indifferent_access

  CSS_OUTPUTS = CSS_INPUTS.reduce({}) do |acc, (key, value)|
    acc[key] = OUTPUT_URL_PATH + value.gsub(/\.scss$/, ".css")
    acc
  end

  JS_OUTPUTS = JS_INPUTS.reduce({}) do |acc, (key, value)|
    acc[key] = OUTPUT_URL_PATH + value.gsub(/\.tsx?$/, ".js")
    acc
  end

  [:main_app, :front_page, :verify, :password_reset, :tos_update].map do |actn|
    define_method(actn) do
      begin
        load_css_assets
        load_js_assets
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
    Rollbar.info("CSP Violation", report)

    render json: report
  end

  # (for self hosted users) Direct image upload endpoint.
  # Do not use this if you use GCS- it will slow your app down.
  def direct_upload
    raise "No." unless Api::ImagesController.store_locally
    name        = params.fetch(:key).split("/").last
    path        = File.join("public", "direct_upload", "temp", name)
    File.open(path, "wb") { |f| f.write(params[:file]) }
    render json: ""
  end

private
  def load_css_assets
    @css_assets ||= [action_name, :default].reduce([]) do |list, action|
      asset = CSS_OUTPUTS[action] # Not every endpoint has custom CSS.
      list.push(asset) if asset
      list
    end
  end

  def load_js_assets
    # Every DashboardController has a JS SBundle.
    @js_assets ||= [ JS_OUTPUTS.fetch(action_name) ]
  end

  def set_global_config
    @global_config = GlobalConfig.dump.to_json
  end
end
