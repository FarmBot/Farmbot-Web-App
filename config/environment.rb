# Load the Rails application.
require File.expand_path('../application', __FILE__)
# Initialize the Rails application.
FarmBot::Application.initialize!
Rails.application.routes.default_url_options[:host] = ENV["API_HOST"] || "localhost" 
Rails.application.routes.default_url_options[:port] = ENV["API_PORT"] || 3000 