require "spec_helper"

# Api::DevicesController is the RESTful endpoint for managing device related
# settings. Consumed by the Angular SPA on the front end.
describe Api::DevicesController do
  include Devise::Test::ControllerHelpers
  describe "#update" do
    let(:user) { FactoryBot.create(:user) }
    let(:user2) { FactoryBot.create(:user) }
    let(:device) { user.device }
    let(:tool) { FactoryBot.create(:tool, device: user.device) }

    it "updates a Device" do
      sign_in user
      fake_name = Faker::Name.name
      put :update,
          body: { id: user.device.id, name: fake_name }.to_json,
          session: { format: :json }
      # put path, params, options
      user.reload
      device = user.reload.device.reload
      expect(device.name).to eq(fake_name)
      expect(response.status).to eq(200)
    end

    it "updates a Device Timezone wrong" do
      sign_in user
      before = user.device.timezone
      put :update,
          body: { id: user.device.id, timezone: "NO!" }.to_json,
          session: { format: :json }
      # put path, params, options
      user.reload
      expect(response.status).to eq(422)
      device = user.reload.device.reload
      expect(json[:error]).to include("not a valid timezone")
      expect(user.device.timezone).to eq(before)
    end

    it "updates a Device timezone correctly" do
      sign_in user
      fake_tz = Device::TIMEZONES.sample
      put :update, body: { id: user.device.id, timezone: fake_tz }.to_json, session: { format: :json }
      user.reload
      device = user.reload.device.reload
      expect(device.timezone).to eq(fake_tz)
      expect(response.status).to eq(200)
    end

    it "mounts a tool" do
      sign_in user
      put :update,
        body: {
          id: user.device.id,
          mounted_tool_id: tool.id,
        }.to_json,
        session: { format: :json }
      user.reload
      device = user.reload.device.reload
      expect(device.mounted_tool_id).to eq(tool.id)
      expect(response.status).to eq(200)
    end

    it "performs referential integrity checks on mounted_tool_id" do
      sign_in user
      put :update,
        body: {
          id: user.device.id,
          mounted_tool_id: (FactoryBot.create(:tool).id + 1),
        }.to_json,
        session: { format: :json }
      expect(response.status).to eq(422)
      expect(json[:mounted_tool_id]).to include("Can't mount to tool")
    end

    it "dismounts a tool" do
      sign_in user
      device.update!(mounted_tool_id: tool.id)
      expect(device.mounted_tool_id).to be
      put :update,
        body: { id: user.device.id, mounted_tool_id: 0 }.to_json,
        session: { format: :json }
      expect(device.reload.mounted_tool_id).not_to be
      expect(json[:mounted_tool_id]).to be(nil)
    end

    def set_ota_hour(value)
      sign_in user
      body = { id: user.device.id, ota_hour: value }.to_json
      put :update, body: body, session: { format: :json }
    end

    it "sets `ota_hour`" do
      set_ota_hour(12)
      expect(device.reload.ota_hour).to eq(12)
    end

    it "unsets `ota_hour`" do
      set_ota_hour(nil)
      expect(device.reload.ota_hour).to eq(nil)
    end

    it "validates ota_hour" do
      set_ota_hour(27)
      expect(json[:error]).to eq("Validation failed: Ota hour must be a value from 0 to 23.")
      expect(response.status).to eq(422)
    end
  end
end
