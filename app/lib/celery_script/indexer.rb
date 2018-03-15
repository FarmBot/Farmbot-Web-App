  # Re-combingind EdgeNodes and PrimaryNodes is very query intensive.
  # To avoid excess DB calls, we will index the nodes in memory by field type.
  module CeleryScript
    # EXAMPLE USAGE:
    #  nodes      = Index.new(MY_LIST_OF_NODES)
    #  my_results = nodes.by.primary_node_id(5)
    class Indexer
    # Fields that need indexing in both cases (Edge vs. Primary node)
    COMMON_FIELDS  = [:kind, :id]
    # Fields that will be indexed if an EdgeNode collection is passed in.
    EDGE_FIELDS    = COMMON_FIELDS + [:primary_node_id]
    # Fields that will be indexed if an PrimaryNode collection is passed in.
    PRIMARY_FIELDS = COMMON_FIELDS + [:parent_id]
    # We pick the correct struct based on the class of the collection passed to
    # the constructor.
    KLASS_LOOKUP = { PrimaryNode => Struct.new(*PRIMARY_FIELDS),
                     EdgeNode    => Struct.new(*EDGE_FIELDS) }

    # Example: index_object.by.primary_node_id[6]
    attr_reader :by

    # Pass in a collection of EdgeNode or PrimaryNode objects.
    def initialize(collection)
      struct_class = KLASS_LOOKUP[collection.klass]
      struct       = struct_class.new()
      struct
        .members
        .each do |key|
          setter = "#{key}="
          values = collection.group_by { |record| record.send(key) } || []
          struct.send(setter, values)
        end
      @by = struct
    end
  end
end