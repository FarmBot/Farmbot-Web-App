module Tools
  class Update < Mutations::Command
    required do
      model :tool, class: Tool
      model :device, class: Device
    end

    optional do
      string :name
      integer :flow_rate_ml_per_s
      float :seeder_tip_z_offset
      string :type, in: Tool::TYPES
      float :effector_offset_x
      float :effector_offset_y
      float :effector_offset_z
      boolean :utm_mountable
    end

    def validate
      validate_ownership
    end

    def execute
      tool.update!(inputs.except(:tool, :device)) && tool
    end

    private

    def validate_ownership
      raise Errors::Forbidden unless tool.device_id == device.id
    end
  end
end
