require_relative "../../lib/hstore_filter"
# WHY??? ^
module Points
  class Create < Mutations::Command
    # WHY 1000?:
    #  * This limit is placed for _technical_
    #    reasons, not business reasons. If it were
    #    reasonable to have that many points, we
    #    would certainly allow it. Real world use
    #    has shown that devices cannot support this
    #    many points (CPU limits).
    #  * 2019 RPis + Frontend UI cannot reliably
    #    handle > 1000 points.
    #  * Bots with > 800 points are outliers. Most
    #    users simply don't have that many plants
    #  * An XL bot at 100% capacity and 1000
    #    evenly space plants = 5 inch point grid.
    #    Smaller bed = higher resolution.
    POINT_HARD_LIMIT = 1000 # Can't exceed this.
    POINT_SOFT_LIMIT = (POINT_HARD_LIMIT * 0.8).to_i
    BAD_TOOL_ID = "Can't find tool with id %s"
    DEFAULT_NAME = "Untitled %s"
    KINDS = Point::POINTER_KINDS
    GETTING_CLOSE = "Your account is " \
    "approaching the allowed point limit of " \
    "#{POINT_HARD_LIMIT}. Consider deleting old" \
    " points to avoid adverse performance."
    TOO_MANY = "Your device has hit the " \
    "max limit for point usage (currently " \
    "#{POINT_HARD_LIMIT}). Please delete unused" \
    " map points and plants to create more "
    BAD_POINTER_TYPE =
      "Please provide a JSON object with a `poin" \
      "ter_type` that matches one of the followi" \
      "ng values: #{KINDS.join(", ")}"

    required do
      float :x
      float :y
      float :z, default: 0
      model :device, class: Device
      string :pointer_type
    end

    optional do
      hstore :meta
      float :radius, default: 25
      integer :pullout_direction,
              min: ToolSlot::PULLOUT_DIRECTIONS.min,
              max: ToolSlot::PULLOUT_DIRECTIONS.max
      integer :tool_id, empty: true
      string :name
      string :openfarm_slug, default: "not-set"
      string :plant_stage,
             in: CeleryScriptSettingsBag::PLANT_STAGES
      time :created_at # TODO: Are we still using this?
      time :planted_at, default: 0
      boolean :gantry_mounted
    end

    def validate
      return unless safe_pointer_kind? # Security critical always goes first.
      validate_resource_count
      validate_tool if klass_ == ToolSlot
      name ||= default_name
    end

    def execute
      klass_.create!(inputs)
    end

    private

    def validate_resource_count
      actual =
        Point.where(device_id: device.id).count
      case actual
      when POINT_SOFT_LIMIT
        device.points.discarded.delete_all
        device.tell(GETTING_CLOSE % { actual: actual }, ["fatal_email"])
      when POINT_HARD_LIMIT...nil
        device.points.discarded.delete_all
        add_error(:point_limit, :point_limit, TOO_MANY)
      end
    end

    def default_name
      DEFAULT_NAME % klass_.model_name.human.downcase
    end

    def safe_pointer_kind? # Security critical code!
                           # Prevent malicious `.constantize` calls.
      if Point::POINTER_KINDS.include?(pointer_type) && klass_
        true
      else
        add_error :pointer_type, :bad_pointer_type, BAD_POINTER_TYPE
        false
      end
    end

    def klass_
      @klass_ ||= pointer_type.constantize
    end

    def bad_tool_id?
      tool_id.present? && !device.tools.where(id: tool_id).any?
    end

    def validate_tool
      add_error :tool_id, :not_found, BAD_TOOL_ID % tool_id if bad_tool_id?
    end
  end
end
