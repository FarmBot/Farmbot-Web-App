module Points
  class Update < Mutations::Command
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
      hstore  :meta
    end

    def validate
      throw "BRB" if (tool_id &&
                      !device
                        .tools
                        .pluck(:id)
                        .include?(tool_id))
      prevent_removal_of_in_use_tools
    end

    def execute
      point.update_attributes!(update_params) && point
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
      p && p.assign_attributes(inputs.slice(:tool_id, :openfarm_slug))
    end

    def has_new_tool_id?
      raw_inputs.key?("tool_id")
    end

    def prevent_removal_of_in_use_tools
      results = Points::ToolRemovalCheck.run(point:             point,
                                             attempting_change: has_new_tool_id?,
                                             next_tool_id:      tool_id)
      ok      = results.success?
      results
        .errors
        .values
        .map { |e| add_error e.symbolic, e.symbolic, e.message } unless ok
    end
  end
end
