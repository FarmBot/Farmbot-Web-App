class AddWithdrawnAtToSequenceVersions < ActiveRecord::Migration[8.1]
  def up
    add_column :sequence_versions, :withdrawn_at, :datetime

    execute <<~SQL
      UPDATE sequence_versions
      SET withdrawn_at = sequence_publications.updated_at
      FROM sequence_publications
      WHERE sequence_versions.sequence_publication_id = sequence_publications.id
        AND sequence_publications.published = FALSE
    SQL
  end

  def down
    remove_column :sequence_versions, :withdrawn_at
  end
end
