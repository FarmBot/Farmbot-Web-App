module Curves
  class Update < Mutations::Command
    include Curves::Helpers
    EXCLUDED_FIELDS = [:device, :curve]

    required do
      model :device, class: Device
      model :curve, class: Curve
    end

    optional do
      string :name
      string :type
      hash(:data) { integer :* }
    end

    def validate
      validate_curve_type
    end

    def execute
      curve.update!(update_attributes) && curve
    end

    private

    def update_attributes
      @update_attributes ||= inputs
        .except(*EXCLUDED_FIELDS)
    end
  end
end
