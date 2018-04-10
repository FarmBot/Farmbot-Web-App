class CreateSequenceToolsView < ActiveRecord::Migration[5.1]
  def change
    # I goofed up on this migration and deployed to staging before I could fix.
    # See later migration that creates a new view using the `scenic` gem.
    execute "DROP VIEW IF EXISTS in_use_tools;"
    execute "DROP VIEW IF EXISTS in_use_points;"
  end
end
