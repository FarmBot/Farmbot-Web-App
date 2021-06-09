class FbosConfigSerializer < ApplicationSerializer
  attributes *FbosConfig.column_names.map(&:to_sym)

  def disable_factory_reset
    true
  end
end
