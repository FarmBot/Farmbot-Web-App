SELECT
  points.x                as x,
  points.y                as y,
  points.z                as z,
  (edge_nodes.value)::int as point_id,
  points.pointer_type     as pointer_type,
  points.name             as pointer_name,
  sequences.id            as sequence_id,
  sequences.name          as sequence_name,
  edge_nodes.id           as edge_node_id
FROM "edge_nodes"
  INNER JOIN "sequences" ON edge_nodes.sequence_id=sequences.id
  INNER JOIN "points"    ON (edge_nodes.value)::int=points.id
WHERE "edge_nodes"."kind" = 'pointer_id';
