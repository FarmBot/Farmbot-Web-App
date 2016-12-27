# A human
class User < ActiveRecord::Base
  belongs_to :device, dependent: :destroy

  devise :database_authenticatable, :trackable

  # http://stackoverflow.com/a/5127684/1064917
  before_validation :set_defaults

  def set_defaults
    self.verification_token ||= SecureRandom.uuid
  end

  def verified?
    !!verified_at
  end
end
