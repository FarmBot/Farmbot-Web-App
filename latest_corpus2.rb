HASH = Sequence::Corpus.as_json({})

def name_of(thing)
  thing.fetch("name").to_s
end

VALUES          = HASH.fetch(:values)
VALUE_PREFIX    = "CS"
VALUES_TPL      = "export type %{name} = %{type};\n"
VALUES_OVERRIDE = { float: "number", integer: "number" }
FUNNY_NAMES     = { "Example" => "CSExample" }

def emit_values
  output = VALUES.map do |val|
    real_name              = name_of(val)
    capitalized            = real_name.capitalize
    celerized              = VALUE_PREFIX + capitalized
    FUNNY_NAMES[capitalized] = celerized
    type = VALUES_OVERRIDE.fetch(real_name, real_name)
    # binding.pry
    VALUES_TPL % { name: celerized, type: type }
  end
    .uniq
    .sort
  puts(output)
end
ENUMS = HASH.fetch(:enums)
ENUM_TPL = "export type ALLOWED_%{name} = %{type};\n"

def emit_enums
  output = ENUMS.map do |enum|
    name      = name_of(enum).upcase
    celerized = "ALLOWED_%{name}" % {name: name}
    FUNNY_NAMES[name_of(enum).camelize] = celerized
    type = enum.fetch("allowed_values").sort.map(&:inspect).uniq.join(" | ")
    ENUM_TPL % { name: name, type: type }
  end
    .uniq
    .sort

  puts output
end

ARGS = HASH
  .fetch(:args)
  .reduce(HashWithIndifferentAccess.new) do |acc, arg|
    acc[name_of(arg)] = arg
    acc
  end

NODES = HASH.fetch(:nodes)

NODE_START    = [ "export type %{camel_case}BodyItem = %{body_types};",
                  "/** %{docs} %{tag_docs} */",
                  "export interface %{camel_case} {",
                  '  kind: "%{snake_case}";',
                  "  args: {", ].join("\n")
MIDDLE_CENTER =   "    %{arg_name}: %{arg_values};"
BOTTOM_END    = [ "  }",
                  "  body?: %{camel_case}BodyItem[] | undefined;",
                  "}\n", ].join("\n")

def emit_nodes()
  nodes = NODES.map do |node|
      tag_list    = node.fetch("tags").sort.uniq.join(", ")
      name        = name_of(node).to_s
      bodies      = node
        .fetch("allowed_body_types")
        .sort
        .uniq
        .map(&:to_s)
        .map(&:camelize)
      bt = bodies.any? ? "(#{bodies.join(" | ")})" : "never"
      tpl_binding = {
        body_types: bt,
        camel_case: name.camelize,
        docs:       node.fetch("docs"),
        snake_case: name,
        tag_docs:   "Tag properties: #{tag_list}."
      }

      one   = NODE_START % tpl_binding
      two   = node.fetch("allowed_args").sort.map do |arg|
                MIDDLE_CENTER % {
                  arg_name: arg.to_s,
                  arg_values: ARGS.fetch(arg)
                                .fetch("allowed_values")
                                .map(&:name)
                                .map(&:camelize)
                                .map { |x| FUNNY_NAMES[x] || x }
                                .join(" | ")
                }
              end
      three = BOTTOM_END % tpl_binding
      [one, two, three].flatten.join("\n")
    end
    .compact
    .uniq
    .join("\n")
  puts nodes
end

emit_values()
emit_enums()
emit_nodes()
