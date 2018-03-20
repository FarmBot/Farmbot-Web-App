class Hash
  def traverse(parent=nil, &blk)
    each do |k, v|
      Hash === v ? v.traverse(k, &blk) : blk.call([parent, k, v])
    end
  end
end

module Helpers
  MAGIC_NUMBER_SEQ_ID  = "9999"
  MAGIC_NUMBER_TOOL_ID = "8888"
  AST_FIXTURE          = File.read("./spec/lib/celery_script/ast_fixture3.json")

  def last_email
    ActionMailer::Base.deliveries.last
  end

  def empty_mail_bag
    ActionMailer::Base.deliveries = []
  end

  # Create a VALID fake sequence.body for a particular user. Creates a fake
  # subsequence in the DB when called.
  def sequence_body_for(mystery)
    case mystery
    when User
      device = user.device
    when Device
      device = mystery
    when Sequence
      device = mystery.device
    else
      raise "No #{mystery.class}"
    end
    sid = FakeSequence.create( device: device).id
    tid = FactoryBot.create(:tool, device: device).id
    str = AST_FIXTURE
           .gsub(MAGIC_NUMBER_SEQ_ID, sid.to_s)
           .gsub(MAGIC_NUMBER_TOOL_ID, tid.to_s)
    JSON.parse(str)["body"]
  end

  def sign_in_as(user)
    # For when you're actually testing the login UI components. Otherwise,
    # consider using the devise test helper `sign_in`
    visit new_user_session_path
    fill_in 'user_email', with: user.email
    fill_in 'user_password', with: user.password
    click_button 'Sign in'
  end

  def json
    json = JSON.parse(response.body)

    if json.is_a?(Array)
      json.map(&:deep_symbolize_keys!)
    else
      json.deep_symbolize_keys!
    end
  end
end
