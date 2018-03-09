module Points
  class Update < Mutations::Command
    WHITELIST = [ :tool_id,
                  :openfarm_slug,
                  :pullout_direction,
                  :plant_stage,
                  :planted_at ]

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
      string  :plant_stage, in: CeleryScriptSettingsBag::PLANT_STAGES
      time    :planted_at
      hstore  :meta
    end

    def validate
      prevent_removal_of_in_use_tools
    end

    def execute
      Point.transaction { point.update_attributes!(update_params) && point }
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

    def new_tool_id?
      raw_inputs.key?("tool_id")
    end

    def prevent_removal_of_in_use_tools
      results = Points::ToolRemovalCheck.run(point: point,
                                             attempting_change: new_tool_id?,
                                             next_tool_id: tool_id)

      !results.success? && results
        .errors
        .values
        .map { |e| add_error e.symbolic, e.symbolic, e.message }
    end
  end
end
