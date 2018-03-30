require 'spec_helper'
JSON_EXAMPLE = File.read("spec/controllers/api/logs/connor_fixture.json")

describe Api::LogsController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user) }
  let!(:logs) { FactoryBot.create_list(:log, 5, device: user.device) }

  describe '#index' do
    it 'lists last x logs' do
      sign_in user
      get :index
      expect(response.status).to eq(200)
      expect(json.first[:id]).to eq(logs.first.id)
      expect(json.first[:created_at]).to eq(logs.first.created_at.to_i)
      expect(json.last[:meta][:type]).to eq(logs.last.type)
    end
  end

  describe "#create" do
    it 'creates one log' do
      sign_in user
      before_count = Log.count
      post :create,
           body: { meta: { x: 1, y: 2, z: 3, type: "info" },
                   channels: ["toast"],
                   message: "Hello, world!"
                 }.to_json,
           params: {format: :json}
      expect(response.status).to eq(200)
      expect(Log.count).to be > before_count
      expect(Log.last.message).to eq("Hello, world!")
      expect(Log.last.device).to eq(user.device)
    end

    it 'disallows blacklisted (sensitive) words in logs' do
      Log.destroy_all
      stub = { meta: { x: 1, y: 2, z: 3, type: "info" },
               channels: ["toast"],
               message: "my password is foo123!" }
      sign_in user
      post :create, body: stub.to_json, params: {format: :json}
      expect(json[:log]).to include(Logs::Create::BAD_WORDS)
      expect(response.status).to eq(422)
      expect(Log.count).to eq(0)
    end

    it 'creates many logs (with an Array)' do
      sign_in user
      before_count = Log.count
      run_jobs_now do
        post :create,
             body: [
              { meta: { x: 1, y: 2, z: 3, type: "info" },
                channels: ["toast"],
                message: "one" },
              { meta: { x: 1, y: 2, z: 3, type: "info" },
                channels: ["toast"],
                message: "two" },
              { meta: { x: 1, y: 2, z: 3, type: "info" },
                channels: ["toast"],
                message: "three" },
             ].to_json,
             params: {format: :json}
      end
      expect(response.status).to eq(200)
      expect(before_count + 3).to eq(Log.count)
    end

    it 'does not bother saving `fun` or `debug` logs' do
      sign_in user
      Log.destroy_all
      LogDispatch.destroy_all
      before_count = Log.count
      dispatch_before = LogDispatch.count
      run_jobs_now do
        post :create,
             body: [
              { meta: { x: 1, y: 2, z: 3, type: "info" },
                channels: ["toast"],
                message: "one" },
              { meta: { x: 1, y: 2, z: 3, type: "fun" }, # Ignored
                channels: [],
                message: "two" },
              { meta: { x: 1, y: 2, z: 3, type: "debug" }, # Ignored
                channels: [],
                message: "two" },
              { meta: { x: 1, y: 2, z: 3, type: "info" },
                channels: ["email"],
                message: "three" },
             ].to_json,
             params: {format: :json}
        expect(response.status).to   eq(200)
        expect(Log.count).to         eq(before_count + 2)
        expect(LogDispatch.count).to eq(dispatch_before + 1)
      end
    end

    it 'Runs compaction when the logs pile up' do
      payl = []
      100.times do
        payl.push({ meta: { x: 1,
                            y: 2,
                            z: 3,
                            type: "info"
                          },
                    channels: ["toast"],
                    message: "one" })
      end
      sign_in user
      user.device.update_attributes!(max_log_count: 15)
      LogDispatch.destroy_all
      Log.destroy_all
      before_count = Log.count
      run_jobs_now do
        post :create, body: payl.to_json, params: {format: :json}
      end
      expect(response.status).to eq(200)
      expect(json.length).to eq(user.device.max_log_count)
    end

    it 'deletes ALL logs' do
      sign_in user
      before = user.device.logs.count
      delete :destroy, params: { id: "all" }
      expect(response.status).to eq(200)
      expect(user.device.reload.logs.count).to be < before
      expect(user.device.logs.count).to eq(0)
    end

    it 'delivers emails for logs marked as `email`' do
      sign_in user
      empty_mail_bag
      before_count = LogDispatch.count
      body         = { meta: { x: 1, y: 2, z: 3, type: "info" },
                       channels: ["email"],
                       message: "Heyoooo" }.to_json
      run_jobs_now do
        post :create, body: body, params: {format: :json}
        after_count = LogDispatch.count
        expect(response.status).to eq(200)
        expect(last_email).to be
        expect(last_email.body.to_s).to include("Heyoooo")
        expect(last_email.to).to include(user.email)
        expect(before_count).to be < after_count
        expect(LogDispatch.where(sent_at: nil).count).to eq(0)
      end
    end

    it 'delivers emails for logs marked as `fatal_email`' do
      message = "KABOOOOMM - SYSTEM ERROR!"
      sign_in user
      empty_mail_bag
      body         = { meta: { x: 1, y: 2, z: 3, type: "info" },
                       channels: ["fatal_email"],
                       message: message }.to_json
      run_jobs_now do
        post :create, body: body, params: {format: :json}
        expect(response.status).to eq(200)
        expect(last_email).to be
        expect(last_email.body.to_s).to include(message)
        expect(last_email.to).to include(user.email)
      end
    end

    it "handles bug that Connor reported" do
      sign_in user
      empty_mail_bag
      Log.destroy_all
      LogDispatch.destroy_all
      run_jobs_now do
        post :create,
             body: JSON_EXAMPLE,
             params: {format: :json}
        expect(last_email).to eq(nil)
      end
    end
  end

  describe "#search" do
    examples = [
      [1, "success"],
      [1, "busy"],
      [1, "warn"],
      [1, "error"],
      [1, "info"],
      [1, "fun"],
      [1, "debug"],

      [2, "success"],
      [2, "busy"],
      [2, "warn"],
      [2, "error"],
      [2, "info"],
      [2, "fun"],
      [2, "debug"],

      [3, "success"],
      [3, "busy"],
      [3, "warn"],
      [3, "error"],
      [3, "info"],
      [3, "fun"],
      [3, "debug"],
    ]

    it 'filters ALL logs based on log filtering settings in `WebAppConfig` ' do
      sign_in user
      Log.destroy_all
      conf  = user.device.web_app_config
      examples.map do |(verbosity, type)|
        FactoryBot.create(:log, device:    user.device,
                                verbosity: verbosity,
                                type:      type)
      end
      conf.update_attributes(success_log: 3,
                             busy_log:    3,
                             warn_log:    3,
                             error_log:   3,
                             info_log:    3,
                             fun_log:     3,
                             debug_log:   3)
      post :search
      expect(response.status).to eq(200)
      expect(json.length).to eq(0)
    end

    it 'filters NO logs based on log filtering settings in `WebAppConfig` ' do
      sign_in user
      Log.destroy_all
      conf  = user.device.web_app_config
      examples.map do |(verbosity, type)|
        FactoryBot.create(:log, device:    user.device,
                                verbosity: verbosity,
                                type:      type)
      end
      conf.update_attributes(success_log: 0,
                             busy_log:    0,
                             warn_log:    0,
                             error_log:   0,
                             info_log:    0,
                             fun_log:     0,
                             debug_log:   0)
      post :search
      expect(response.status).to eq(200)
      expect(json.length).to eq(examples.length)
    end
  end
end
