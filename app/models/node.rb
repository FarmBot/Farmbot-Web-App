# Support class for Fragment. Please see fragment.rb for documentation.
class Node < ApplicationRecord
  belongs_to :body,   foreign_key: { to_table: :nodes }
  belongs_to :next,   foreign_key: { to_table: :nodes }
  belongs_to :parent, foreign_key: { to_table: :nodes }

  belongs_to :fragment
  belongs_to :kind
end
