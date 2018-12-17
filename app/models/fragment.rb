# A fragment of CeleryScript code, not unlike Lua's "fragment" concept.
# All nodes and primitives in the CeleryScript AST tree are tagged with a
# fragment_id for performance.
class Fragment < ApplicationRecord
  # Avoid N+1s: Fragment.includes(Fragment::EVERYTHING)
  EVERYTHING = { nodes: Node::EVERYTHING }
  SERIALIZER = "serialized"
  belongs_to :device
  has_one  :farm_event # Possibly undefined
  has_many :primitives,      dependent: :destroy
  has_many :nodes,           dependent: :destroy
  has_many :arg_sets,        dependent: :destroy
  has_many :primitive_pairs, dependent: :destroy
  has_many :standard_pairs,  dependent: :destroy

  def serialize(*x)
    Rails.cache.fetch(json_cache_key) do
      Fragments::Show.run!(fragment_id: self.id, device: self.device)
    end
  end

  def json_cache_key
    [cache_key_with_version, SERIALIZER].join("/")
  end
end
