SELECT
  tools.id               AS tool_id,
  tools.name             AS tool_name,
  sequences.name         AS sequence_name,
  sequences.id           AS sequence_id,
  sequences.device_id    AS device_id
FROM "edge_nodes"
  INNER JOIN "sequences" ON edge_nodes.sequence_id=sequences.id
  INNER JOIN "tools"     ON (edge_nodes.value)::int=tools.id
WHERE "edge_nodes"."kind" = 'tool_id';
