class CreateInUseResources < ActiveRecord::Migration[5.1]
  # I goofed up on this migration and deployed to staging before I could fix.
  # See later migration that creates a new view using the `scenic` gem. - RC
  def up
    execute "DROP VIEW IF EXISTS in_use_tools;"
    execute "DROP VIEW IF EXISTS in_use_points;"

    create_view :in_use_tools
    create_view :in_use_points
  end

  def down
    drop_view :in_use_tools
    drop_view :in_use_points
  end
end
