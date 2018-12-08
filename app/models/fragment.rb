# A fragment of CeleryScript code, not unlike Lua's "fragment" concept.
# All nodes and primitives in the CeleryScript AST tree are tagged with a
# fragment_id for performance.
class Fragment < ApplicationRecord
  belongs_to :device
  has_many :primitives,      dependent: :destroy
  has_many :nodes,           dependent: :destroy
  has_many :arg_sets,        dependent: :destroy
  has_many :primitive_pairs, dependent: :destroy
  has_many :standard_pairs,  dependent: :destroy
end
