class DashboardController < ApplicationController
  before_action :set_global_config
  skip_before_action :verify_authenticity_token, only: [:csp_reports]
  layout "dashboard"

  # === THESE CONSTANTS ARE CONFIGURABLE: ===
  EVERY_STATIC_PAGE = [
                        :demo,
                        :front_page,
                        :main_app,
                        :os_download,
                        :featured,
                        :password_reset,
                        :terminal,
                        :tos_update,
                        :try_farmbot,
                        :promo,
                      ]

  OUTPUT_URL = "/" + File.join("assets", "parcel") # <= served from public/ dir
                                                   # <= See PUBLIC_OUTPUT_DIR
  CACHE_DIR = File.join(".cache")

  CSS_INPUTS = {
    default: "/css/_index.scss",
    terminal: "/css/xterm.css",
  }.with_indifferent_access

  JS_INPUTS = {
    main_app: "/entry.tsx",
    front_page: "/front_page/index.tsx",
    password_reset: "/password_reset/index.tsx",
    tos_update: "/tos_update/index.tsx",
    demo: "/demo/index.tsx",
    try_farmbot: "/try_farmbot/index.tsx",
    promo: "/promo/index.tsx",
    os_download: "/os_download/index.tsx",
    terminal: "/terminal/index.tsx",
  }.with_indifferent_access

  # === THESE CONSTANTS ARE NON-CONFIGURABLE. ===
  # They are calculated based on config above.

  RELEASE_CHUNK = GlobalConfig::LONG_REVISION == "NONE" ?
    SecureRandom.hex.first(5) : GlobalConfig::LONG_REVISION
  CACHE_BUST_STRING = "?version=#{RELEASE_CHUNK}"
  PUBLIC_OUTPUT_DIR = File.join("public", OUTPUT_URL)

  CSS_OUTPUTS = CSS_INPUTS.reduce({}) do |acc, (k, v)|
    file = v.gsub(/\.scss$/, ".css")
    acc[k] = File.join(OUTPUT_URL, file)
    acc
  end.with_indifferent_access

  JS_OUTPUTS = JS_INPUTS.reduce({}) do |acc, (k, v)|
    file = v.gsub(/\.tsx?$/, ".js")
    acc[k] = File.join(OUTPUT_URL, file)
    acc
  end.with_indifferent_access

  PARCEL_ASSET_LIST = (CSS_INPUTS.values + JS_INPUTS.values)
                                                    .sort
                                                    .uniq
                                                    .map { |x| File.join("frontend", x) }
                                                    .join(" ")

  PARCEL_HMR_OPTS = [
    "--no-hmr",
    "--no-cache",
  ].join(" ")

  EVERY_STATIC_PAGE.map do |actn|
    define_method(actn) do
      begin
        # If you don't do this, you will hit hard to debug
        # CSP errors on local when changing API_HOST.
        response.headers["Cache-Control"] = "no-cache, no-store"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        load_css_assets
        load_js_assets
        render actn
      rescue ActionView::MissingTemplate => q
        raise ActionController::RoutingError, "Bad URL in dashboard. -Rick"
      end
    end
  end

  def confirmation_page
    load_css_assets
    user = User.find_by!(confirmation_token: params.fetch(:token))
    # Two use cases:                  re-confirmation   Email change
    klass = user.unconfirmed_email? ? Users::Reverify : Users::Verify
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
    rescue JSON::ParserError => e
      report = {
        error: "CSP report parse error",
        exception: e.message,
        raw: payload,
      }
    end

    Rollbar.info("CSP Violation Report", report)
    head :no_content
  end

  # (for self hosted users) Direct image upload endpoint.
  # Do not use this if you use GCS- it will slow your app down.
  def direct_upload
    Image.self_hosted_image_upload(key: params.fetch(:key),
                                   file: params.fetch(:file))
    render json: ""
  end

  def logout
  end

  private

  def load_css_assets
    @css_assets ||= [action_name, :default].reduce([]) do |list, action|
      asset = CSS_OUTPUTS[action] # Not every endpoint has custom CSS.
      list.push(asset + CACHE_BUST_STRING) if asset
      list
    end
  end

  def load_js_assets
    # Every DashboardController has a JS SBundle.
    @js_assets ||=
      [JS_OUTPUTS.fetch(action_name)].map { |x| x + CACHE_BUST_STRING }
  end

  def set_global_config
    @global_config = GlobalConfig
      .dump
      .merge(Release.latest_image(platform: "rpi"))
      .merge(Release.latest_image(platform: "rpi3"))
      .merge(Release.latest_image(platform: "rpi4"))
      .to_json
  end
end
