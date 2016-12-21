require "json"
require "pry"
require "rails"
PIPE = "\n           | "

class CSArg
    TRANSLATIONS = { "integer" => "number",
                     "string"  => "string" }
    attr_reader :name, :allowed_values

    def initialize(name:, allowed_values:)
        @name, @allowed_values = name, allowed_values
    end

    def camelize
      name.camelize
    end

    def values
      allowed_values.map { |v| TRANSLATIONS[v] || v.camelize }.join(PIPE)
    end

    def to_ts
      "\n    #{name}: #{values};"
    end
end

class CSNode
    attr_reader :name, :allowed_args, :allowed_body_types

    def initialize(name:, allowed_args:, allowed_body_types: [])
        @name,
        @allowed_args,
        @allowed_body_types = name, allowed_args, allowed_body_types
    end

    def camelize
        name.camelize
    end

    def arg_names
      allowed_args.map{|x| ARGS[x]}.map(&:to_ts).join("")
    end

    def body_names
        b = allowed_body_types.map(&:camelize).join(PIPE)
        b.length > 0 ? b : "undefined"
    end

    def args

    end

    def to_ts
"""
export interface #{camelize} {
  kind: #{name.inspect};
  args: {#{arg_names}
  };
  comment?: string | undefined;
  body?: (#{body_names})[] | undefined;
}
"""
    end
end

HASH  = JSON.parse(File.read("./latest_corpus.json")).deep_symbolize_keys
ARGS  = {}
HASH[:args].map{ |x| CSArg.new(x) }.each{|x| ARGS[x.name] = x}
NODES = HASH[:nodes].map { |x| CSNode.new(x) }
ALL = NODES.map(&:name).map(&:camelize).join(PIPE);
result = NODES.map(&:to_ts)
result.push "\n export type CeleryNode = #{ALL};"
puts result.join("")