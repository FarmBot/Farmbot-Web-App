# Handles devices that spin out of control and send too many logs to the server.
class ThrottlePolicy
  TTL = { min: 60,
         hour: 60 * 60,
         day: 60 * 60 * 24 }
  TIME_UNITS = TTL.keys
  attr_reader :rule_map, :namespace

  def initialize(namespace, rule_map)
    @namespace = namespace
    @rule_map = rule_map
    each_rule { |unit| validate_unit!(unit) }
  end

  def track(id)
    each_rule { |unit| incr(id, unit) }
  end

  def is_throttled(id)
    violations(id).count > 0
  end

  private

  def validate_unit!(unit)
    raise "BAD TIME UNIT" unless TIME_UNITS.include?(unit)
  end

  def each_rule
    rule_map.map { |(k, v)| yield(k, v) }
  end

  def redis
    Rails.cache.redis
  end

  def the_time_part(period, now = Time.now)
    [period, now.send(period)].map(&:to_s).join()
  end

  def cache_key(id, period)
    [namespace, the_time_part(period), id].join(":")
  end

  def get(id, period)
    (redis.get(cache_key(id, period)) || "0").to_i
  end

  def incr(id, period)
    key = cache_key(id, period)
    result = redis.incr(key)
    needs_ttl = redis.ttl(key) < 1
    redis.expire(key, TTL.fetch(period)) if needs_ttl
    result
  end

  def violations(id)
    each_rule { |k, v| (get(id, k) > v) ? k : nil }.compact
  end
end
