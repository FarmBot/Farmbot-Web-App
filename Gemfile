source "https://rubygems.org"
ruby "2.4.1"

gem "rails",  "~> 5.1"
gem "thin"
gem "rails_12factor"
# START RAILS 5.1 "SPECIAL" VERSIONS ===================================.,_
# TODO: Get off of this version once Devise folks ship a 5.1 release.
#       - RC 12 May 17
gem "devise", git: "https://github.com/plataformatec/devise"
gem 'delayed_job', github: 'gogovan/delayed_job', branch: 'rails-5.1'
gem 'delayed_job_active_record',
    github: 'gogovan/delayed_job_active_record',
    branch: 'rails-5.1'
# END TEMPORARY RAILS 5.1 GEMS =========================================-"`
gem "jwt"
gem "mutations"
gem "active_model_serializers"
gem "rack-cors"
gem "rack-attack"
gem "paperclip"
gem "figaro"
gem "fog-google", git: "https://github.com/fog/fog-google"
gem "pg"
gem "montrose"
gem "polymorphic_constraints"

# Error reporting tools.
# Active on the "official" FarmBot server, set the appropriate ENV
# vars if you wish to use them on your own servers.
gem "rollbar"
gem "skylight"

group :development, :test do
  gem "database_cleaner"
  gem "pry"
  gem "factory_girl_rails"
  gem "faker"
  gem "smarf_doc", git: "https://github.com/RickCarlino/smarf_doc.git"
  gem "rails-erd"
  # TODO: Upgrade versions when they fix this stuff:
  # https://stackoverflow.com/questions/43983466
  #   /controller-test-emits-debug-failure-messages-after-rails-5-1-upgrade
  gem "rspec", "~> 3.5.0"
  gem "rspec-rails", "~> 3.5.0"
  gem "simplecov"
  gem "letter_opener"
end
