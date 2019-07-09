class CreatePointUsageForResourceUpdateSteps < ActiveRecord::Migration[5.2]
  def change
    create_view :point_usage_for_resource_update_steps
  end
end
