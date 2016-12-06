class LogSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :message, :meta, :channels
end
