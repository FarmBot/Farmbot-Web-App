
class NiceResponse
  attr_reader :r, :body

  def initialize(r)
    @r    = r
    @body = r.body.read
  end

  def path
    r.path
  end

  def pretty_url
    r.method + " " + r.path.first(45) + query
  end

  def has_params?
    r.params
     .except(:controller, :action, :format, :id)
     .keys
     .length > 0
  end

  def has_body?
    r.body.size > 4
  end

  def display_body
    begin
      JSON
        .pretty_generate(JSON.parse(body))
        .first(500)
    rescue
      JSON.pretty_generate(r
        .params
        .except(:controller, :action, :format, :id, :user_id, :device_id)).first(500)
    end
  end

  def query
    if r.query_string.present?
      "?" + r.query_string.first(45)
    else
      ""
    end
  end
end
