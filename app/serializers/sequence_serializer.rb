class SequenceSerializer < ActiveModel::Serializer
  attributes :id, :name, :color, :body, :args, :kind

  # Historical context:
  #  * We have a `name` column in the sequences table.
  #  * We have an `args` column.
  #  * FBOS would prefer to keep `name` in args
  #  * Legacy bots still need a `name` column.
  def args
    object.args.merge({label: object.name})
  end
end
