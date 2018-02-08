require_relative "./csheap"

# PROBLEM:
#   The CeleryScript flat IR representation (from CeleryScript::Slicer) makes
#   "forward refrences" to parts of the AST that have yet to be read.
#
# SOLUTION:
#   Once we have a flat IR list, start filling out information
#   on Primary/Edge nodes, such as `parent_id`, `next_id` and `parent_arg_name`.
module CeleryScript
  class FirstPass < Mutations::Command
    B    = CeleryScript::CSHeap::BODY
    K    = CeleryScript::CSHeap::KIND
    L    = CeleryScript::CSHeap::LINK
    N    = CeleryScript::CSHeap::NEXT
    P    = CeleryScript::CSHeap::PARENT
    NULL = CeleryScript::CSHeap::NULL
    I    = :instance

    required do
      model :sequence, class: Sequence
    end

    def execute
      Sequence.transaction do
        flat_ir
          .each do |node|
            # Step 1- instantiate records.
            node[I] = PrimaryNode.create!(kind: node[K], sequence: sequence)
          end
          .each_with_index do |node, index|
            # Step 2- Assign SQL ids (not to be confused with array index IDs or
            #         instances of HeapAddress), also sets arent_arg_name
            model                 = node[I]
            model.parent_arg_name = parent_arg_name_for(node, index)
            model.body_id         = fetch_sql_id_for(B, node)
            model.parent_id       = fetch_sql_id_for(P, node)
            model.next_id         = fetch_sql_id_for(N, node)
            node
          end
          .map do |node|
            # Step 3- Set edge nodes
            pairs = node
              .to_a
              .select do |x|
                key = x.first.to_s
                !key.starts_with?(L) && (x.first != I)
              end
              .map do |(key, value)|
                EdgeNode.create!(kind:            key,
                                 value:           value,
                                 sequence_id:     sequence.id,
                                 primary_node_id: node[:instance].id)
              end
              node[:instance]
          end
          .tap { |x| sequence.update_attributes(migrated_nodes: true) unless sequence.migrated_nodes }
          .map { |x|
            x.save! if x.changed?
            x
          }
      end
    end

private

    def every_primary_link
      @every_primary_link ||= flat_ir
        .map do |x|
          x.except(B,K,L,N,P,I).invert.to_a.select{|(k,v)| k.is_a?(HeapAddress)}
        end
        .map(&:to_h)
        .reduce(Hash.new, :merge)
    end

    def parent_arg_name_for(node, index)
      resides_in_args  = (node[N] == NULL) && (node[P] != NULL)
      link_symbol      = every_primary_link[HeapAddress[index]]
      needs_p_arg_name = (resides_in_args && link_symbol)
      parent_arg_name  = (needs_p_arg_name ? link_symbol.to_s.gsub(L, "") : nil)
      return parent_arg_name
    end

    def fetch_sql_id_for(node_key, node)
      index = node[node_key].to_i
      flat_ir[index][I].id
    end

    def flat_ir
      @flat_ir ||= Slicer.new.run!(sequence.as_json.deep_symbolize_keys)
    end
  end
end
