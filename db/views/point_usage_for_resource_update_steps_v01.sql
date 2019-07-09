SELECT
  primary_node_id,
  MAX(CASE WHEN "x"."key"='resource_type' THEN value END) pointer_type,
  MAX(CASE WHEN "x"."key"='resource_id' THEN value END)   pointer_id,
  MAX("x"."sequence_id") sequence_id
FROM (SELECT "edge_nodes"."sequence_id" "sequence_id", "primary_nodes"."id" "primary_node_id", "edge_nodes"."kind" "key", "edge_nodes"."value" "value"
  FROM "primary_nodes", "edge_nodes"
  WHERE "primary_nodes"."id" = "edge_nodes"."primary_node_id" AND "primary_nodes"."kind" = 'resource_update' AND "edge_nodes"."kind" IN ( 'resource_type', 'resource_id' ))
AS x
GROUP BY primary_node_id;
