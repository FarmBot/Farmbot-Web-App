class FirmwareConfigSerializer < ApplicationSerializer
  attributes *FirmwareConfig.column_names.map(&:to_sym)
end
