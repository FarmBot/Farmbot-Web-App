WITH
  resource_type
  AS
  (
    SELECT primary_node_id, kind, "value"
    FROM edge_nodes
    WHERE (kind = 'resource_type' AND "value" IN ('"GenericPointer"', '"ToolSlot"', '"Plant"'))
  ),
  resource_id
  AS
  (
    SELECT primary_node_id, kind, "value", sequence_id
    FROM edge_nodes
    WHERE (kind = 'resource_id')
  ),
  user_sequence
  AS
  (
    SELECT name, id
    FROM sequences
  )
SELECT
  j1.sequence_id,
  j1.primary_node_id,
  j1.value::bigint as point_id,
  j3.name AS sequence_name
FROM resource_id AS j1
  INNER JOIN resource_type AS j2
  ON j1.primary_node_id = j2.primary_node_id
  INNER JOIN user_sequence as j3
  ON j3.id = j1.sequence_id;
