class RmqConfigWriter
  CONFIG_PATH     = "docker_volumes/rabbit"
  CONFIG_FILENAME = "farmbot_rmq_config.conf"
  CONFIG_OUTPUT   = "#{CONFIG_PATH}/#{CONFIG_FILENAME}"
  NO_API_HOST     = "\nYou MUST set API_HOST to a real IP address or " +
                    "domain name (not localhost).\n" +
                    "API_PORT is also mandatory."
  PROTO           = ENV["FORCE_SSL"] ? "https:" : "http:"
  ADMIN_PASSWORD  = ENV["ADMIN_PASSWORD"]
  CFG_DATA        = { admin_password:   ADMIN_PASSWORD,
                      fully_formed_url: PROTO + ($API_URL || "") }
  TEMPLATE        = <<~END
    auth_backends.1                 = cache
    auth_cache.cache_ttl            = 600000
    auth_cache.cached_backend       = http
    auth_http.http_method           = post
    auth_http.resource_path         = %{fully_formed_url}/api/rmq/resource
    auth_http.topic_path            = %{fully_formed_url}/api/rmq/topic
    auth_http.user_path             = %{fully_formed_url}/api/rmq/user
    auth_http.vhost_path            = %{fully_formed_url}/api/rmq/vhost
    default_user                    = admin
    default_user_tags.administrator = true
    default_user_tags.management    = true
    default_pass                    = %{admin_password}
    mqtt.allow_anonymous            = false
  END

  puts 'Warning: ENV["ADMIN_PASSWORD"] not set' unless ADMIN_PASSWORD

  def self.render
    raise BAD_PASSWORD if ADMIN_PASSWORD.length < 5
    raise NO_API_HOST  if !ENV["API_HOST"] || !ENV["API_PORT"]
    FileUtils.mkdir_p CONFIG_PATH
    File.open(CONFIG_OUTPUT, "w+") { |f| f.write(TEMPLATE % CFG_DATA) }
  end
end
