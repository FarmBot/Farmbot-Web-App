require_relative "../../lib/hstore_filter"

module Api
  class PointsController < Api::AbstractController
    class BadPointerType < StandardError; end
    ALL_POINTERS     = Point::POINTER_KINDS.join(", ")
    BAD_POINTER_TYPE = <<~XYZ
      Please provide a JSON object with a `pointer_type` that matches one
      of the following values: %s
    XYZ

    rescue_from BadPointerType do |exc|
      sorry BAD_POINTER_TYPE.split(/\n+/).join(" ") % [ALL_POINTERS], 422
    end

    def index
      render json: points
    end

    def show
      render json: points.find(params[:id])
    end

    def search
      mutate Points::Query.run(raw_json, device_params)
    end

    def create
      mutate pointer_klass::Create.run(raw_json, device_params)
    end

    def update
      mutate Points::Update.run(raw_json, { point: point }, device_params)
    end

    def destroy
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
      Point.includes(:pointer).where(device_params)
    end

    def device_params
      @device_params ||= {device: current_device}
    end
  end
end
