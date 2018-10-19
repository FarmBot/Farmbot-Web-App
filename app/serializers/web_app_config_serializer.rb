class WebAppConfigSerializer < ApplicationSerializer
  attributes *WebAppConfig.column_names.map(&:to_sym)
end
