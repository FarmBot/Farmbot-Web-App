class WebAppConfigSerializer < ActiveModel::Serializer
  attributes *WebAppConfig.column_names.map(&:to_sym)
end
