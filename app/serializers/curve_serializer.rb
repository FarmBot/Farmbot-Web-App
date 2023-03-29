class CurveSerializer < ApplicationSerializer
  attributes :created_at,
             :updated_at,
             :name,
             :type,
             :data

  def data
    object.data || {}
  end
end
