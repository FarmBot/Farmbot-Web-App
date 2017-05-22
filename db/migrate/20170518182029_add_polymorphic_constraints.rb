class AddPolymorphicConstraints < ActiveRecord::Migration[5.1]
  def change
    add_polymorphic_constraints :pointer,
                                :points,
                                polymorphic_models: [:plant,
                                                     :tool_slot,
                                                     :generic_pointer]
  end
end
