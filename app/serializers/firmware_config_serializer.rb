class FirmwareConfigSerializer < ActiveModel::Serializer
  attributes *FirmwareConfig.column_names.map(&:to_sym)
end
