module Tools
  class Create < Mutations::Command
    required do
      string :name
      string :type, in: Tool::TYPES
      model :device, class: Device
    end

    optional do
      integer :flow_rate_ml_per_s
      float :seeder_tip_z_offset
      float :effector_offset_x
      float :effector_offset_y
      float :effector_offset_z
      boolean :utm_mountable
    end

    def execute
      Tool.create!(inputs)
    end
  end
end
