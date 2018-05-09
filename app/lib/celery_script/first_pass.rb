require_relative "./csheap"

# ABOUT THIS CLASS:
#   CSHeap creates an in memory representation of a Flat IR tree using array
#   indexes (HeapAddress instances, really). This class takes a flat IR tree
#   from memory and converts `HeapAddress`es to SQL primary/foreign keys.
module CeleryScript
  class FirstPass < Mutations::Command
    using Sequences::CanonicalCeleryHelpers
    # The following constants are abbreviations of the full name, since the
    # full name is quite long and they are referenced frequently in the code.
    # Just remember that "B" is "BODY", "K" is "KIND", etc...
    B    = CeleryScript::CSHeap::BODY
    C    = CeleryScript::CSHeap::COMMENT
    K    = CeleryScript::CSHeap::KIND
    L    = CeleryScript::CSHeap::LINK
    N    = CeleryScript::CSHeap::NEXT
    P    = CeleryScript::CSHeap::PARENT
    NULL = CeleryScript::CSHeap::NULL
    I    = :instance

    required do
      model :sequence, class: Sequence
      body
      args
    end

    def validate
      #       IF YOU REMOVE THIS BAD STUFF WILL HAPPEN:
      #       version is never user definable!
      sequence_hash[:args] = \
        Sequence::DEFAULT_ARGS.merge(sequence_hash[:args] || {})
      # See comment above ^ TODO: Investigate removal now that EdgeNodes exist.
    end

    def execute
      Sequence.transaction do
        flat_ir
          .each do |node|
            # Step 1- instantiate records.
            node[I] = PrimaryNode.create!(kind:     node[K],
                                          sequence: sequence,
                                          comment:  node[C] || nil)
          end
          .each_with_index do |node, index|
            # Step 2- Assign SQL ids (not to be confused with array index IDs or
            # instances of HeapAddress), also sets parent_arg_name
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
                (x.first != I) && !key.starts_with?(L)
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

    # Index every primary node in memory by its `HeapAddress`.
    # We need this info in order to fill out the `parent_arg_name` of a node.
    def every_primary_link
      @every_primary_link ||= flat_ir
        .map do |x|
          x
            .except(B,C,I,K,L,N,P)
            .invert
            .to_a
            .select{|(k,v)| k.is_a?(HeapAddress)}
        end
        .map(&:to_h)
        .reduce({}, :merge)
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

    def sequence_hash
      @sequence_hash ||= \
        HashWithIndifferentAccess.new(kind: "sequence", args: args, body: body)
    end

    def flat_ir
      @flat_ir ||= Slicer.new.run!(sequence_hash)
    end
  end
end
