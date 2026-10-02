class FlipEffectorZOffsets < ActiveRecord::Migration[8.1]
  def up
    flip_effector_offset_signs
  end

  def down
    flip_effector_offset_signs
  end

  private

  def flip_effector_offset_signs
    execute <<~SQL
      UPDATE tools
      SET effector_offset_z = -effector_offset_z;
    SQL
  end
end
