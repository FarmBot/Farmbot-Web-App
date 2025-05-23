require_relative "../app/models/transport.rb"
require File.expand_path("../boot", __FILE__)
require_relative "../app/lib/celery_script/cs_heap"
require "rails/all"
require_relative "./config_helpers/active_storage"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(:default, Rails.env)

module FarmBot
  class Application < Rails::Application
    Delayed::Worker.max_attempts = 4
    REDIS_ENV_KEY = ENV.fetch("WHERE_IS_REDIS_URL", "REDIS_URL")
    REDIS_URL = ENV.fetch(REDIS_ENV_KEY, "redis://redis:6379/0")
    config.lograge.enabled = true
    config.lograge.ignore_actions = [
      "Api::RmqUtilsController#user_action",
      "Api::RmqUtilsController#vhost_action",
      "Api::RmqUtilsController#resource_action",
      "Api::RmqUtilsController#topic_action",
    ]
    config.load_defaults 6.0
    config.active_storage.service = ConfigHelpers::ActiveStorage.service
    config.cache_store = :redis_cache_store, { url: REDIS_URL, ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE } }
    config.middleware.use Rack::Attack
    config.active_record.schema_format = :sql
    config.active_record.belongs_to_required_by_default = false
    config.active_record.yaml_column_permitted_classes = [
      ActiveSupport::HashWithIndifferentAccess,
      Symbol,
    ]
    config.active_job.queue_adapter = :delayed_job
    config.action_dispatch.perform_deep_munge = false
    I18n.enforce_available_locales = false
    LOCAL_API_HOST = ENV.fetch("API_HOST", "parcel")
    PARCELJS_URL = "http://#{LOCAL_API_HOST}:3808"
    config.generators do |g|
      g.template_engine :erb
      g.test_framework :rspec, :fixture_replacement => :factory_bot, :views => false, :helper => false
      g.view_specs false
      g.helper_specs false
      g.fixture_replacement :factory_bot, :dir => "spec/factories"
    end
    config.autoload_paths << Rails.root.join("lib")
    config.autoload_paths << Rails.root.join("lib/sequence_migrations")
    config.middleware.insert_before ActionDispatch::Static, Rack::Cors do
      allow do
        origins "*"
        resource "/api/*",
                 headers: :any,
                 methods: [:get, :post, :delete, :put, :patch, :options, :head],
                 expose: "X-Farmbot-Rpc-Id",
                 credentials: false, # No cookies.
                 max_age: 0
      end
    end
    API_PORT = ENV["API_PORT"]
    Rails.application.routes.default_url_options[:host] = LOCAL_API_HOST
    Rails.application.routes.default_url_options[:port] = API_PORT || 3000
    # ¯\_(ツ)_/¯
    $API_URL = "//#{Rails.application.routes.default_url_options[:host]}:#{Rails.application.routes.default_url_options[:port]}"
    ALL_LOCAL_URIS = ([ENV["API_HOST"]] + (ENV["EXTRA_DOMAINS"] || "").split(","))
      .map { |x| x.present? ? "#{x}:#{ENV["API_PORT"]}" : nil }.compact
    SecureHeaders::Configuration.default do |config|
      config.hsts = "max-age=#{1.week.to_i}"
      # We need this off in dev mode otherwise email previews won't show up.
      config.x_content_type_options = "nosniff"
      config.x_xss_protection = "1; mode=block"
      config.x_download_options = "noopen"
      config.x_permitted_cross_domain_policies = "none"
      config.referrer_policy =
        %w(origin-when-cross-origin strict-origin-when-cross-origin)
      connect_src = ALL_LOCAL_URIS + [
        ENV["MQTT_HOST"],
        "api.github.com",
        "raw.githubusercontent.com",
        "api.rollbar.com",
        PARCELJS_URL,
        ENV["FORCE_SSL"] ? "wss:" : "ws:",
        "localhost:#{API_PORT}",
        "localhost:3808",
        "browser-http-intake.logs.datadoghq.com",
        "#{ENV.fetch("API_HOST")}:#{API_PORT}",
        "#{ENV.fetch("API_HOST")}:3808",
        "blob:", # 3D
      ]
      config.csp = {
        default_src: %w(https: 'self'),
        base_uri: %w('self'),
        connect_src: connect_src,
        font_src: %w(
          fonts.gstatic.com
          fonts.googleapis.com
          data:
          cdnjs.cloudflare.com
          'self'
        ),
        form_action: %w('self'),
        frame_src: %w(*),       # We need "*" to support webcam users.
        frame_ancestors: %w('self' https://farm.bot https://*.shopify.com https://*.shopifypreview.com),
        img_src: %w(* data:),   # We need "*" to support webcam users.
        manifest_src: %w('self'),
        media_src: %w(),
        object_src: %w(),
        sandbox: %w(
          allow-scripts
          allow-forms
          allow-same-origin
          allow-modals
          allow-popups
          allow-downloads
          allow-top-navigation
        ),
        plugin_types: %w(),
        script_src: [
          PARCELJS_URL,
          "www.datadoghq-browser-agent.com",
          "cdn.rollbar.com",
          "localhost:3808",
          "chrome-extension:",
          "cdnjs.cloudflare.com",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "'self'",
          "blob:", # 3D
        ],
        style_src: %w(
          fonts.gstatic.com
          fonts.googleapis.com
          cdnjs.cloudflare.com
          'unsafe-inline'
          'self'
        ),
        worker_src: %w(),
        upgrade_insecure_requests: false, # WHY? Some people run webcam feeds
                                          # over plain http://. I wish they
                                          # wouldn't, but I think it's too much
                                          # of an inconvenience to block that
                                          # feature. Comments welcome -RC.
        report_uri: %w(/csp_reports),
      }
    end
  end
end
