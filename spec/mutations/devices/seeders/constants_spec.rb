require "spec_helper"

describe Devices::Seeders::Constants::SequenceSeeds do
  describe ".normalize_lua_indentation" do
    it "recursively removes common Lua indentation" do
      tree = {
        body: [
          {
            kind: "lua",
            args: {
              lua: "  first\n    second\n\n  third\n",
            },
          },
          {
            kind: "move",
            args: {
              lua: "  unchanged\n",
            },
          },
        ],
        nested: {
          kind: "lua",
          args: {
            lua: "left_aligned\n  interior_indent\n",
          },
        },
        tabbed: {
          kind: "lua",
          args: {
            lua: "\tfirst\n\t\tsecond\n",
          },
        },
      }

      result = described_class.normalize_lua_indentation(tree)

      expect(result.dig(:body, 0, :args, :lua))
        .to eq("first\n  second\n\nthird\n")
      expect(result.dig(:body, 1, :args, :lua)).to eq("  unchanged\n")
      expect(result.dig(:nested, :args, :lua))
        .to eq("left_aligned\n  interior_indent\n")
      expect(result.dig(:tabbed, :args, :lua)).to eq("first\n\tsecond\n")
    end
  end

  it "loads every nonempty fixture Lua script at the left margin" do
    lua_scripts = []
    collect_lua = lambda do |node|
      case node
      when Array
        node.each { |child| collect_lua.call(child) }
      when Hash
        lua = node.dig(:args, :lua)
        lua_scripts << lua if node[:kind].to_s == "lua" && lua.is_a?(String)
        node.each_value { |child| collect_lua.call(child) }
      end
    end

    collect_lua.call(described_class::ALL)

    expect(lua_scripts).to_not be_empty
    lua_scripts.each do |lua|
      nonblank_lines = lua.lines.reject { |line| line.strip.empty? }
      next if nonblank_lines.empty?

      expect(nonblank_lines.any? { |line| line.match?(/\A\S/) }).to be(true)
    end
  end
end
