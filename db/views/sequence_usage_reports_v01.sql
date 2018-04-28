SELECT
  sequences.id as sequence_id,
  (SELECT COUNT(*)
    FROM  edge_nodes
    WHERE edge_nodes.kind = 'sequence_id'
    AND   (edge_nodes.value)::int = sequences.id)    AS edge_node_count,
  (SELECT COUNT(*)
    FROM  farm_events
    WHERE farm_events.executable_id = sequences.id
    AND   farm_events.executable_type = 'Sequence')   AS farm_event_count,
  (SELECT COUNT(*)
    FROM  regimen_items
    WHERE regimen_items.sequence_id = sequences.id) AS regimen_items_count
FROM
  sequences;
