class CreateResourceUpdateSteps < ActiveRecord::Migration[5.2]
  def change
    create_view :resource_update_steps
  end
end
