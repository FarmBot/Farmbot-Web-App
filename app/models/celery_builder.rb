class CeleryBuilder
  def self.build
    yield(self.new)
  end

  def method_missing(kind, args, &body)
    raise "BRB"
  end

  def dump
    raise  "brb"
  end
end

