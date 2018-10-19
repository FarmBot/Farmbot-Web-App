class ApplicationSerializer < ActiveModel::Serializer
  cache
  attributes :id, :created_at, :updated_at
end
