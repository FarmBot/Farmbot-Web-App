class DropStepsAndStepParams < ActiveRecord::Migration
  def change
    drop_table :step_params
    drop_table :steps
  end
end
