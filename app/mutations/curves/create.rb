module Curves
  class Create < Mutations::Command
    include Curves::Helpers

    required do
      model :device, class: Device
      string :name
      string :type
      hash(:data) { integer :* }
    end

    def validate
      validate_curve_type
    end

    def execute
      Curve.create!(inputs)
    end
  end
end
