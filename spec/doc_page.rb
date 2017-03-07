class DocPage
  attr_reader :url, :verb, :schema
  def initialize(url, verb, schema)
    @url    = url
    @verb   = verb
    @schema = schema
  end
end
