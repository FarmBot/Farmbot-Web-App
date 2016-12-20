module Helpers
  AST_FIXTURE = File.read("./spec/lib/celery_script/ast_fixture3.json").freeze

  # Create a VALID fake sequence.body for a particular user. Creates a fake
  # subsequence in the DB when called.
  def sequence_body_for(input)
    user ||= FactoryGirl.create(:user)
    body = JSON.parse(AST_FIXTURE)["body"]
    case input
    when User; id = FactoryGirl.create(:sequence, device: user.device).id
    when Sequence; id = input.id
    else; raise "?????"
    end
    tool_id = FactoryGirl.create(:tool, device: user.device).id
    body.map! do |node|
      has_subseq = node.dig("args", "sub_sequence_id")
      has_tool   = node.dig("args", "location", "args", "tool_id")
      node["args"]["location"]["args"]["tool_id"] = tool_id if has_tool
      node["args"]["sub_sequence_id"] = id if has_subseq
      node
    end
    body
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
