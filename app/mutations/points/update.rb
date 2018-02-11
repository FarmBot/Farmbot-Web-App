module Points
  class Update < Mutations::Command
    WHITELIST = [:tool_id, :openfarm_slug, :pullout_direction]

    required do
      model :device, class: Device
      model :point,  class: Point
    end

    optional do
      integer :tool_id, nils: true, empty_is_nil: true
      float   :x
      float   :y
      float   :z
      float   :radius
      string  :name
      string  :openfarm_slug
      integer :pullout_direction
      hstore  :meta
    end

    def validate
      # TODO: Remove this guy.
      throw "BRB" if (tool_id &&
                      !device
                        .tools
                        .pluck(:id)
                        .include?(tool_id))
      prevent_removal_of_in_use_tools
    end

    def execute
      Point.transaction do
        point.update_attributes!(update_params) && point
      end
    end

  private

    def update_params
      maybe_update_pointer
      inputs
        .slice(*Point::SHARED_FIELDS)
        .merge(pointer: point.pointer)
    end

    def maybe_update_pointer
      p = point.pointer
      p && p.update_attributes!(inputs.slice(*WHITELIST))
    end

    def has_new_tool_id?
      raw_inputs.key?("tool_id")
    end

    def prevent_removal_of_in_use_tools
      raise "rewrite required"
    end
  end
end
