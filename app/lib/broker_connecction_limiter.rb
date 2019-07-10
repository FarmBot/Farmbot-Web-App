class BrokerConnectionLimiter
  class RateLimit < StandardError; end

  attr_reader :cache

  CACHE_KEY_TPL = "mqtt_limiter:%s"
  TTL = 60 * 10 # Ten Minutes
  LIMIT = 10

  def self.current(cache = Rails.cache.redis)
    self.new(cache)
  end

  def initialize(cache)
    @cache = cache
  end

  def maybe_continue(username)
    if allow?(username)
      yield
    else
      raise RateLimit, username
    end
  end

  def count_for(username)
    client.get(key(username)) || 0
  end

  def increment(username)
    client.pipelined do
      k = key(username)
      client.incr(k)
      client.expire(k, TTL)
    end
  end

  def allow?(username)
    count_for(username) < LIMIT
  end

  def key(username)
    CACHE_KEY_TPL % username
  end
end
