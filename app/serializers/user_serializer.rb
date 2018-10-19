class UserSerializer < ApplicationSerializer
  attributes :id, :created_at, :updated_at, :name, :email
end
