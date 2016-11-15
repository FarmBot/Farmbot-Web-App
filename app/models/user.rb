### A single system User on the decision support system.
class User < ActiveRecord::Base
  belongs_to :device, dependent: :destroy

  devise :database_authenticatable, :registerable, :recoverable, :rememberable,
         :trackable, :validatable

end
