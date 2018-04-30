SELECT
  points.x                as x,
  points.y                as y,
  points.z                as z,
  sequences.id            as sequence_id,
  edge_nodes.id           as edge_node_id,
  points.device_id        as device_id,
  (edge_nodes.value)::int as point_id,
  points.pointer_type     as pointer_type,
  points.name             as pointer_name,
  sequences.name          as sequence_name
FROM "edge_nodes"
  INNER JOIN "sequences" ON edge_nodes.sequence_id=sequences.id
  INNER JOIN "points"    ON (edge_nodes.value)::int=points.id
WHERE "edge_nodes"."kind" = 'pointer_id';
