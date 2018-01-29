# One of the challenges with the CeleryScript "flat" representation is that
# nodes sometimes need forward references. Forward referencing nodes means that
# we can't know everything about a node until we pass over all nodes.
# Once we do pass over all nodes, we can go back and fill in the missing
# information.
class SecondPass < Mutations::Command
  CORPUS = CeleryScriptSettingsBag::Corpus.as_json({})
  KINDS  = (CORPUS[:nodes] + CORPUS[:args]).pluck("name")

  required do
    array :input do # CeleryScript flat IR AST
      hash do
        string  :kind,     in: KINDS
        model   :instance, class: PrimaryNode, new_records: true
        integer :parent
        integer :child
        hash    :primary_nodes do integer :* end
      end
    end
  end

  def execute
    input.map do |node|
      parent_index, child_index = node.slice(:parent, :child).values
      node[:instance].parent = input[parent_index][:instance] if parent_index != 0
      node[:instance].child  = input[child_index][:instance]  if child_index  != 0
      node[:primary_nodes]
        .to_a
        .map do |(parent_arg_name, arg_index)|
          i = input[arg_index][:instance]
          i.parent_arg_name = parent_arg_name
        end
      node[:instance]
    end
  end
end