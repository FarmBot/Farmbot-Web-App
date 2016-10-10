class SequenceSerializer < ActiveModel::Serializer
  attributes :id, :name, :color, :body, :args, :kind
end
