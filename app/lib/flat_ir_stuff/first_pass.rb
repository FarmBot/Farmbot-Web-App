# PROBLEM:
#   The CeleryScript flat IR representation makes "forward refrences" to parts
#   of the AST that have yet to be read.
#
# SOLUTION:
#   Break the conversion down into two "passes". The first pass will create all
#   relevant nodes that can be instantiated without forward references.
#   Remaining nodes are created in the `SecondPass` phase.
class FirstPass < Mutations::Command
  CORPUS = CeleryScriptSettingsBag::Corpus.as_json({})
  # All known celeryscript nodes:
  KINDS  = (CORPUS[:nodes] + CORPUS[:args]).pluck("name")

  required do
    model :sequence, class: Sequence
    # array :flat_ir do # CeleryScript flat IR AST
    #   hash do
    #     string  :kind, in: KINDS
    #     integer :parent
    #     integer :child
    #     hash    :primary_nodes do integer :* end
    #     hash    :edge_nodes do duck :*, methods: :to_json end
    #   end
    # end
  end

  def execute
    flat_ir.each do |item|
      # Edge nodes are primitive values.
      # We can instantiate all EdgeNodes on the first pass easily.
      edge_nodes = item[:edge_nodes].to_a.map do |(kind, value)|
        EdgeNode.new(kind: kind, value: value, sequence: sequence)
      end

      # Augment the flat IR array with a special "instance" field that will be
      # needed when we run the second pass (resolve parent/child nodes).
      # `:instance` represents a `PrimaryNode` that is missing information
      # which can only be resolved after all nodes have been processed.
      item[:instance] = PrimaryNode.new(kind:       item[:kind],
                                        sequence:   sequence,
                                        edge_nodes: edge_nodes)
    end
    flat_ir
  end

private

  def flat_ir
    @flat_ir ||= Slicer.new.run!(sequence.as_json.deep_symbolize_keys)
  end
end