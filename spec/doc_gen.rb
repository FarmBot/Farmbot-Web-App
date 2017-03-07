require_relative "./doc_page"

class DocGen
  @all       = {}
  BLACK_LIST = ["/api/sequences/:id (PATCH)",
                "/api/sequences (POST)"]

  def self.add(request)
    api_url = request.path.gsub(/\d+/, ":id")
    if api_url.length < 30
      key = "#{api_url} (#{request.method})"
      @all[key] ||= []
      p = from_json(request) || from_params(request)
      @all[key].push(p) if p.is_a?(Array) || p.keys.length > 0
    end
  end

  def self.finish!
    @all.select!{|k, v| v.length > 0}
    # TOO LONG TO DOCUMENT - IGNORE INSTEAD.
    BLACK_LIST.map {|k| @all.delete(k) }
    @all
      .map do |key, y|
        url, verb = key.split(" ")
        DocPage.new(url, verb, JSON.parse(JSON::SchemaGenerator
                                   .generate(key, y.to_json))["items"])
      end
  end

  def self.from_json(request)
    x = request.body.dup.read
    JSON.parse(x) rescue false if (x.length > 2) && (x.length < 1000)
  end

  def self.from_params(request)
    request
      .params
      .as_json
      .except("controller", "action", "format", "id")
  end
end
