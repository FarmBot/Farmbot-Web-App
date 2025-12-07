# # config/application.rb or config/environments/production.rb
# Rails.application.configure do
#   # Set default if ENV var is missing
#   config.some_setting = ENV.fetch('MM_SOME_SETTING', 'HEYHEYHEY')
# end

# Or in an initializer
# config/initializers/env_defaults.rb
Rails.application.config.after_initialize do
  # ENV['MM_SOME_SETTING'] ||= 'HEYHEYHEY'
  ENV['CLOUDAMQP_URL'] = 'amqps://yylopbzh:FKXY10wU_qRdBI1AL-hp2IJCiYnnN8s-@duck.lmq.cloudamqp.com/yylopbzh:5672'
end