class FirmwareConfigSerializer < ApplicationSerializer
  # REFERENCES TO `LEGACY_FIELDS` CAN BE REMOVED after FBOS
  # v12.2 REACHES EOL.
  LEGACY_FIELDS = [:firmware_debug_log, :firmware_input_log, :firmware_output_log]
  LEGACY_FIELDS.map do |field|
    define_method(field) do
      false
    end
  end
  attributes *FirmwareConfig.column_names.map(&:to_sym) + LEGACY_FIELDS
end
