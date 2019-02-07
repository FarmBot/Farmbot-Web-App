class DashboardController < ApplicationController
  before_action :set_global_config
  layout "dashboard"

  # === THESE CONSTANTS ARE CONFIGURABLE: ===
  EVERY_STATIC_PAGE = [ :front_page,
                        :main_app,
                        :password_reset,
                        :tos_update, ]

  OUTPUT_URL = "/" + File.join("assets", "parcel") # <= served from public/ dir
                                                   # <= See PUBLIC_OUTPUT_DIR
  CACHE_DIR  = File.join(".cache")

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

  # === THESE CONSTANTS ARE NON-CONFIGURABLE. ===
  # They are calculated based on config above.
  PUBLIC_OUTPUT_DIR = File.join("public", OUTPUT_URL)

  CSS_OUTPUTS = CSS_INPUTS.reduce({}) do |acc, (k, v)|
    file     = v.gsub(/\.scss$/, ".css")
    acc[k] = File.join(OUTPUT_URL, file)
    acc
  end.with_indifferent_access

  JS_OUTPUTS = JS_INPUTS.reduce({}) do |acc, (k, v)|
    file   = v.gsub(/\.tsx?$/, ".js")
    acc[k] = File.join(OUTPUT_URL, file)
    acc
  end.with_indifferent_access

  PARCEL_ASSET_LIST = (CSS_INPUTS.values + JS_INPUTS.values)
    .sort
    .uniq
    .map { |x| File.join("frontend", x) }
    .join(" ")

  PARCEL_HMR_OPTS   = [
    "--hmr-hostname #{ENV.fetch("API_HOST")}",
    "--hmr-port 3808"
  ].join(" ")

  PARCEL_CLI_OUTRO  = [
    # WHY ARE SOURCE MAPS DISABLED?
    # https://github.com/parcel-bundler/parcel/issues/2599#issuecomment-459131481
    # https://github.com/parcel-bundler/parcel/issues/2607
    # TODO: Upgrade parcel when issue ^ is fixed.
    "--no-source-maps",
  ].join(" ")

  EVERY_STATIC_PAGE.map do |actn|
    define_method(actn) do
      begin
        # If you don't do this, you will hit hard to debug
        # CSP errors on local when changing API_HOST.
        response.headers["Cache-Control"] = "no-cache, no-store"
        load_css_assets
        load_js_assets
        render actn
      rescue ActionView::MissingTemplate => q
        raise ActionController::RoutingError, "Bad URL in dashboard"
      end
    end
  end

  def confirmation_page
    user   = User.find_by!(confirmation_token: params.fetch(:token))
    # Two use cases:                  re-confirmation   Email change
    klass  = user.unconfirmed_email? ? Users::Reverify : Users::Verify
    @token = klass.run!(user: user).to_json
    render :confirmation_page
  rescue User::AlreadyVerified
    @already_registered = true
    render :confirmation_page, status: 409
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
