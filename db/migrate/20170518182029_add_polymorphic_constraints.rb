class AddPolymorphicConstraints < ActiveRecord::Migration[5.1]
  def change
    add_polymorphic_constraints :pointer, :tool_slots
    add_polymorphic_constraints :pointer, :plants
    add_polymorphic_constraints :pointer, :generic_pointers
  end
end
