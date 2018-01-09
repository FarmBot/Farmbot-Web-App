class FarmEventSerializer < ActiveModel::Serializer
  attributes :id, :start_time, :end_time, :repeat, :time_unit, :executable_id,
             :executable_type
end
