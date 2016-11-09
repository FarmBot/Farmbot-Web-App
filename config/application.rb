require File.expand_path('../boot', __FILE__)

# Pick the frameworks you want:
# require "active_record/railtie"
# require "action_controller/railtie"
# require "action_mailer/railtie"
# require "sprockets/railtie"
# require "rails/test_unit/railtie"
require "rails/all"
# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(:default, Rails.env)

module FarmBot
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified
    # here. Application configuration should go into files in
    # config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de
    config.action_dispatch.perform_deep_munge = false
    I18n.enforce_available_locales = false
    config.generators do |g|
      g.template_engine :haml
      g.test_framework :rspec, :fixture_replacement => :factory_girl, :views => false, :helper => false
      g.view_specs false
      g.helper_specs false
      g.fixture_replacement :factory_girl, :dir => 'spec/factories'
    end
    config.autoload_paths << Rails.root.join('lib')
    config.middleware.insert_before 'ActionDispatch::Static', 'Rack::Cors' do
      allow do
        origins '*'
        resource '/api/*',
                 headers: :any,
                 methods: [:get, :post, :delete, :put, :patch, :options, :head],
                 credentials: false, # No cookies.
                 max_age: 0
      end
    end
    Rails.application.routes.default_url_options[:host] = ENV["API_HOST"] || "localhost" 
    Rails.application.routes.default_url_options[:port] = ENV["API_PORT"] || 3000
    # ¯\_(ツ)_/¯
    $API_URL = "//#{ Rails.application.routes.default_url_options[:host] }:#{ Rails.application.routes.default_url_options[:port] }"
  end
end
