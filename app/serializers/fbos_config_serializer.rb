class FbosConfigSerializer < ApplicationSerializer
  attributes *FbosConfig.column_names.map(&:to_sym)
end
