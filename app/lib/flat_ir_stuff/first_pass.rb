class FirstPass < Mutations::Command
  CORPUS = CeleryScriptSettingsBag::Corpus.as_json({})
  KINDS  = (CORPUS[:nodes] + CORPUS[:args]).pluck("name")

  required do
    model :sequence, class: Sequence
    array :input do # CeleryScript flat IR AST
      hash do
        string  :kind, in: KINDS
        integer :parent
        integer :child
        hash    :primary_nodes do integer :* end
        hash    :edge_nodes    do duck :*, methods: :to_json end
      end
    end
  end

  def execute
    input.each do |item|
      edge_nodes = item[:edge_nodes].to_a.map do |(kind, value)|
        EdgeNode.new(kind: kind, value: value, sequence: sequence)
      end
      item[:instance] = PrimaryNode
        .new(kind: item[:kind], sequence: sequence, edge_nodes: edge_nodes)
    end
    input
  end
end