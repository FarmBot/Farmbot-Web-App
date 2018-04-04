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
  end

  def down
    execute "DROP VIEW IF EXISTS in_use_tools;"
  end
end
