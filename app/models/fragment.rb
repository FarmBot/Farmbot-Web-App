# The most complicated part of the application. The text below describes the
# implementation details for CeleryScript, a visual programming language and RPC
# format. READ FIRST: https://developer.farm.bot/docs/celery-script
#
# PROBLEM: You need to store a CeleryScript AST in a way that is:
#
#   * REUSABLE - Can be used on any resource that is scriptable (Sequence,
#                FarmEvent, Regimen, etc...)
#   * Normalized - Has a flat structure that is advantageous to SQL storage, can
#                  easily perform operations such as global renaming .
#   * Searchable - Able to answer questions like "Are any Celery nodes
#                  referencing sequence 123?" or "How many FarmEvents have 3
#                  params?".
#   * Efficient(ish) - Does not waste DB space or require full table scans.
#                      There is room for improvement here, but I don't feel like
#                      adding a GraphDB to the app yet.
# SOLUTION:
#   Slice the CeleryScript AST Tree into a "fragment" of CeleryScript code,
#   not unlike Lua's "fragment" concept. All nodes and primitives in the
#   CeleryScript AST tree are tagged with a fragment_id to simplify queries.
#
# RELATIONSHIP STRUCTURE:
#
#   ["Owner"]  (Polymorphic 1-to-1. FarmEvent, Regimen, etc...)
#     ^
#     |
#   [Fragment] (1)
#     ^
#     |        (N->1)
#   [AST Node] (N->N)
#     ^ | ^
#     | |_|    (Self-Referential)
#     |
#     | (1->1)
#   [ArgSet]
#     ^
#     |\
#     | `----[PrimitivePair]-> (Primitive, ArgName pairing)
#     |
#   [StandardPair]--> (Node, ArgName pairing)
#
# HOW STORAGE WORKS (Fragments::Create):
#   1. Canonical CeleryScript is sliced into a flat IR
#   2. Flat IR is further decomposed into Node, ArgSet, ArgName,
#      StandardPair, PrimitivePair.
#
# HOW RETRIEVAL WORKS (Fragments::Show):
#   1. Select all `Node, ArgSet, ArgName, StandardPair, PrimitivePair where
#      fragment_id = ?`
#   2. Reconstruct an in-memory index to speed up queries and reduce N+1s. See:
#      fragments/cache.rb
#   3. Convert flat IR back into canonical nested form.
class Fragment < ApplicationRecord
  # Avoid N+1s: Fragment.includes(Fragment::EVERYTHING)
  EVERYTHING = { nodes: Node::EVERYTHING }
  belongs_to :device
  belongs_to :owner, polymorphic: true, inverse_of: :fragment
  has_many :primitives, dependent: :destroy
  has_many :nodes
  has_many :primitive_pairs
  has_many :standard_pairs
  has_many :arg_sets
  before_destroy :clean_nodes

  def clean_nodes
    Node.where(fragment_id: self.id).destroy_all
  end

  def serialize(*x)
    Rails
      .cache
      .fetch(json_cache_key) { Fragments::Show.run!(owner: self.owner) }
  end

  def json_cache_key
    ["fragments", id, updated_at.to_i].join(":")
  end

  def self.from_celery(device:, kind:, args:, body:, owner:)
    p = { device: device, kind: kind, args: args, body: body }
    flat_ast = Fragments::Preprocessor.run!(p)
    Fragments::Create.run!(device: device,
                           flat_ast: flat_ast,
                           owner: owner)
  end

  def broadcast?
    false
  end
end
