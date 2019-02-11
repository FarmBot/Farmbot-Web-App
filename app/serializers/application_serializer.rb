class ApplicationSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :updated_at

  def body
    f = object.fragment
    f ? f.serialize.fetch(:body, []) : []
  end
end
