class ExtendEdgeNodeValueColumn < ActiveRecord::Migration[6.1]
  VIEWS = {
    resource_update_steps: 1,
    sequence_usage_reports: 1,
    in_use_tools: 2,
    in_use_points: 2,
  }

  # PROBLEM:
  #   PG::FeatureNotSupported: ERROR: cannot alter type of
  #   a column used by a view or rule
  # SOLUTION:
  #   https://github.com/scenic-views/scenic/issues/166#issuecomment-242142267
  def hack
    VIEWS.map { |(name, _version)| drop_view(name) }
    yield
    VIEWS.map { |(name, version)| create_view(name, version: version) }
  end

  def up
    hack do
      change_column :edge_nodes, :value, :string, limit: 1500
    end
  end

  def down
    hack do
      change_column :edge_nodes, :value, :string, limit: 300
    end
  end
end
