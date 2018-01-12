require_relative "../app/models/transport.rb"
require File.expand_path('../boot', __FILE__)

require "rails/all"
# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(:default, Rails.env)

module FarmBot
  class Application < Rails::Application
    config.active_job.queue_adapter = :delayed_job
    config.action_dispatch.perform_deep_munge = false
    I18n.enforce_available_locales = false
    config.generators do |g|
      g.template_engine :erb
      g.test_framework :rspec, :fixture_replacement => :factory_bot, :views => false, :helper => false
      g.view_specs false
      g.helper_specs false
      g.fixture_replacement :factory_bot, :dir => 'spec/factories'
    end
    config.autoload_paths << Rails.root.join('lib')
    config.autoload_paths << Rails.root.join('lib/sequence_migrations')
    config.middleware.insert_before ActionDispatch::Static, Rack::Cors do
      allow do
        origins '*'
        resource '/api/*',
                 headers: :any,
                 methods: [:get, :post, :delete, :put, :patch, :options, :head],
                 expose: "X-Farmbot-Rpc-Id",
                 credentials: false, # No cookies.
                 max_age: 0
      end
    end
    Rails.application.routes.default_url_options[:host] = ENV["API_HOST"] || "localhost"
    Rails.application.routes.default_url_options[:port] = ENV["API_PORT"] || 3000
    # ¯\_(ツ)_/¯
    $API_URL = "//#{ Rails.application.routes.default_url_options[:host] }:#{ Rails.application.routes.default_url_options[:port] }"
    SecureHeaders::Configuration.default do |config|
      config.cookies = {
        secure: true, # mark all cookies as "Secure"
        httponly: true, # mark all cookies as "HttpOnly"
        samesite: {
          lax: true # mark all cookies as SameSite=lax
        }
      }
      # Add "; preload" and submit the site to hstspreload.org for best protection.
      config.hsts = "max-age=#{1.week.to_i}"
      config.x_frame_options = "DENY"
      config.x_content_type_options = "nosniff"
      config.x_xss_protection = "1; mode=block"
      config.x_download_options = "noopen"
      config.x_permitted_cross_domain_policies = "none"
      config.referrer_policy = %w(origin-when-cross-origin strict-origin-when-cross-origin)
      config.csp = {
        # "meta" values. these will shape the header, but the values are not included in the header.
        preserve_schemes: true, # default: false. Schemes are removed from host sources to save bytes and discourage mixed content.

        # directive values: these values will directly translate into source directives
        default_src: %w(https: 'self'),
        base_uri: %w('self'),
        block_all_mixed_content: true, # see http://www.w3.org/TR/mixed-content/
        child_src: %w('self'), # if child-src isn't supported, the value for frame-src will be set.
        connect_src: %w(wss:),
        font_src: %w('self' data:),
        form_action: %w('self' github.com),
        frame_ancestors: %w('none'),
        img_src: %w(mycdn.com data:),
        manifest_src: %w('self'),
        media_src: %w(utoob.com),
        object_src: %w('self'),
        sandbox: [], # true and [] will set a maximally restrictive setting
        plugin_types: %w(application/x-shockwave-flash),
        script_src: %w('self'),
        style_src: %w('unsafe-inline'),
        worker_src: %w('self'),
        upgrade_insecure_requests: false,#true, # see https://www.w3.org/TR/upgrade-insecure-requests/
        report_uri: %w(http://localhost:3000/csrf_reports)
      }
      # # This is available only from 3.5.0; use the `report_only: true` setting for 3.4.1 and below.
      # config.csp_report_only = config.csp.merge({
      #   img_src: %w(somewhereelse.com),
      #   report_uri: %w(https://report-uri.io/example-csp-report-only)
      # })
    end
  end
end
