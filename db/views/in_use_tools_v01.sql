WITH
  resource_type_node
  AS
  (
    SELECT primary_node_id, kind, value
    FROM edge_nodes
    WHERE (kind = 'resource_type')
  ),
  resource_id_node
  AS
  (
    SELECT primary_node_id, kind, value, sequence_id
    FROM edge_nodes
    WHERE (kind = 'resource_id')
  )
SELECT
  resource_id_node.sequence_id,
  resource_id_node.primary_node_id,
  resource_id_node.value::bigint as point_id,
  resource_type_node.value AS point_type
FROM
  resource_id_node
  INNER JOIN
  resource_type_node
  ON
  resource_id_node.primary_node_id = resource_type_node.primary_node_id;
