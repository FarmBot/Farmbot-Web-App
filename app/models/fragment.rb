# A fragment of CeleryScript code, not unlike Lua's "fragment" concept.
# All nodes and primitives in the CeleryScript AST tree are tagged with a
# fragment_id to simplify queries.
class Fragment < ApplicationRecord
  # Avoid N+1s: Fragment.includes(Fragment::EVERYTHING)
  EVERYTHING = { nodes: Node::EVERYTHING }
  SERIALIZER = "serialized"
  belongs_to :device
  belongs_to :owner, polymorphic: true
  has_many :nodes,          dependent: :destroy
  has_many :primitives,     dependent: :destroy
  has_many :primitive_pairs
  has_many :standard_pairs
  has_many :arg_sets
  before_destroy :clean_nodes

  def clean_nodes
    Node.where(fragment_id: self.id).destroy_all
  end

  def serialize(*x)
    Rails.cache.fetch(json_cache_key) do
      Fragments::Show.run!(fragment_id: self.id, device: self.device)
    end
  end

  def json_cache_key
    [cache_key_with_version, SERIALIZER].join("/")
  end

  def self.from_celery(device:, kind:, args:, body:, owner:)
    p        = { device: device, kind: kind, args: args, body: body }
    flat_ast = Fragments::Preprocessor.run!(p)
    Fragments::Create.run!(device:   device,
                           flat_ast: flat_ast,
                           owner:    owner)
  end
end
