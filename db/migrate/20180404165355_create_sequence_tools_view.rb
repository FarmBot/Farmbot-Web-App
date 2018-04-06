class CreateSequenceToolsView < ActiveRecord::Migration[5.1]
  def up
    execute  'CREATE VIEW in_use_tools AS
              SELECT
                tools.id            as tool_id,
                tools.name          as tool_name,
                sequences.name      as sequence_name,
                sequences.id        as sequence_id,
                sequences.device_id as device_id
              FROM "edge_nodes"
              INNER JOIN "sequences" ON sequences.id=sequences.id
              INNER JOIN "tools"     ON (edge_nodes.value)::int=tools.id
              WHERE "edge_nodes"."kind" = \'tool_id\';'

    execute  'CREATE VIEW in_use_points AS
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
              WHERE "edge_nodes"."kind" = \'pointer_id\';'
  end

  def down
    execute "DROP VIEW IF EXISTS in_use_tools;"
    execute "DROP VIEW IF EXISTS in_use_points;"
  end
end
