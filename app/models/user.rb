### A single system User on the decision support system.
class User < ActiveRecord::Base

  belongs_to :device, dependent: :destroy
  validates_uniqueness_of :email
  devise :database_authenticatable, :registerable, :recoverable, :rememberable,
         :trackable, :validatable
end
