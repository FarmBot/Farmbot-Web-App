require_relative "../../lib/hstore_filter"

module Api
  class PointsController < Api::AbstractController
    class BadPointerType < StandardError; end
    ALL_POINTERS     = Point::POINTER_KINDS.join(", ")
    # How long we wait until emptying out the discarded points bin.
    EXPIRY           = 2.months
    BAD_POINTER_TYPE = <<~XYZ
      Please provide a JSON object with a `pointer_type` that matches one
      of the following values: %s
    XYZ

    # WHY 1000?:
    #  * This limit is placed for _technical_ reasons, not business reasons.
    #    * 2019 RPis + Frontend UI cannot reliably handle > 1000 points.
    #  * Bots with > 800 points are outliers. Most users simply don't have that
    #    many plants
    #  * An XL bot at 100% capacity and 1000 evenly space plants =
    #      5 inch point grid. Smaller bed = higher resolution.
    POINT_HARD_LIMIT = 10 #00 # Not allowed to exceed this.
    POINT_SOFT_LIMIT = (POINT_HARD_LIMIT * 0.8).to_i

    rescue_from BadPointerType do |exc|
      sorry BAD_POINTER_TYPE.split(/\n+/).join(" ") % [ALL_POINTERS], 422
    end

    def index
      Point.discarded.where("discarded_at < ?", Time.now - EXPIRY).destroy_all
      render json: points
    end

    def show
      render json: points.find(params[:id])
    end

    def search
      mutate Points::Query.run(raw_json, points: points)
    end

    def create
      case point_count Point.where(device_id: current_device.id).count
      when (0..POINT_SOFT_LIMIT)
        mutate pointer_klass::Create.run(raw_json, device_params)
      when (POINT_SOFT_LIMIT..POINT_HARD_LIMIT)
        raise "Do a soft warning here."
      when (POINT_HARD_LIMIT..nil) # nil means Infinity
        raise "Do a hard warning here."
      end
    end

    def update
      mutate Points::Update.run(raw_json, { point: point }, device_params)
    end

    def destroy
      # TODO: We don't need to do batch requests like this any more.
      # This should be removed when possible. -RC 1 AUG 2018
      ids = params[:id].to_s.split(",").map(&:to_i)
      mutate Points::Destroy.run({point_ids: ids}, device_params)
    end

    private

    # HISTORICAL CONTEXT:
    # Originally, Points, Tools and Plants were all independantly created as
    # separate tables.
    # As time progressed, we were able to merge them into a unified "points"
    # table and use polymorphic associations to iron out the minor differences.
    # Polymorphic assns later proved to be error prove and inadequate, leading
    # to a conversion to single table inheritance.
    # STI is the current mecahnism. The method is a relic from previous
    # iterations
    def pointer_klass
      puts "TODO: Unify these in to a single mutation in  prep for HTTP free "\
           "resource creation"
      case raw_json&.dig(:pointer_type)
        when "GenericPointer" then Points
        when "ToolSlot"       then ToolSlots
        when "Plant"          then Plants
        else;                 raise BadPointerType
      end
    end

    def point
      @point ||= points.find(params[:id])
    end

    def points
      @points ||= unrestricted_archival_scope.where(device_params)
    end

    def unrestricted_archival_scope
      case params[:filter]
      when "all" then return Point.all
      when "old" then return Point.discarded
      end
      return Point.kept
    end

    def device_params
      @device_params ||= {device: current_device}
    end
  end
end
