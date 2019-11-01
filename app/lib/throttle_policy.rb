# Handles devices that spin out of control and send too many logs to the server.
class ThrottlePolicy
  TTL = { min: 60,
         hour: 60 * 60,
         day: 60 * 60 * 24 }
  ROUNDING_HELPERS = { min: :beginning_of_minute,
                       hour: :beginning_of_hour,
                       day: :beginning_of_day }

  TIME_UNITS = TTL.keys
  VIOLATION_TPL = "more than %{limit} / %{period}"
  Violation = Struct.new(:ends_at, :explanation)
  attr_reader :rule_map, :namespace

  def initialize(namespace, rule_map)
    @namespace = namespace
    @rule_map = rule_map
    each_rule { |unit| validate_unit!(unit) }
  end

  def track(id)
    each_rule { |unit| incr(id, unit) }
  end

  def violation_for(id)
    v = all_violations(id)
    if v.empty?
      return nil
    else
      period, limit = v.max_by { |(unit)| TTL.fetch(unit) }
      message = VIOLATION_TPL % { period: period, limit: limit }
      return Violation.new(next_window(period), message)
    end
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
    [period, next_window(period).to_i].map(&:to_s).join()
  end

  def cache_key(id, period)
    [namespace, the_time_part(period), id].join(":")
  end

  def get(id, period)
    (redis.get(cache_key(id, period)) || "0").to_i
  end

  def next_window(period, now = Time.now)
    helper = ROUNDING_HELPERS.fetch(period)
    offset = TTL.fetch(period).seconds
    (now + offset).send(helper)
  end

  def incr(id, period)
    key = cache_key(id, period)
    redis.incr(key)

    if (redis.ttl(key) < 0)
      ttl = (next_window(period) - Time.now).seconds.to_i
      redis.expire(key, ttl)
    end
  end

  def all_violations(id)
    each_rule { |k, v| (get(id, k) > v) ? [k, v] : nil }.compact
  end
end
