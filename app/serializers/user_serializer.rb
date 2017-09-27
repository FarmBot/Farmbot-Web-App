class UserSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :updated_at, :name, :email
end
