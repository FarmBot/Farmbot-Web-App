module Api
  class PointGroupsController < Api::AbstractController
    before_action :clean_expired_farm_events, only: [:destroy]

    def index
      render json: your_point_groups
    end

    def show
      render json: the_point_group
    end

    def create
      mutate PointGroups::Create.run(raw_json, point_group_params)
    end

    def update
      mutate PointGroups::Update.run(raw_json, point_group_params, point_group: the_point_group)
    end

    def destroy
      mutate PointGroups::Destroy.run(point_group: the_point_group, device: current_device)
    end

    private

    def the_point_group
      your_point_groups.find(params[:id])
    end

    def your_point_groups
      PointGroup.preload(:point_group_items).where(point_group_params)
    end

    def point_group_params
      @point_group_params ||= { device: current_device }
    end
  end
end
