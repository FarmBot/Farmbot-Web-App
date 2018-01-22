class FbosConfigSerializer < ActiveModel::Serializer
  attributes *FbosConfig.column_names.map(&:to_sym)
end
